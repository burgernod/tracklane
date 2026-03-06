import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image'; 

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Верхняя черная часть */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          {/* Вставляем полный логотип */}
          <Image 
            source={require('../assets/images/tracklane-logo.svg')} 
            style={styles.fullLogo} 
            contentFit="contain"
          />
        </View>
      </View>

      {/* Нижняя белая карточка */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Идейные соображения высшего порядка</Text>
        <Text style={styles.subtitle}>
          Равным образом постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент.
        </Text>
        
        {/* Точки пагинации */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/register')}>
          <Text style={styles.primaryBtnText}>Зарегистрироваться</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/login')}>
          <Text style={styles.secondaryBtnText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1F24' }, // Темный фон
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  fullLogo: { width: 280, height: 50 }, 
  logoIcon: { flexDirection: 'row', marginRight: 10 },
  logoLine: { width: 12, height: 35, backgroundColor: '#4169E1' },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  
  bottomCard: { backgroundColor: '#FFF', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 40 : 30 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', marginBottom: 15 },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#666', lineHeight: 18, marginBottom: 25 },
  dotsContainer: { flexDirection: 'row', marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#A0A0A0' },
  
  primaryBtn: { width: '100%', backgroundColor: '#4169E1', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { width: '100%', backgroundColor: '#E8EDFA', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  secondaryBtnText: { color: '#4169E1', fontSize: 16, fontWeight: 'bold' },
});