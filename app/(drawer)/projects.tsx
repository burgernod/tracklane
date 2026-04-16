import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Platform,
    Modal,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

interface Project {
    id: string;
    title: string;
    tasksCount: number;
    description?: string;
}

export default function ProjectsListScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            title: 'Проект Аврора',
            tasksCount: 28,
            description: 'Основной проект команды',
        },
    ]);

    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const [keyboardHeight] = useState(new Animated.Value(0));

    useEffect(() => {
        const showEvent =
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent =
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (event) => {
            Animated.timing(keyboardHeight, {
                toValue: event.endCoordinates?.height ?? 0,
                duration: Platform.OS === 'ios' ? 250 : 180,
                useNativeDriver: false,
            }).start();
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? 250 : 180,
                useNativeDriver: false,
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardHeight]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) =>
            project.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [projects, search]);

    const createProject = () => {
        const title = newProjectTitle.trim();

        if (!title) return;

        const newProject: Project = {
            id: Date.now().toString(),
            title,
            tasksCount: 0,
            description: newProjectDescription.trim(),
        };

        setProjects((prev) => [newProject, ...prev]);
        setNewProjectTitle('');
        setNewProjectDescription('');
        setIsCreateModalOpen(false);
        Keyboard.dismiss();
    };

    const closeModal = () => {
        Keyboard.dismiss();
        setIsCreateModalOpen(false);
        setNewProjectTitle('');
        setNewProjectDescription('');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Проекты</Text>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsCreateModalOpen(true)}
                            >
                                <Ionicons name="add" size={22} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            >
                                <Feather name="menu" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.actionBar}>
                        <View style={styles.searchBox}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Поиск проекта"
                                placeholderTextColor="#888"
                                value={search}
                                onChangeText={setSearch}
                                returnKeyType="search"
                            />
                            <Ionicons
                                name="search"
                                size={20}
                                color="#888"
                                style={styles.searchIcon}
                            />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.projectsList}
                        contentContainerStyle={styles.projectsListContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {filteredProjects.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>Проекты не найдены</Text>
                                <Text style={styles.emptyText}>
                                    Создай новый проект через кнопку сверху
                                </Text>
                            </View>
                        ) : (
                            filteredProjects.map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    style={styles.projectCard}
                                    onPress={() => router.push('/project-workspace')}
                                >
                                    <View style={styles.projectLeft}>
                                        <Image
                                            source={require('../../assets/images/tracklane-logo-circle.svg')}
                                            style={styles.projectIcon}
                                            contentFit="contain"
                                        />
                                        <View>
                                            <Text style={styles.projectTitle}>{project.title}</Text>
                                            {!!project.description && (
                                                <Text style={styles.projectDescription}>
                                                    {project.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.projectRight}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{project.tasksCount}</Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color="#A0A0A0"
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    <Modal
                        visible={isCreateModalOpen}
                        transparent
                        animationType="slide"
                        onRequestClose={closeModal}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback accessible={false}>
                                    <View style={styles.modalCard}>
                                        <ScrollView
                                            keyboardShouldPersistTaps="handled"
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.modalScrollContent}
                                        >
                                            <Text style={styles.modalTitle}>Новый проект</Text>

                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Название проекта"
                                                value={newProjectTitle}
                                                onChangeText={setNewProjectTitle}
                                                returnKeyType="next"
                                            />

                                            <TextInput
                                                style={[styles.modalInput, styles.modalTextarea]}
                                                placeholder="Описание проекта"
                                                multiline
                                                value={newProjectDescription}
                                                onChangeText={setNewProjectDescription}
                                                textAlignVertical="top"
                                            />

                                            <View style={styles.modalActions}>
                                                <Pressable
                                                    style={styles.modalSecondaryButton}
                                                    onPress={closeModal}
                                                >
                                                    <Text style={styles.modalSecondaryButtonText}>
                                                        Отмена
                                                    </Text>
                                                </Pressable>

                                                <Pressable
                                                    style={styles.modalPrimaryButton}
                                                    onPress={createProject}
                                                >
                                                    <Text style={styles.modalPrimaryButtonText}>
                                                        Создать
                                                    </Text>
                                                </Pressable>
                                            </View>

                                            <Animated.View
                                                style={{ height: keyboardHeight }}
                                            />
                                        </ScrollView>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    searchIcon: {
        marginLeft: 5,
    },

    addButton: {
        backgroundColor: '#4169E1',
        width: 45,
        height: 45,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    projectsList: {
        flex: 1,
    },
    projectsListContent: {
        paddingBottom: 12,
    },

    projectCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        marginBottom: 12,
    },
    projectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    projectIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 15,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    projectDescription: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },
    projectRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#4169E1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    emptyState: {
        marginTop: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },

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
        paddingBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },
    modalInput: {
        height: 46,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 12,
        marginBottom: 10,
        color: '#111827',
        backgroundColor: '#FFF',
    },
    modalTextarea: {
        height: 100,
        paddingTop: 12,
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
});