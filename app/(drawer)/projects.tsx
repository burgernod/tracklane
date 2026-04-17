import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    TextInput, Platform, Modal, Pressable, TouchableWithoutFeedback,
    Keyboard, ScrollView, Animated, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dm88hpprs/image/upload';
const UPLOAD_PRESET = 'ml_profile';

interface Project {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    member_count: number;
    my_role: 'admin' | 'reviewer' | 'member';
    owner_id: number;
}

export default function ProjectsListScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectImageUri, setNewProjectImageUri] = useState('');
    const [creating, setCreating] = useState(false);
    const [keyboardHeight] = useState(new Animated.Value(0));

    // Перезагружаем при каждом входе на экран
    useFocusEffect(
        useCallback(() => {
            fetchProjects();
        }, [])
    );

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, (e) => {
            Animated.timing(keyboardHeight, { toValue: e.endCoordinates?.height ?? 0, duration: 250, useNativeDriver: false }).start();
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            Animated.timing(keyboardHeight, { toValue: 0, duration: 250, useNativeDriver: false }).start();
        });
        return () => { showSub.remove(); hideSub.remove(); };
    }, [keyboardHeight]);

    const fetchProjects = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const res = await fetch(`${API_URL}/api/v1/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setProjects(data);
            else Alert.alert('Ошибка', data.detail || 'Не удалось загрузить проекты');
        } catch {
            Alert.alert('Ошибка сети');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const pickNewProjectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) setNewProjectImageUri(result.assets[0].uri);
    };

    const uploadImageToCloudinary = async (uri: string): Promise<string | null> => {
        const fileType = uri.split('.').pop();
        const formData = new FormData();
        formData.append('file', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
            name: `project.${fileType}`,
        } as any);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, {
            method: 'POST', body: formData,
            headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
        });
        const file = await res.json();
        return res.ok ? file.secure_url : null;
    };

    const createProject = async () => {
        const title = newProjectTitle.trim();
        if (!title) return;
        setCreating(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');

            // 1. Создаём проект
            const res = await fetch(`${API_URL}/api/v1/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description: newProjectDescription.trim() || null }),
            });
            const data = await res.json();
            if (!res.ok) { Alert.alert('Ошибка', data.detail); return; }

            // 2. Если выбрано фото — загружаем и обновляем
            if (newProjectImageUri) {
                const imageUrl = await uploadImageToCloudinary(newProjectImageUri);
                if (imageUrl) {
                    await fetch(`${API_URL}/api/v1/projects/${data.id}/image`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ image_url: imageUrl }),
                    });
                }
            }

            setNewProjectTitle(''); setNewProjectDescription(''); setNewProjectImageUri('');
            setIsCreateModalOpen(false);
            Keyboard.dismiss();
            fetchProjects(); // Обновляем список
        } catch {
            Alert.alert('Ошибка сети');
        } finally {
            setCreating(false);
        }
    };

    const filteredProjects = useMemo(() =>
        projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase())),
        [projects, search]
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4169E1" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Проекты</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.addButton} onPress={() => setIsCreateModalOpen(true)}>
                                <Ionicons name="add" size={22} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
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
                            />
                            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.projectsList}
                        contentContainerStyle={styles.projectsListContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => fetchProjects(true)} colors={['#4169E1']} />
                        }
                    >
                        {filteredProjects.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open-outline" size={52} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>Проектов пока нет</Text>
                                <Text style={styles.emptyText}>Создай первый проект через кнопку «+» сверху</Text>
                            </View>
                        ) : (
                            filteredProjects.map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    style={styles.projectCard}
                                    // Передаём ID проекта и роль в project-workspace
                                    onPress={() => router.push({
                                        pathname: '/project-workspace',
                                        params: { projectId: project.id, myRole: project.my_role }
                                    })}
                                >
                                    <View style={styles.projectLeft}>
                                        {project.image_url ? (
                                            <Image source={{ uri: project.image_url }} style={styles.projectIcon} contentFit="cover" />
                                        ) : (
                                            <View style={[styles.projectIcon, styles.projectIconPlaceholder]}>
                                                <Ionicons name="rocket-outline" size={18} color="#4169E1" />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.projectTitle}>{project.title}</Text>
                                            {!!project.description && (
                                                <Text style={styles.projectDescription} numberOfLines={1}>
                                                    {project.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.projectRight}>
                                        {/* Бейдж роли */}
                                        <View style={[styles.roleBadge, project.my_role === 'admin' && styles.roleBadgeAdmin]}>
                                            <Text style={[styles.roleBadgeText, project.my_role === 'admin' && styles.roleBadgeTextAdmin]}>
                                                {project.my_role === 'admin' ? 'Админ' : project.my_role === 'reviewer' ? 'Проверяющий' : 'Участник'}
                                            </Text>
                                        </View>
                                        <View style={styles.membersBadge}>
                                            <Ionicons name="people-outline" size={12} color="#6B7280" />
                                            <Text style={styles.membersCount}>{project.member_count}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ */}
                    <Modal visible={isCreateModalOpen} transparent animationType="slide" onRequestClose={() => setIsCreateModalOpen(false)}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback accessible={false}>
                                    <View style={styles.modalCard}>
                                        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                                            <Text style={styles.modalTitle}>Новый проект</Text>

                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Название проекта"
                                                value={newProjectTitle}
                                                onChangeText={setNewProjectTitle}
                                            />
                                            <TextInput
                                                style={[styles.modalInput, styles.modalTextarea]}
                                                placeholder="Описание (необязательно)"
                                                multiline
                                                value={newProjectDescription}
                                                onChangeText={setNewProjectDescription}
                                                textAlignVertical="top"
                                            />

                                            {/* Фото проекта */}
                                            <Text style={styles.modalFieldTitle}>Фото проекта</Text>
                                            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickNewProjectImage}>
                                                {newProjectImageUri ? (
                                                    <Image source={{ uri: newProjectImageUri }} style={styles.imagePreview} contentFit="cover" />
                                                ) : (
                                                    <View style={styles.imagePickerPlaceholder}>
                                                        <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                                                        <Text style={styles.imagePickerText}>Выбрать фото</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            {newProjectImageUri ? (
                                                <TouchableOpacity onPress={() => setNewProjectImageUri('')} style={styles.removeImageBtn}>
                                                    <Text style={styles.removeImageBtnText}>Удалить фото</Text>
                                                </TouchableOpacity>
                                            ) : null}

                                            <View style={styles.modalActions}>
                                                <Pressable style={styles.modalSecondaryButton} onPress={() => { setIsCreateModalOpen(false); setNewProjectTitle(''); setNewProjectDescription(''); setNewProjectImageUri(''); }}>
                                                    <Text style={styles.modalSecondaryButtonText}>Отмена</Text>
                                                </Pressable>
                                                <Pressable style={[styles.modalPrimaryButton, creating && { opacity: 0.7 }]} onPress={createProject} disabled={creating}>
                                                    {creating ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.modalPrimaryButtonText}>Создать</Text>}
                                                </Pressable>
                                            </View>
                                            <Animated.View style={{ height: keyboardHeight }} />
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
    content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    addButton: { backgroundColor: '#4169E1', width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    actionBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 15, height: 45 },
    searchInput: { flex: 1, fontSize: 14 },
    searchIcon: { marginLeft: 5 },
    projectsList: { flex: 1 },
    projectsListContent: { paddingBottom: 20 },
    projectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
    projectLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
    projectIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    projectIconPlaceholder: { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
    projectTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    projectDescription: { marginTop: 2, fontSize: 12, color: '#6B7280' },
    projectRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    roleBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    roleBadgeAdmin: { backgroundColor: '#EEF2FF' },
    roleBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    roleBadgeTextAdmin: { color: '#4169E1' },
    membersBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    membersCount: { fontSize: 12, color: '#6B7280' },
    emptyState: { marginTop: 60, alignItems: 'center', paddingHorizontal: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 12, marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', overflow: 'hidden' },
    modalScrollContent: { padding: 20, paddingBottom: 12 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
    modalFieldTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 4 },
    modalInput: { height: 46, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 12, marginBottom: 10, color: '#111827', backgroundColor: '#FFF' },
    modalTextarea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
    imagePickerBtn: { marginBottom: 8 },
    imagePickerPlaceholder: { height: 90, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
    imagePickerText: { fontSize: 13, color: '#9CA3AF' },
    imagePreview: { width: '100%', height: 120, borderRadius: 14 },
    removeImageBtn: { marginBottom: 10 },
    removeImageBtnText: { fontSize: 12, color: '#E84142', fontWeight: '600' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
    modalSecondaryButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F3F4F6' },
    modalSecondaryButtonText: { color: '#111827', fontWeight: '600' },
    modalPrimaryButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: '#4169E1' },
    modalPrimaryButtonText: { color: '#FFF', fontWeight: '600' },
});