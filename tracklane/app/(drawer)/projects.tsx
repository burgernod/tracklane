import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

export default function ProjectsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Хедер */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Проекты</Text>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Поиск и кнопка "Добавить" */}
        <View style={styles.actionBar}>
          <View style={styles.searchBox}>
            <TextInput style={styles.searchInput} placeholder="Мои задания" placeholderTextColor="#888" />
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          </View>
        </View>

        {/* Список проектов */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Карточка одного проекта */}
          <TouchableOpacity 
            style={styles.projectCard} 
            onPress={() => router.push('/project-workspace')} // Переход внутрь проекта
          >
            <View style={styles.projectLeft}>
              <Image 
                source={require('../../assets/images/tracklane-logo-circle.svg')} 
                style={styles.projectIcon}
                contentFit="contain"
              />
              <Text style={styles.projectTitle}>Проект Аврора</Text>
            </View>
            <View style={styles.projectRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>28</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </View>
          </TouchableOpacity>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  actionBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 15, height: 45 },
  searchInput: { flex: 1, fontSize: 14 },
  searchIcon: { marginLeft: 5 },
  addButton: { backgroundColor: '#4169E1', width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  
  projectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 25, borderWidth: 1, borderColor: '#1A1A1A' },
  projectLeft: { flexDirection: 'row', alignItems: 'center' },
  projectIcon: { flexDirection: 'row', backgroundColor: '#1A1A1A', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  logoLine: { width: 6, height: 16, backgroundColor: '#4169E1' },
  projectTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  projectRight: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: '#4169E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});