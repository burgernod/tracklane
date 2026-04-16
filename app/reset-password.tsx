import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  
  // Состояния для полей
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // Валидация
    if (!otp || otp.length < 6) {
      Alert.alert("Ошибка", "Введите 6-значный код из письма");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Ошибка", "Пароль должен быть не менее 8 символов");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: typeof email === 'string' ? email : email?.[0], // Гарантируем строку для TS
          otp_code: otp, 
          new_password: newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Успех", "Ваш пароль успешно изменен!");
        router.replace('/login');
      } else {
        Alert.alert("Ошибка", data.detail || "Не удалось сбросить пароль");
      }
    } catch (e) {
      Alert.alert("Ошибка сети", "Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Шапка с кнопкой назад */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Новый пароль</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Установка пароля</Text>
        <Text style={styles.subtitle}>
          Введите код, отправленный на {email}, и придумайте новый надежный пароль.
        </Text>

        {/* Поле ввода кода */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Код подтверждения</Text>
          <TextInput 
            style={styles.input} 
            placeholder="6-значный код" 
            placeholderTextColor="#A0A0A0"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Поле ввода пароля */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Новый пароль</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Минимум 8 символов" 
            placeholderTextColor="#A0A0A0"
            secureTextEntry 
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Сменить пароль</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  content: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#1A1A1A' 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#666', 
    lineHeight: 20, 
    marginBottom: 30 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 8, 
    marginLeft: 4 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    fontSize: 14, 
    backgroundColor: '#FFF' 
  },
  primaryBtn: { 
    backgroundColor: '#4169E1', 
    paddingVertical: 18, 
    borderRadius: 30, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#4169E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  primaryBtnText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});