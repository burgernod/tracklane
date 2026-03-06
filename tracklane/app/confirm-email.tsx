import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConfirmEmailScreen() {
  const router = useRouter();

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
          Равным образом постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент.
        </Text>

        {/* 5 кружочков для кода */}
        <View style={styles.otpContainer}>
          {[1, 2, 3, 4, 5].map((_, idx) => (
            <View key={idx} style={styles.otpCircle} />
          ))}
        </View>

        <Text style={styles.timerText}>Повторно скинуть код в: 0:47</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(drawer)')}>
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
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 40 },
  otpCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#A0A0A0', backgroundColor: '#FFF' },
  timerText: { textAlign: 'center', color: '#666', fontSize: 12, marginBottom: 30 },
  primaryBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});