import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ConfirmEmailScreen() {
  const router = useRouter();

  // Получаем email, который передали с экрана регистрации
  const { email } = useLocalSearchParams(); 

  const [code, setCode] = useState('');

  // ТАЙМЕР: 90 секунд (полторы минуты)
  const [timeLeft, setTimeLeft] = useState(90);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResend = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        Alert.alert("Готово", "Новый код отправлен!");
        setTimeLeft(90); // Сброс таймера
        setCanResend(false);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось отправить код повторно");
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Ошибка", "Введите 6-значный код");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp_code: code })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Успех!", data.message);
        router.replace('/login'); // После подтверждения отправляем на логин
      } else {
        Alert.alert("Ошибка", data.detail);
      }
    } catch (error) {
      Alert.alert("Ошибка сети", "Не удалось подключиться к серверу");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Подтверждение Email</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Проверьте входящие письма</Text>
        <Text style={styles.subtitle}>
          Мы отправили 6-значный код на {email || "вашу почту"}. Введите его ниже.
        </Text>

        {/* БЛОК ДЛЯ ВВОДА OTP */}
        <View style={styles.otpWrapper}>
          {/* Невидимый TextInput для ввода с клавиатуры */}
          <TextInput
            style={styles.hiddenInput}
            value={code}
            onChangeText={setCode}
            maxLength={6}
            keyboardType="number-pad"
            autoFocus={true}
          />
          
          {/* Видимые 6 кружочков */}
          <View style={styles.otpContainer} pointerEvents="none">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <View key={idx} style={[styles.otpCircle, code[idx] && styles.otpCircleActive]}>
                <Text style={styles.otpText}>{code[idx] || ''}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.timerText}>
          {canResend ? (
            <Text style={styles.resendLink} onPress={handleResend}>Отправить код повторно</Text>
          ) : (
            `Повторно скинуть код в: ${formatTime(timeLeft)}`
          )}
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify}>
          <Text style={styles.primaryBtnText}>Подтвердить</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 40 },
  // Стили для OTP
  otpWrapper: { position: 'relative', marginBottom: 40 },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 10 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  otpCircle: { width: 45, height: 45, borderRadius: 25, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  otpCircleActive: { borderColor: '#4169E1', borderWidth: 2 },
  otpText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  timerText: { textAlign: 'center', color: '#666', fontSize: 12, marginBottom: 30 },
  resendLink: { color: '#4169E1', fontWeight: 'bold', textDecorationLine: 'underline' },
  primaryBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});