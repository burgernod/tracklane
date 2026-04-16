import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        // УСПЕШНЫЙ ВХОД
        if (data.token) {
          await SecureStore.setItemAsync('userToken', data.token);
        }
        
        Alert.alert("Успех", "Добро пожаловать в TrackLane!");
        router.replace('/(drawer)'); 
      } 
      else if (response.status === 401) {
        // СЛУЧАЙ: Email не подтвержден (Бэкенд вернул 401)
        Alert.alert(
          "Email не подтвержден",
          "Ваш аккаунт еще не активирован. Пожалуйста, подтвердите вашу почту.",
          [
            { text: "ОК" },
            // Можно добавить кнопку перехода на подтверждение, 
            // но для этого нужно знать email. Пока просто просим подтвердить.
          ]
        );
      } 
      else {
        // Другие ошибки (неверный пароль, пользователь не найден)
        Alert.alert("Ошибка", data.detail || "Не удалось войти");
      }
    } catch (error) {
      console.log("ОШИБКА FETCH:", error);
      Alert.alert("Ошибка сети", "Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Вход в аккаунт</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.welcomeText}>Добро пожаловать!</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Псевдоним</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Введите псевдоним" 
            placeholderTextColor="#A0A0A0" 
            value={username} 
            onChangeText={setUsername} // Привязываем к состоянию
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Введите пароль" 
            secureTextEntry 
            placeholderTextColor="#A0A0A0" 
            value={password}
            onChangeText={setPassword} // Привязываем к состоянию
          />
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            activeOpacity={0.7} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            {/* Если rememberMe = true, делаем галочку синей (акцентный цвет), если false — серой */}
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={rememberMe ? "#4169E1" : "#E0E0E0"} 
            />
            <Text style={styles.checkboxText}>Запомнить меня</Text>
          </TouchableOpacity>
          {/* Ссылка на забыли пароль */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPassword}>Забыли пароль?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Загрузка..." : "Войти"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  welcomeText: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkboxText: { marginLeft: 8, fontSize: 12, color: '#666' },
  forgotPassword: { fontSize: 12, color: '#4169E1', fontWeight: 'bold' },
  loginButton: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});