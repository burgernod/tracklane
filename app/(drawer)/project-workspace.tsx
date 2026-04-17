import React, {useMemo, useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
    Modal,
    TextInput,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import {Ionicons, Feather} from '@expo/vector-icons';
import { useRouter, useNavigation} from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import {DrawerActions} from '@react-navigation/native';
import {Image} from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Компонент Канбан-кнопки с раскрывающимся списком
const KanbanButton = ({count, title, color, isExpanded, onToggle}: any) => (
    <View style={styles.kanbanWrapper}>
        <TouchableOpacity
            style={[styles.kanbanBtn, {
                backgroundColor: color,
                borderBottomLeftRadius: isExpanded ? 5 : 30,
                borderBottomRightRadius: isExpanded ? 5 : 30
            }]}
            onPress={onToggle}
        >
            <View style={styles.kanbanLeft}>
                <View style={styles.kanbanBadge}><Text style={[styles.kanbanBadgeText, {color}]}>{count}</Text></View>
                <Text style={styles.kanbanTitle}>{title}</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FFF"/>
        </TouchableOpacity>

        {/* Раскрывающаяся часть */}
        {isExpanded && (
            <View style={[styles.expandedContent, {borderColor: color}]}>
                <Text style={{color: '#666', fontSize: 12, marginBottom: 10}}>Список задач...</Text>
                <View style={styles.dummyTaskRow}>
                    <View style={[styles.taskDot, {backgroundColor: color}]}/>
                    <Text style={styles.taskText}>Задача в секции "{title}"</Text>
                </View>
            </View>
        )}
    </View>
);

export default function ProjectWorkspaceScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

    const defaultProjectImage = require('../../assets/images/tracklane-logo-circle.svg');

    const { projectId, myRole } = useLocalSearchParams<{ projectId: string; myRole: string }>();

    const [project, setProject] = useState({
        title: '',
        description: '',
        imageUri: '',
        accent: '#4169E1',
        owner_id: 0,
    });

    // Загрузка данных проекта при входе
    useEffect(() => {
        if (projectId) fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`${API_URL}/api/v1/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const found = data.find((p: any) => p.id === Number(projectId));
                if (found) {
                    setProject({
                        title: found.title,
                        description: found.description || '',
                        imageUri: found.image_url || '',
                        accent: '#4169E1',
                        owner_id: found.owner_id,
                    });
                }
            }
        } catch (e) { console.error(e); }
    };

    const [draftProject, setDraftProject] = useState({
        title: project.title,
        description: project.description,
        accent: project.accent,
        imageUri: project.imageUri,
    });

    const openProjectSettings = () => {
        setDraftProject({
            title: project.title,
            description: project.description,
            accent: project.accent,
            imageUri: project.imageUri,
        });
        setProjectSettingsOpen(true);
    };

    const closeProjectSettings = () => {
        Keyboard.dismiss();
        setProjectSettingsOpen(false);
    };

    const saveProjectSettings = () => {
        setProject((prev) => ({
            ...prev,
            title: draftProject.title.trim() || prev.title,
            description: draftProject.description.trim(),
            accent: draftProject.accent,
            imageUri: draftProject.imageUri,
        }));
        closeProjectSettings();
    };

    const pickProjectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setDraftProject((prev) => ({
                ...prev,
                imageUri: result.assets[0].uri,
            }));
        }
    };

    // Состояния
    const [expandedKanban, setExpandedKanban] = useState<string | null>(null);
    const [isActivityExpanded, setIsActivityExpanded] = useState(true);

    const toggleKanban = (title: string) => {
        setExpandedKanban(prev => prev === title ? null : title);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => router.back()} style={{marginRight: 15}}>
                                <Ionicons name="arrow-back" size={24} color="#000"/>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Обзор проекта</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Feather name="menu" size={28} color="#000"/>
                        </TouchableOpacity>
                    </View>

                    {/* Инфо о проекте */}
                    <View style={styles.projectInfoRow}>
                        <View style={styles.projectLeft}>
                            <Image
                                source={project.imageUri ? { uri: project.imageUri } : defaultProjectImage}
                                style={styles.projectIcon}
                                contentFit="cover"
                            />
                            <Text style={styles.projectTitle}>{project.title}</Text>
                        </View>
                        <TouchableOpacity onPress={openProjectSettings}>
                            <Ionicons name="settings-outline" size={24} color={project.accent}/>
                        </TouchableOpacity>
                    </View>

                    {/* Участники */}
                    {myRole === 'admin' && (
                        <TouchableOpacity
                            style={styles.manageTeamBtn}
                            onPress={() => router.push({
                                pathname: '/team',
                                params: { projectId, myRole }
                            })}
                        >
                            <Ionicons name="settings-outline" size={14} color="#4169E1" />
                            <Text style={styles.manageTeamBtnText}>Управление</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.avatarsContainer}>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80'}}
                               style={styles.avatar}/>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}}
                               style={[styles.avatar, {marginLeft: -15}]}/>
                        <Image source={{uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80'}}
                               style={[styles.avatar, {marginLeft: -15}]}/>
                        <View style={[styles.avatarMore, {marginLeft: -15}]}><Text
                            style={styles.avatarMoreText}>+2</Text></View>
                    </View>

                    {/* Активность (Сворачиваемая) */}
                    <TouchableOpacity style={[styles.sectionRow, {marginTop: 30}]}
                                      onPress={() => setIsActivityExpanded(!isActivityExpanded)}>
                        <Text style={styles.sectionTitle}>Недавняя активность</Text>
                        <Ionicons name={isActivityExpanded ? "chevron-down" : "chevron-forward"} size={20}
                                  color="#A0A0A0"/>
                    </TouchableOpacity>

                    {isActivityExpanded && (
                        <TouchableOpacity style={styles.activityCard} onPress={() => router.push('/task')}>
                            <View style={styles.activityTimeBadge}><Text style={styles.activityTimeText}>2 часа
                                назад</Text></View>
                            <View style={styles.activityBody}>
                                <Text style={styles.activityText}>Целевая страница находится на рассмотрении</Text>
                                <Ionicons name="heart" size={22} color="#E84142"/>
                            </View>
                            <View style={styles.activityAvatars}>
                                <Image
                                    source={{uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80'}}
                                    style={styles.smallAvatar}/>
                                <Image
                                    source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}}
                                    style={[styles.smallAvatar, {marginLeft: -10}]}/>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Канбан */}
                    <View style={[styles.sectionRow, {marginTop: 30, marginBottom: 15}]}>
                        <Text style={styles.sectionTitle}>Канбан</Text>
                        <TouchableOpacity style={[styles.addBtn, {backgroundColor: project.accent}]}>
                            <Ionicons name="add" size={20} color="#FFF"/>
                        </TouchableOpacity>
                    </View>

                    <KanbanButton count="9" title="Запланировано" color="#E84142"
                                  isExpanded={expandedKanban === 'Запланировано'}
                                  onToggle={() => toggleKanban('Запланировано')}/>
                    <KanbanButton count="12" title="В процессе" color="#4169E1"
                                  isExpanded={expandedKanban === 'В процессе'}
                                  onToggle={() => toggleKanban('В процессе')}/>
                    <KanbanButton count="3" title="На рассмотрении" color="#FACC15"
                                  isExpanded={expandedKanban === 'На рассмотрении'}
                                  onToggle={() => toggleKanban('На рассмотрении')}/>
                    <KanbanButton count="8" title="Закончены" color="#22C55E"
                                  isExpanded={expandedKanban === 'Закончены'}
                                  onToggle={() => toggleKanban('Закончены')}/>

                </View>
            </ScrollView>

            <Modal
                visible={projectSettingsOpen}
                transparent
                animationType="slide"
                onRequestClose={closeProjectSettings}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback accessible={false}>
                            <View style={styles.modalCard}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.modalScrollContent}
                                >
                                    <Text style={styles.modalTitle}>Настройки проекта</Text>

                                    <Text style={styles.modalFieldTitle}>Название проекта</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={draftProject.title}
                                        onChangeText={(text) =>
                                            setDraftProject((prev) => ({...prev, title: text}))
                                        }
                                        placeholder="Название проекта"
                                    />

                                    <Text style={styles.modalFieldTitle}>Описание</Text>
                                    <TextInput
                                        style={[styles.modalInput, styles.modalTextarea]}
                                        value={draftProject.description}
                                        onChangeText={(text) =>
                                            setDraftProject((prev) => ({...prev, description: text}))
                                        }
                                        placeholder="Описание проекта"
                                        multiline
                                    />

                                    <Text style={styles.modalFieldTitle}>Акцентный цвет</Text>
                                    <View style={styles.colorRow}>
                                        {['#4169E1', '#22C55E', '#F59E0B', '#E84142', '#7C3AED', '#111827'].map((color) => {
                                            const active = draftProject.accent === color;

                                            return (
                                                <TouchableOpacity
                                                    key={color}
                                                    onPress={() =>
                                                        setDraftProject((prev) => ({...prev, accent: color}))
                                                    }
                                                    style={[
                                                        styles.colorOption,
                                                        {backgroundColor: color},
                                                        active && styles.colorOptionActive,
                                                    ]}
                                                />
                                            );
                                        })}
                                    </View>

                                    <Text style={styles.modalFieldTitle}>Фото проекта</Text>
                                    <View style={styles.projectPreviewRow}>
                                        <Image
                                            source={draftProject.imageUri ? { uri: draftProject.imageUri } : defaultProjectImage}
                                            style={styles.projectPreviewImage}
                                            contentFit="cover"
                                        />

                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.projectPreviewText}>
                                                Выбери фото проекта из галереи
                                            </Text>

                                            {draftProject.imageUri ? (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        setDraftProject((prev) => ({ ...prev, imageUri: '' }))
                                                    }
                                                    style={styles.removeImageButton}
                                                >
                                                    <Text style={styles.removeImageButtonText}>Удалить фото</Text>
                                                </TouchableOpacity>
                                            ) : null}

                                            <TouchableOpacity
                                                style={[styles.pickImageButton, { backgroundColor: draftProject.accent }]}
                                                onPress={pickProjectImage}
                                            >
                                                <Text style={styles.pickImageButtonText}>Выбрать фото</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <Pressable
                                            style={styles.modalSecondaryButton}
                                            onPress={closeProjectSettings}
                                        >
                                            <Text style={styles.modalSecondaryButtonText}>Отмена</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.modalPrimaryButton, {backgroundColor: draftProject.accent}]}
                                            onPress={saveProjectSettings}
                                        >
                                            <Text style={styles.modalPrimaryButtonText}>Сохранить</Text>
                                        </Pressable>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#FAFAFA'},
    content: {padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10},
    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30},
    headerLeft: {flexDirection: 'row', alignItems: 'center'},
    headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#1A1A1A'},

    projectInfoRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30},
    projectLeft: {flexDirection: 'row', alignItems: 'center'},
    projectIcon: {width: 40, height: 40, borderRadius: 20, marginRight: 15},
    projectTitle: {fontSize: 18, fontWeight: 'bold', color: '#1A1A1A'},

    sectionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15},
    sectionTitle: {fontSize: 14, color: '#666'},

    avatarsContainer: {flexDirection: 'row', alignItems: 'center'},
    avatar: {width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#DFE4F2'},
    avatarMore: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DFE4F2',
        borderWidth: 2,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarMoreText: {color: '#4169E1', fontSize: 12, fontWeight: 'bold'},

    // Карточка активности (как на скрине из Dashboard)
    activityCard: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 10
    },
    activityTimeBadge: {
        position: 'absolute',
        top: -12,
        left: 15,
        backgroundColor: '#4169E1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10
    },
    activityTimeText: {color: '#FFF', fontSize: 10, fontWeight: 'bold'},
    activityBody: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
    activityText: {fontSize: 14, color: '#1A1A1A', fontWeight: '600', flex: 1, marginRight: 15, lineHeight: 20},
    activityAvatars: {position: 'absolute', bottom: -12, right: 10, flexDirection: 'row'},
    smallAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FFF',
        backgroundColor: '#DFE4F2'
    },

    addBtn: {
        backgroundColor: '#4169E1',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // Канбан аккордеон
    kanbanWrapper: {marginBottom: 15},
    kanbanBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    kanbanLeft: {flexDirection: 'row', alignItems: 'center'},
    kanbanBadge: {
        backgroundColor: '#FFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    kanbanBadgeText: {fontWeight: 'bold', fontSize: 14},
    kanbanTitle: {color: '#FFF', fontSize: 16, fontWeight: '600'},

    expandedContent: {
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderWidth: 1,
        borderTopWidth: 0,
        padding: 15
    },
    dummyTaskRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
    taskDot: {width: 8, height: 8, borderRadius: 4, marginRight: 10},
    taskText: {fontSize: 14, color: '#333'},

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },

    modalCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        overflow: 'hidden',
    },

    modalScrollContent: {
        padding: 20,
        paddingBottom: 24,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },

    modalFieldTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
        marginTop: 4,
    },

    modalInput: {
        height: 46,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 12,
        marginBottom: 12,
        color: '#111827',
        backgroundColor: '#FFF',
    },

    modalTextarea: {
        height: 100,
        paddingTop: 12,
        textAlignVertical: 'top',
    },

    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },

    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },

    colorOptionActive: {
        borderWidth: 3,
        borderColor: '#111827',
    },

    projectPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    projectPreviewImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },

    projectPreviewText: {
        flex: 1,
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },

    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 8,
    },

    modalSecondaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
    },

    modalSecondaryButtonText: {
        color: '#111827',
        fontWeight: '600',
    },

    modalPrimaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#4169E1',
    },

    modalPrimaryButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    pickImageButton: {
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },

    pickImageButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    removeImageButton: {
        marginTop: 8,
    },

    removeImageButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E84142',
    },

    manageTeamBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    manageTeamBtnText: { fontSize: 12, color: '#4169E1', fontWeight: '600' },
});