import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

export default function TaskScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Обзор задания</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Feather name="menu" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.projectInfoRow}>
            <View style={styles.projectLeft}>
              <Image 
                source={require('../../assets/images/tracklane-logo-circle.svg')} 
                style={styles.projectIcon}
                contentFit="contain"
              />
              <Text style={styles.projectTitle}>Проект Аврора</Text>
            </View>
          </View>

          <View style={styles.taskTitleRow}>
            <Text style={styles.taskTitle}>Целевая страница</Text>
            <TouchableOpacity style={styles.calendarBtn}>
              <Ionicons name="calendar" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Участники</Text>
          <View style={[styles.avatarsContainer, { marginBottom: 20, marginTop: 10 }]}>
            <View style={[styles.avatar, { backgroundColor: '#FF6B6B' }]} />
            <View style={[styles.avatar, { backgroundColor: '#2EC4B6', marginLeft: -15 }]} />
          </View>

          <Text style={styles.description}>
            Равным образом постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент.
          </Text>

          {/* Картинка (заглушка) */}
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#A0A0A0" />
          </View>

          {/* Комментарии */}
          <View style={[styles.sectionRow, { marginTop: 30, marginBottom: 15 }]}>
             <Text style={styles.sectionTitle}>Комментарии</Text>
             <TouchableOpacity style={styles.addBtn}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
          </View>

          <View style={styles.commentCard}>
             <View style={styles.commentHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <View style={[styles.avatar, { backgroundColor: '#1A1A1A', width: 30, height: 30, borderRadius: 15 }]} />
                   <Text style={styles.commentAuthor}>Крис Эндрью</Text>
                </View>
                <Ionicons name="heart" size={20} color="#FF4757" />
             </View>
             <Text style={styles.commentText}>
                Равным образом постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент.
             </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  projectInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  projectLeft: { flexDirection: 'row', alignItems: 'center' },
  projectIcon: { flexDirection: 'row', backgroundColor: '#1A1A1A', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoLine: { width: 4, height: 10, backgroundColor: '#4169E1' },
  projectTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },

  taskTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  taskTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  calendarBtn: { backgroundColor: '#4169E1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { fontSize: 14, color: '#666' },
  avatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FFF' },
  
  description: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20 },
  imagePlaceholder: { height: 180, backgroundColor: '#E0E0E0', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: '#4169E1', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  commentCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#4169E1', borderRadius: 20, padding: 15, marginTop: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  commentAuthor: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  commentText: { fontSize: 12, color: '#666', lineHeight: 18 }
});