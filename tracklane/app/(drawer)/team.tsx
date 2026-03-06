import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

// Компонент одного пользователя в списке
const UserRow = ({ name, color }: { name: string, color: string }) => (
  <View style={styles.userRow}>
    <View style={[styles.avatar, { backgroundColor: color }]} />
    <Text style={styles.userName}>{name}</Text>
  </View>
);

export default function TeamManagementScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Хедер */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
             <Ionicons name="arrow-back" size={24} color="#000" style={{ marginRight: 15 }} />
             <Text style={styles.headerTitle}>Управление Командой</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Инфо о проекте */}
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

          {/* Секция: Admins */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Админы</Text>
            <Ionicons name="people-circle" size={18} color="#4169E1" style={{marginLeft: 8}} />
          </View>
          <UserRow name="Крис Эванс" color="#FCA311" />
          
          <View style={styles.divider} />

          {/* Секция: Reviewers */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Проверяющие</Text>
            <Ionicons name="people-circle" size={18} color="#4169E1" style={{marginLeft: 8}} />
          </View>
          <UserRow name="Джон Джонсон" color="#2EC4B6" />

          <View style={styles.divider} />

          {/* Секция: Members */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Участники</Text>
            <Ionicons name="people-circle" size={18} color="#4169E1" style={{marginLeft: 8}} />
          </View>
          <UserRow name="Крис Эванс" color="#FF6B6B" />
          <UserRow name="Джон Джонсон" color="#A0A0A0" />
          <UserRow name="Крис Эванс" color="#000000" />
          <UserRow name="Джон Джонсон" color="#E84142" />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  projectInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  projectLeft: { flexDirection: 'row', alignItems: 'center' },
  projectIcon: { flexDirection: 'row', backgroundColor: '#1A1A1A', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  logoLine: { width: 6, height: 18, backgroundColor: '#4169E1' },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  userName: { fontSize: 16, color: '#666' },

  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 }
});