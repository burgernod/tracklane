import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
  if (!email || !email.includes('@')) {
    Alert.alert("Ошибка", "Введите корректный Email");
    return;
  }

  setLoading(true);
  try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Успех", "Код восстановления отправлен на вашу почту");
        // 2. Переходим на экран сброса и передаем email
        router.push({ 
          pathname: '/reset-password', 
          params: { email: email.toLowerCase().trim() } 
        });
      } else {
        Alert.alert("Ошибка", data.detail || "Не удалось отправить код");
      }
    } catch (error) {
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
          <Text style={styles.headerTitle}>Восстановление пароля</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Введите свой Email</Text>
        <Text style={styles.subtitle}>
          Мы отправим 6-значный код подтверждения на вашу почту для смены пароля.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="example@mail.com" 
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
          onPress={handleRequestCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Выслать код</Text>
          )}
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
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 30 },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  primaryBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});