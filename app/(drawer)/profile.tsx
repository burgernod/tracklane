import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { DrawerActions, CommonActions } from '@react-navigation/native';
import { useRootNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dm88hpprs/image/upload';
const UPLOAD_PRESET = 'ml_profile';

export default function UserProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const rootNavigation = useRootNavigation();

  // Состояния для данных пользователя
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Стейты для смены пароля
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Функция выбора и загрузки фото
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
  setSaving(true);
  
  // Получаем расширение файла
  const fileType = uri.split('.').pop();
  
  const data = new FormData();
  // Формируем объект файла правильно для React Native
  data.append('file', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
    name: `avatar.${fileType}`,
  } as any);
  
  data.append('upload_preset', UPLOAD_PRESET);

  try {
    console.log("Начинаю загрузку в Cloudinary...");
    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const file = await res.json();
    
    if (!res.ok) {
      console.log("Ошибка Cloudinary:", file);
      throw new Error(file.error?.message || "Cloudinary error");
    }

    const imageUrl = file.secure_url;
    console.log("Фото загружено в облако:", imageUrl);

    // Сохраняем ссылку в нашу БД
    const token = await SecureStore.getItemAsync('userToken');
    const dbRes = await fetch(`${API_URL}/api/v1/users/me/avatar`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ avatar_url: imageUrl })
    });

    if (dbRes.ok) {
      setAvatarUrl(imageUrl);
      Alert.alert("Успех", "Фото профиля сохранено в базе данных");
    } else {
      const dbErr = await dbRes.json();
      console.log("Ошибка БД:", dbErr);
      Alert.alert("Ошибка", "Ссылка не сохранилась в БД");
    }
  } catch (e: any) {
    console.log("Полная ошибка процесса:", e);
    Alert.alert("Ошибка", e.message || "Не удалось загрузить фото");
  } finally {
    setSaving(false);
  }
};

const removeImage = () => {
    console.log("Кнопка удаления нажата"); // Для отладки в консоли
    Alert.alert(
      "Удалить фото",
      "Вы уверены?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              const token = await SecureStore.getItemAsync('userToken');
              console.log("Отправка запроса на удаление...");
              
              const response = await fetch(`${API_URL}/api/v1/users/me/avatar`, {
                method: 'PATCH',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ avatar_url: null }) 
              });

              if (response.ok) {
                setAvatarUrl(null); // Убираем из UI
                Alert.alert("Успех", "Фото удалено из профиля");
              } else {
                const errorData = await response.json();
                console.log("Ошибка сервера:", errorData);
                Alert.alert("Ошибка", "Сервер не разрешил удалить фото");
              }
            } catch (e) {
              console.log("Ошибка сети:", e);
              Alert.alert("Ошибка", "Нет связи с сервером");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Ошибка", "Новые пароли не совпадают");
      return;
    }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_URL}/api/v1/users/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      if (response.ok) {
        Alert.alert("Успех", "Пароль изменен");
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        const err = await response.json();
        Alert.alert("Ошибка", err.detail);
      }
    } catch (e) { Alert.alert("Ошибка сети"); }
    finally { setSaving(false); }
  };

  // 1. Загрузка данных при входе на экран
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    const response = await fetch(`${API_URL}/api/v1/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setUsername(data.username);
      setEmail(data.email);
      // ВАЖНО: Добавляем установку аватара
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    }
  } catch (e) {
    console.log("Ошибка загрузки профиля:", e);
  } finally {
    setLoading(false);
  }
};


  // 2. Логика сохранения изменений
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username,
          email: email
        })
      });

      if (response.ok) {
        Alert.alert("Успех", "Профиль обновлен");
      } else {
        const err = await response.json();
        Alert.alert("Ошибка", err.detail || "Не удалось обновить");
      }
    } catch (e) {
      Alert.alert("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

const handleLogout = async () => {
  Alert.alert(
    "Выход",
    "Вы уверены, что хотите выйти из аккаунта?",
    [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          // 1. Удаляем токен
          await SecureStore.deleteItemAsync('userToken');

          // 2. Сбрасываем именно корневой Stack
          //    оставляем только 'index' (app/index.tsx = Onboarding)
          rootNavigation?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'index' }],
            })
          );
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Настройки профиля</Text>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <View style={styles.topSectionRow}>
            <View style={{ flex: 1, marginRight: 20 }}>
               <Text style={styles.label}>Имя</Text>
               <TextInput 
                style={styles.input} 
                value={firstName} 
                onChangeText={setFirstName} 
                placeholder="Имя" 
              />
               <View style={{ height: 15 }} />
               <Text style={styles.label}>Фамилия</Text>
               <TextInput 
                style={styles.input} 
                value={lastName} 
                onChangeText={setLastName} 
                placeholder="Фамилия" 
              />
            </View>
            
          <View style={styles.avatarSection}>
            <View style={styles.largeAvatarPlaceholder}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <Ionicons name="person" size={50} color="#E0E0E0" />
              )}
              
              {/* Кнопка смены (справа) */}
              <TouchableOpacity style={styles.editBadge} onPress={pickImage} activeOpacity={0.7}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>

              {/* Кнопка удаления (слева) */}
              {avatarUrl && (
                <TouchableOpacity 
                  style={[styles.editBadge, { right: undefined, left: 0, backgroundColor: '#E84142' }]} 
                  onPress={removeImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          </View>

          <View style={styles.rowInputs}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Псевдоним</Text>
                <TextInput style={styles.input} value={username} onChangeText={setUsername} />
             </View>
             <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
             </View>
          </View>

          <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Сменить пароль</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Старый пароль" 
          secureTextEntry 
          value={oldPassword} 
          onChangeText={setOldPassword} 
        />
        <View style={{ height: 10 }} />
        <TextInput 
          style={styles.input} 
          placeholder="Новый пароль" 
          secureTextEntry 
          value={newPassword} 
          onChangeText={setNewPassword} 
        />
        <View style={{ height: 10 }} />
        <TextInput 
          style={styles.input} 
          placeholder="Подтвердите пароль" 
          secureTextEntry 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
          <Text style={styles.saveBtnText}>Обновить пароль</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Сохранить изменения</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#E84142" />
            <Text style={styles.logoutBtnText}>Выйти</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  topSectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  
  avatarSection: { alignItems: 'center' },
  largeAvatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarActions: { flexDirection: 'row', gap: 10 },
  actionBtnPrimary: { backgroundColor: '#4169E1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { backgroundColor: '#4169E1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 25 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 },
  inputContainer: { marginBottom: 15 },
  passwordBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },

  saveBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 30, borderWidth: 1, borderColor: '#E84142', backgroundColor: '#FFF' },
  logoutBtnText: { color: '#E84142', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4169E1',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  }
});