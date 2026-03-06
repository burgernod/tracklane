import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, Share, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';

// Компонент раскрывающегося статуса
const StatusChip = ({ count, title, color, isExpanded, onToggle }: any) => (
  <View style={styles.chipWrapper}>
    <TouchableOpacity 
      style={[styles.chip, { backgroundColor: color, borderBottomLeftRadius: isExpanded ? 5 : 30, borderBottomRightRadius: isExpanded ? 5 : 30 }]} 
      onPress={onToggle}
    >
      <View style={styles.chipLeft}>
        <View style={styles.chipCountBox}>
          <Text style={[styles.chipCountText, { color: color }]}>{count}</Text>
        </View>
        <Text style={styles.chipTitle}>{title}</Text>
      </View>
      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
    </TouchableOpacity>
    
    {/* Раскрывающийся список под чипом */}
    {isExpanded && (
      <View style={[styles.expandedContent, { borderColor: color }]}>
        <View style={styles.dummyTaskRow}>
          <View style={[styles.taskDot, { backgroundColor: color }]} />
          <Text style={styles.taskText}>Дизайн главной страницы</Text>
        </View>
        <View style={styles.dummyTaskRow}>
          <View style={[styles.taskDot, { backgroundColor: color }]} />
          <Text style={styles.taskText}>Подготовка иллюстраций</Text>
        </View>
      </View>
    )}
  </View>
);

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Состояния для раскрытия блоков
  const [expandedChip, setExpandedChip] = useState<string | null>(null);
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  const[isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const toggleChip = (title: string) => {
    setExpandedChip(prev => prev === title ? null : title);
  };

  // Функция для шаринга JSON
  const handleShare = async () => {
    try {
      // Имитация ваших заданий
      const tasksData =[
        { id: 1, title: "Дизайн главной страницы", status: "В процессе" },
        { id: 2, title: "Подготовка иллюстраций", status: "В процессе" },
        { id: 3, title: "Ревью целевой страницы", status: "На рассмотрении" }
      ];
      
      const jsonString = JSON.stringify(tasksData, null, 2);
      
      await Share.share({
        message: `Мои задания в формате JSON:\n\n${jsonString}`,
        title: 'Экспорт заданий TrackLane'
      });
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <View style={styles.header}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.headerTitle}>Дешборд</Text>
             </View>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Feather name="menu" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionBar}>
            <View style={styles.searchBox}>
              <TextInput style={styles.searchInput} placeholder="Мои задания" placeholderTextColor="#888" />
              <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Поделиться</Text>
              <Ionicons name="share-social-outline" size={16} color="#FFF" style={{marginLeft: 5}}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <StatusChip count="12" title="В процессе" color="#4169E1" isExpanded={expandedChip === 'В процессе'} onToggle={() => toggleChip('В процессе')} />
          <StatusChip count="3" title="На рассмотрении" color="#FACC15" isExpanded={expandedChip === 'На рассмотрении'} onToggle={() => toggleChip('На рассмотрении')} />
          <StatusChip count="8" title="Закончены" color="#22C55E" isExpanded={expandedChip === 'Закончены'} onToggle={() => toggleChip('Закончены')} />

          {/* Недавняя активность (Кликабельный заголовок) */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setIsActivityExpanded(!isActivityExpanded)}>
            <Text style={styles.sectionTitle}>Недавняя активность</Text>
            <Ionicons name={isActivityExpanded ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} size={24} color="#888" />
          </TouchableOpacity>

          {isActivityExpanded && (
            <>
              <TouchableOpacity style={styles.outlineChip}>
                <View style={styles.outlineChipLeft}>
                  <View style={styles.outlineChipCountBox}>
                    <Text style={styles.outlineChipCountText}>56 час</Text>
                  </View>
                  <Text style={styles.outlineChipTitle}>Предстоящие сроки</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#4169E1" />
              </TouchableOpacity>

              {/* Блок Командная деятельность из скриншота */}
              <View style={styles.teamActivityBox}>
                <View style={styles.teamActivityHeader}>
                   <Text style={styles.teamActivityTitle}>Командная деятельность</Text>
                   <Ionicons name="chevron-forward-circle-outline" size={24} color="#22C55E" />
                </View>

                {/* Карточка 1 */}
                <View style={styles.activityCard}>
                  <View style={styles.activityTimeBadge}><Text style={styles.activityTimeText}>2 часа назад</Text></View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityText}>Целевая страница находится на рассмотрении</Text>
                    <Ionicons name="heart" size={22} color="#E84142" />
                  </View>
                  <View style={styles.activityAvatars}>
                     <Image source={{uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80'}} style={styles.smallAvatar} />
                     <Image source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'}} style={[styles.smallAvatar, {marginLeft: -10}]} />
                  </View>
                </View>

                {/* Карточка 2 */}
                <View style={styles.activityCard}>
                  <View style={styles.activityTimeBadge}><Text style={styles.activityTimeText}>3 часа назад</Text></View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityText}>Добавлено улучшение пользовательского потока</Text>
                    <Ionicons name="heart-outline" size={22} color="#E84142" />
                  </View>
                  <View style={styles.activityAvatars}>
                     <Image source={{uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80'}} style={styles.smallAvatar} />
                  </View>
                </View>

              </View>
            </>
          )}

          {/* Мои проекты */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setIsProjectsExpanded(!isProjectsExpanded)}>
            <Text style={styles.sectionTitle}>Мои проекты</Text>
            <Ionicons name={isProjectsExpanded ? "chevron-up" : "chevron-down"} size={20} color="#888" />
          </TouchableOpacity>

          {isProjectsExpanded && (
            <TouchableOpacity style={styles.projectCard}>
               <View style={styles.projectCardLeft}>
                  <Image 
                                  source={require('../../assets/images/tracklane-logo-circle.svg')} 
                                  style={styles.logoLine}
                                  contentFit="contain"
                                />
                  <Text style={styles.projectCardTitle}>Проект Аврора</Text>
               </View>
               <View style={styles.projectCardRight}>
                  <View style={styles.projectCountBadge}><Text style={styles.projectCountText}>28</Text></View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
               </View>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  
  actionBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  searchInput: { flex: 1, fontSize: 12 },
  searchIcon: { marginLeft: 5 },
  shareButton: { flexDirection: 'row', backgroundColor: '#4169E1', alignItems: 'center', paddingHorizontal: 15, height: 40, borderRadius: 20 },
  shareButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  calendarButton: { backgroundColor: '#4169E1', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  
  // Раскрывающиеся чипы
  chipWrapper: { marginBottom: 15 },
  chip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  chipLeft: { flexDirection: 'row', alignItems: 'center' },
  chipCountBox: { backgroundColor: '#FFF', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  chipCountText: { fontWeight: 'bold', fontSize: 14 },
  chipTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  expandedContent: { backgroundColor: '#FFF', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderWidth: 1, borderTopWidth: 0, padding: 15 },
  dummyTaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  taskText: { fontSize: 14, color: '#333' },

  // Секции
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { color: '#888', fontSize: 14 },
  
  outlineChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 30, borderWidth: 1, borderColor: '#4169E1', backgroundColor: '#FFF', marginBottom: 15 },
  outlineChipLeft: { flexDirection: 'row', alignItems: 'center' },
  outlineChipCountBox: { backgroundColor: '#4169E1', paddingHorizontal: 12, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  outlineChipCountText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  outlineChipTitle: { color: '#4169E1', fontSize: 16, fontWeight: '600' },

  // Командная деятельность (как на скрине)
  teamActivityBox: { borderWidth: 1, borderColor: '#22C55E', borderRadius: 20, padding: 15, marginBottom: 20 },
  teamActivityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  teamActivityTitle: { color: '#22C55E', fontSize: 14, fontWeight: 'bold' },

  activityCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1A1A1A', borderRadius: 20, padding: 20, marginTop: 15, marginBottom: 10 },
  activityTimeBadge: { position: 'absolute', top: -12, left: 15, backgroundColor: '#4169E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 10 },
  activityTimeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  activityBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activityText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', flex: 1, marginRight: 15, lineHeight: 20 },
  activityAvatars: { position: 'absolute', bottom: -12, right: 10, flexDirection: 'row' },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#DFE4F2' },

  // Мои проекты карточка
  projectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1A1A1A', borderRadius: 30, padding: 10, paddingRight: 20, backgroundColor: '#FFF', marginBottom: 20 },
  projectCardLeft: { flexDirection: 'row', alignItems: 'center' },
  projectIconDark: { flexDirection: 'row', backgroundColor: '#1A1A1A', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  logoLine: { width: 40, height: 40, borderRadius: 20, marginRight: 15  },
  projectCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  projectCardRight: { flexDirection: 'row', alignItems: 'center' },
  projectCountBadge: { position: 'absolute', top: -18, right: 25, backgroundColor: '#4169E1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  projectCountText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});