import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const handleTermsPress = () => {
    Alert.alert('Условия и Политика', 'Здесь должен открываться текст условий и политики конфиденциальности.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Регистрация</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Инпуты */}
        {['Имя', 'Фамилия', 'Псевдоним', 'Email'].map((field, idx) => (
          <View key={idx} style={styles.inputContainer}>
            <Text style={styles.label}>{field}</Text>
            <TextInput style={styles.input} placeholder={field} placeholderTextColor="#A0A0A0" />
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <View style={styles.passwordBox}>
             <TextInput style={{flex: 1}} placeholder="длиной в 8 символов" secureTextEntry placeholderTextColor="#A0A0A0" />
             <Ionicons name="eye-outline" size={20} color="#A0A0A0" />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Подтверждение пароля</Text>
          <TextInput style={styles.input} placeholder="повторной ввод пароля" secureTextEntry placeholderTextColor="#A0A0A0" />
        </View>

        {/* Кликабельный текст политики */}
        <View style={styles.checkboxRow}>
          <Ionicons name="checkmark-circle" size={20} color="#E0E0E0" />
          <Text style={styles.checkboxText}>
            Я принимаю{' '}
            <Text style={styles.linkText} onPress={handleTermsPress}>
              Условия и Политику Конфиденциальности
            </Text>
          </Text>
        </View>

        {/* Переход на Подтверждение Email */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/confirm-email')}>
          <Text style={styles.primaryBtnText}>Зарегистрироваться</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  passwordBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingRight: 20 },
  checkboxText: { marginLeft: 10, fontSize: 10, color: '#666', lineHeight: 14 },
  linkText: { color: '#4169E1', textDecorationLine: 'underline' }, // Подчеркивание опционально
  primaryBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 30 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});