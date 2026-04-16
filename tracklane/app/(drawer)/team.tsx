import React, {useEffect, useMemo, useState} from 'react';
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
    Animated,
} from 'react-native';

import {Ionicons, Feather} from '@expo/vector-icons';
import {useNavigation} from 'expo-router';
import {DrawerActions} from '@react-navigation/native';
import {Image} from 'expo-image';

type TeamRole = 'admin' | 'reviewer' | 'member';

interface TeamMember {
    id: string;
    name: string;
    color: string;
    role: TeamRole;
}

const ROLE_LABELS: Record<TeamRole, string> = {
    admin: 'Админы',
    reviewer: 'Проверяющие',
    member: 'Участники',
};

const ROLE_ORDER: TeamRole[] = ['admin', 'reviewer', 'member'];

const randomAvatarColors = ['#FCA311', '#2EC4B6', '#FF6B6B', '#A0A0A0', '#000000', '#E84142', '#7C3AED', '#0EA5E9'];

const UserRow = ({
                     name,
                     color,
                     onRemove,
                 }: {
    name: string;
    color: string;
    onRemove?: () => void;
}) => (
    <View style={styles.userRow}>
        <View style={styles.userLeft}>
            <View style={[styles.avatar, {backgroundColor: color}]}/>
            <Text style={styles.userName}>{name}</Text>
        </View>

        {onRemove && (
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
                <Ionicons name="close" size={18} color="#666"/>
            </TouchableOpacity>
        )}
    </View>
);

export default function TeamManagementScreen() {
    const navigation = useNavigation();

    const [members, setMembers] = useState<TeamMember[]>([
        {id: '1', name: 'Крис Эванс', color: '#FCA311', role: 'admin'},
        {id: '2', name: 'Джон Джонсон', color: '#2EC4B6', role: 'reviewer'},
        {id: '3', name: 'Крис Эванс', color: '#FF6B6B', role: 'member'},
        {id: '4', name: 'Джон Джонсон', color: '#A0A0A0', role: 'member'},
        {id: '5', name: 'Крис Эванс', color: '#000000', role: 'member'},
        {id: '6', name: 'Джон Джонсон', color: '#E84142', role: 'member'},
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [selectedRole, setSelectedRole] = useState<TeamRole>('member');

    const groupedMembers = useMemo(() => {
        return {
            admin: members.filter((member) => member.role === 'admin'),
            reviewer: members.filter((member) => member.role === 'reviewer'),
            member: members.filter((member) => member.role === 'member'),
        };
    }, [members]);

    const closeModal = () => {
        Keyboard.dismiss();
        setIsModalOpen(false);
        setNewMemberName('');
        setSelectedRole('member');
    };

    const addMember = () => {
        const trimmedName = newMemberName.trim();
        if (!trimmedName) return;

        const randomColor =
            randomAvatarColors[Math.floor(Math.random() * randomAvatarColors.length)];

        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: trimmedName,
            color: randomColor,
            role: selectedRole,
        };

        setMembers((prev) => [...prev, newMember]);
        closeModal();
    };

    const removeMember = (id: string) => {
        setMembers((prev) => prev.filter((member) => member.id !== id));
    };

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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#000"/>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Управление Командой</Text>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsModalOpen(true)}
                            >
                                <Ionicons name="person-add" size={20} color="#FFF"/>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            >
                                <Feather name="menu" size={28} color="#000"/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.projectInfoRow}>
                            <View style={styles.projectLeft}>
                                <Image
                                    source={require('../../assets/images/tracklane-logo-circle.svg')}
                                    style={styles.projectIcon}
                                    contentFit="contain"
                                />
                                <View>
                                    <Text style={styles.projectTitle}>Проект Аврора</Text>
                                    <Text style={styles.projectSubtitle}>
                                        Всего участников: {members.length}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {ROLE_ORDER.map((role, index) => {
                            const roleMembers = groupedMembers[role];

                            return (
                                <View key={role}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>{ROLE_LABELS[role]}</Text>
                                        <Ionicons
                                            name="people-circle"
                                            size={18}
                                            color="#4169E1"
                                            style={{marginLeft: 8}}
                                        />
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>{roleMembers.length}</Text>
                                        </View>
                                    </View>

                                    {roleMembers.length === 0 ? (
                                        <Text style={styles.emptyRoleText}>Пока никого нет</Text>
                                    ) : (
                                        roleMembers.map((user) => (
                                            <UserRow
                                                key={user.id}
                                                name={user.name}
                                                color={user.color}
                                                onRemove={() => removeMember(user.id)}
                                            />
                                        ))
                                    )}

                                    {index !== ROLE_ORDER.length - 1 && <View style={styles.divider}/>}
                                </View>
                            );
                        })}
                    </ScrollView>

                    <Modal
                        visible={isModalOpen}
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
                                            <Text style={styles.modalTitle}>Добавить человека</Text>

                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Имя участника"
                                                value={newMemberName}
                                                onChangeText={setNewMemberName}
                                                returnKeyType="done"
                                            />

                                            <Text style={styles.roleTitle}>Выбери роль</Text>

                                            <View style={styles.rolesRow}>
                                                {ROLE_ORDER.map((role) => {
                                                    const active = selectedRole === role;

                                                    return (
                                                        <TouchableOpacity
                                                            key={role}
                                                            style={[
                                                                styles.roleChip,
                                                                active && styles.roleChipActive,
                                                            ]}
                                                            onPress={() => setSelectedRole(role)}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.roleChipText,
                                                                    active && styles.roleChipTextActive,
                                                                ]}
                                                            >
                                                                {ROLE_LABELS[role]}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>

                                            <View style={styles.modalActions}>
                                                <Pressable
                                                    style={styles.modalSecondaryButton}
                                                    onPress={closeModal}
                                                >
                                                    <Text style={styles.modalSecondaryButtonText}>Отмена</Text>
                                                </Pressable>

                                                <Pressable
                                                    style={styles.modalPrimaryButton}
                                                    onPress={addMember}
                                                >
                                                    <Text style={styles.modalPrimaryButtonText}>Добавить</Text>
                                                </Pressable>
                                            </View>

                                            <Animated.View style={{height: keyboardHeight}}/>
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
    container: {flex: 1, backgroundColor: '#FAFAFA'},
    content: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flexShrink: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addButton: {
        backgroundColor: '#4169E1',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    projectInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    projectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    projectSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    countBadge: {
        marginLeft: 10,
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    countBadgeText: {
        color: '#4169E1',
        fontSize: 12,
        fontWeight: '700',
    },

    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    userLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    userName: {
        fontSize: 16,
        color: '#666',
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },

    emptyRoleText: {
        color: '#9CA3AF',
        marginBottom: 15,
    },

    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
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
        marginBottom: 14,
        color: '#111827',
        backgroundColor: '#FFF',
    },
    roleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },
    rolesRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    roleChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
    },
    roleChipActive: {
        backgroundColor: '#4169E1',
    },
    roleChipText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    },
    roleChipTextActive: {
        color: '#FFF',
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
    modalScrollContent: {
        padding: 20,
        paddingBottom: 12,
    },
});