import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

// Компонент Канбан-кнопки с раскрывающимся списком
const KanbanButton = ({ count, title, color, isExpanded, onToggle }: any) => (
  <View style={styles.kanbanWrapper}>
    <TouchableOpacity 
      style={[styles.kanbanBtn, { backgroundColor: color, borderBottomLeftRadius: isExpanded ? 5 : 30, borderBottomRightRadius: isExpanded ? 5 : 30 }]} 
      onPress={onToggle}
    >
      <View style={styles.kanbanLeft}>
        <View style={styles.kanbanBadge}><Text style={[styles.kanbanBadgeText, { color }]}>{count}</Text></View>
        <Text style={styles.kanbanTitle}>{title}</Text>
      </View>
      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
    </TouchableOpacity>

    {/* Раскрывающаяся часть */}
    {isExpanded && (
      <View style={[styles.expandedContent, { borderColor: color }]}>
        <Text style={{color: '#666', fontSize: 12, marginBottom: 10}}>Список задач...</Text>
        <View style={styles.dummyTaskRow}>
          <View style={[styles.taskDot, { backgroundColor: color }]} />
          <Text style={styles.taskText}>Задача в секции "{title}"</Text>
        </View>
      </View>
    )}
  </View>
);

export default function ProjectWorkspaceScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Состояния
  const[expandedKanban, setExpandedKanban] = useState<string | null>(null);
  const[isActivityExpanded, setIsActivityExpanded] = useState(true);

  const toggleKanban = (title: string) => {
    setExpandedKanban(prev => prev === title ? null : title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Обзор проекта</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Feather name="menu" size={28} color="#000" />
            </TouchableOpacity>
          </View>

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
            <Ionicons name="settings-outline" size={24} color="#4169E1" />
          </View>

          {/* Участники */}
          <View style={styles.sectionRow}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sectionTitle}>Участники</Text>
                <Ionicons name="people-circle" size={16} color="#4169E1" style={{marginLeft: 5}} />
             </View>
          </View>
          
          <View style={styles.avatarsContainer}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80'}} style={styles.avatar} />
            <Image source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}} style={[styles.avatar, { marginLeft: -15 }]} />
            <Image source={{uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80'}} style={[styles.avatar, { marginLeft: -15 }]} />
            <View style={[styles.avatarMore, { marginLeft: -15 }]}><Text style={styles.avatarMoreText}>+2</Text></View>
          </View>

          {/* Активность (Сворачиваемая) */}
          <TouchableOpacity style={[styles.sectionRow, { marginTop: 30 }]} onPress={() => setIsActivityExpanded(!isActivityExpanded)}>
             <Text style={styles.sectionTitle}>Недавняя активность</Text>
             <Ionicons name={isActivityExpanded ? "chevron-down" : "chevron-forward"} size={20} color="#A0A0A0" />
          </TouchableOpacity>

          {isActivityExpanded && (
            <TouchableOpacity style={styles.activityCard} onPress={() => router.push('/task')}>
               <View style={styles.activityTimeBadge}><Text style={styles.activityTimeText}>2 часа назад</Text></View>
               <View style={styles.activityBody}>
                  <Text style={styles.activityText}>Целевая страница находится на рассмотрении</Text>
                  <Ionicons name="heart" size={22} color="#E84142" />
               </View>
               <View style={styles.activityAvatars}>
                 <Image source={{uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80'}} style={styles.smallAvatar} />
                 <Image source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}} style={[styles.smallAvatar, {marginLeft: -10}]} />
               </View>
            </TouchableOpacity>
          )}

          {/* Канбан */}
          <View style={[styles.sectionRow, { marginTop: 30, marginBottom: 15 }]}>
             <Text style={styles.sectionTitle}>Канбан</Text>
             <TouchableOpacity style={styles.addBtn}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
          </View>

          <KanbanButton count="9" title="Запланировано" color="#E84142" isExpanded={expandedKanban === 'Запланировано'} onToggle={() => toggleKanban('Запланировано')} />
          <KanbanButton count="12" title="В процессе" color="#4169E1" isExpanded={expandedKanban === 'В процессе'} onToggle={() => toggleKanban('В процессе')} />
          <KanbanButton count="3" title="На рассмотрении" color="#FACC15" isExpanded={expandedKanban === 'На рассмотрении'} onToggle={() => toggleKanban('На рассмотрении')} />
          <KanbanButton count="8" title="Закончены" color="#22C55E" isExpanded={expandedKanban === 'Закончены'} onToggle={() => toggleKanban('Закончены')} />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  projectInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  projectLeft: { flexDirection: 'row', alignItems: 'center' },
  projectIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 14, color: '#666' },
  
  avatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#DFE4F2' },
  avatarMore: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DFE4F2', borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  avatarMoreText: { color: '#4169E1', fontSize: 12, fontWeight: 'bold' },

  // Карточка активности (как на скрине из Dashboard)
  activityCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1A1A1A', borderRadius: 20, padding: 20, marginTop: 15, marginBottom: 10 },
  activityTimeBadge: { position: 'absolute', top: -12, left: 15, backgroundColor: '#4169E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 10 },
  activityTimeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  activityBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activityText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', flex: 1, marginRight: 15, lineHeight: 20 },
  activityAvatars: { position: 'absolute', bottom: -12, right: 10, flexDirection: 'row' },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#DFE4F2' },

  addBtn: { backgroundColor: '#4169E1', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  
  // Канбан аккордеон
  kanbanWrapper: { marginBottom: 15 },
  kanbanBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  kanbanLeft: { flexDirection: 'row', alignItems: 'center' },
  kanbanBadge: { backgroundColor: '#FFF', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  kanbanBadgeText: { fontWeight: 'bold', fontSize: 14 },
  kanbanTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  
  expandedContent: { backgroundColor: '#FFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderWidth: 1, borderTopWidth: 0, padding: 15 },
  dummyTaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  taskText: { fontSize: 14, color: '#333' },
});