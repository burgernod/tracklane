import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

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
          <TextInput style={styles.input} placeholder="Псевдоним" placeholderTextColor="#A0A0A0" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput style={styles.input} placeholder="Пароль" secureTextEntry placeholderTextColor="#A0A0A0" />
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.checkboxRow}>
            <Ionicons name="checkmark-circle" size={20} color="#E0E0E0" />
            <Text style={styles.checkboxText}>Запомнить меня</Text>
          </TouchableOpacity>
          {/* Ссылка на забыли пароль */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPassword}>Забыли пароль?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/(drawer)')}>
          <Text style={styles.loginButtonText}>Войти</Text>
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
  forgotPassword: { fontSize: 12, color: '#3B5998', fontWeight: 'bold' },
  loginButton: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});