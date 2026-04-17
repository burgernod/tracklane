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
    Alert
} from 'react-native';
import {Ionicons, Feather} from '@expo/vector-icons';
import {useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import {DrawerActions} from '@react-navigation/native';
import {Image} from 'expo-image';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL; 


interface AvailableUser {
    id: string;
    username: string;
    avatar_url: string | null;
}

type TeamRole = 'admin' | 'reviewer' | 'member';

interface TeamMember {
    id: string;
    name: string;
    color: string;
    role: TeamRole;
}

export default function TeamManagementScreen() {
    const { projectId, myRole } = useLocalSearchParams<{ projectId: string; myRole: string }>();
    
    // Защита: если нет projectId — назад
    useEffect(() => {
        if (!projectId) router.back();
    }, []);

    // Загрузка участников
    useEffect(() => {
        if (projectId) fetchMembers();
    }, [projectId]);

    const fetchMembers = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setMembers(data); // data = [{user_id, username, role, is_me, avatar_url}]
        } catch (e) { console.error(e); }
    };

    // Удаление участника
    const removeMember = async (userId: number) => {
        Alert.alert('Удалить участника?', 'Вы уверены?', [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Удалить', style: 'destructive', onPress: async () => {
                const token = await SecureStore.getItemAsync('userToken');
                const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/members/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) fetchMembers();
                else { const err = await res.json(); Alert.alert('Ошибка', err.detail); }
            }}
        ]);
    };
    
    // В addUserToProject — заменить projectId = 1 на:
    const projectIdNum = Number(projectId);

    const navigation = useNavigation();
    const router = useRouter();

    // СОСТОЯНИЯ (Внутри компонента)
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [foundUsers, setFoundUsers] = useState<AvailableUser[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<TeamRole>('member');
    const [loading, setLoading] = useState(false);

    // 1. Поиск пользователей (Debounce логика)
    useEffect(() => {
        if (userSearch.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchUsersAPI(userSearch);
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setFoundUsers([]);
        }
    }, [userSearch]);

    const searchUsersAPI = async (query: string) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`${API_URL}/api/v1/users/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setFoundUsers(data);
        } catch (e) {
            console.error("Ошибка поиска", e);
        }
    };

    // 2. Добавление участника в проект на сервер
    const addUserToProject = async (user: AvailableUser) => {
        setLoading(true);
        try {
            // В реальности тут нужен ID проекта, пока используем заглушку 1
            const projectId = 1; 
            const token = await SecureStore.getItemAsync('userToken');
            
            const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/members?user_id=${user.id}&role=${selectedRole}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                Alert.alert("Успех", `${user.username} добавлен как ${selectedRole}`);
                // Локально обновляем список (опционально, лучше сделать fetchMembers)
                setIsModalOpen(false);
                setUserSearch('');
            } else {
                const err = await res.json();
                Alert.alert("Ошибка", err.detail);
            }
        } catch (e) {
            Alert.alert("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    const ROLE_LABELS: Record<TeamRole, string> = {
        admin: 'Админы',
        reviewer: 'Проверяющие',
        member: 'Участники',
    };

    const ROLE_ORDER: TeamRole[] = ['admin', 'reviewer', 'member'];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header ... */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Управление командой</Text>
                    <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addButton}>
                        <Ionicons name="person-add" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                     {/* Список участников по ролям ... используйте вашу логику ROLE_ORDER */}
                </ScrollView>

                {/* МОДАЛЬНОЕ ОКНО ПОИСКА */}
                <Modal visible={isModalOpen} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Добавить участника</Text>
                            <TextInput 
                                style={styles.modalInput}
                                placeholder="Введите email или никнейм..."
                                value={userSearch}
                                onChangeText={setUserSearch}
                            />

                            <Text style={styles.roleTitle}>Выберите роль</Text>
                            <View style={styles.rolesRow}>
                                {ROLE_ORDER.map(r => (
                                    <TouchableOpacity 
                                        key={r} 
                                        onPress={() => setSelectedRole(r)}
                                        style={[styles.roleChip, selectedRole === r && styles.roleChipActive]}
                                    >
                                        <Text style={[styles.roleChipText, selectedRole === r && {color: '#FFF'}]}>
                                            {ROLE_LABELS[r]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <ScrollView style={{maxHeight: 200}}>
                                {foundUsers.map(user => (
                                    <TouchableOpacity 
                                        key={user.id} 
                                        style={styles.selectableUserRow}
                                        onPress={() => addUserToProject(user)}
                                    >
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <View style={[styles.avatar, {backgroundColor: '#4169E1'}]} />
                                            <Text style={styles.userName}>{user.username}</Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color="#4169E1" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.modalSecondaryButton}>
                                <Text>Закрыть</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
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
    selectableUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    emptyUsersText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 8,
    },
});