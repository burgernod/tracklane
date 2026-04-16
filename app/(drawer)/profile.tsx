import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function UserProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Хедер */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Настройки профиля</Text>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Блок с аватаркой и именем */}
          <View style={styles.topSectionRow}>
            <View style={{ flex: 1, marginRight: 20 }}>
               <Text style={styles.label}>Имя</Text>
               <TextInput style={styles.input} placeholder="Джон" placeholderTextColor="#A0A0A0" />
               <View style={{ height: 15 }} />
               <Text style={styles.label}>Фамилия</Text>
               <TextInput style={styles.input} placeholder="Джонсон" placeholderTextColor="#A0A0A0" />
            </View>
            
            <View style={styles.avatarSection}>
               <Text style={[styles.label, { textAlign: 'center' }]}>Картинка профиля</Text>
               <View style={styles.largeAvatarPlaceholder}>
                 <Ionicons name="person" size={50} color="#E0E0E0" />
               </View>
               <View style={styles.avatarActions}>
                  <TouchableOpacity style={styles.actionBtnPrimary}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnSecondary}><Ionicons name="trash-outline" size={18} color="#FFF" /></TouchableOpacity>
               </View>
            </View>
          </View>

          {/* Псевдоним и Email */}
          <View style={styles.rowInputs}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Псевдоним</Text>
                <TextInput style={styles.input} placeholder="johnjohnson88" placeholderTextColor="#A0A0A0" />
             </View>
             <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="johnjohnson@..." placeholderTextColor="#A0A0A0" />
             </View>
          </View>

          <View style={styles.divider} />

          {/* Смена пароля */}
          <Text style={styles.sectionTitle}>Сменить пароль</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Нынешний пароль</Text>
            <View style={styles.passwordBox}>
               <TextInput style={{flex: 1}} placeholder="ввести нынешний пароль" secureTextEntry placeholderTextColor="#A0A0A0" />
               <Ionicons name="eye-outline" size={20} color="#A0A0A0" />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Новый пароль</Text>
            <View style={styles.passwordBox}>
               <TextInput style={{flex: 1}} placeholder="придумать новый пароль" secureTextEntry placeholderTextColor="#A0A0A0" />
               <Ionicons name="eye-outline" size={20} color="#A0A0A0" />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Подтвердить пароль</Text>
            <TextInput style={styles.input} placeholder="повторно ввести пароль" secureTextEntry placeholderTextColor="#A0A0A0" />
          </View>

          {/* Кнопки внизу */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Сохранить изменения</Text>
          </TouchableOpacity>

          {/* Кнопка ВЫХОДА (возвращает на главный экран) */}
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => router.replace('/')} // Переход на экран Onboarding
          >
            <Ionicons name="log-out-outline" size={20} color="#E84142" />
            <Text style={styles.logoutBtnText}>Выйти</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  topSectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  
  avatarSection: { alignItems: 'center' },
  largeAvatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarActions: { flexDirection: 'row', gap: 10 },
  actionBtnPrimary: { backgroundColor: '#4169E1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { backgroundColor: '#4169E1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 25 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 20 },
  inputContainer: { marginBottom: 15 },
  passwordBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },

  saveBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 30, borderWidth: 1, borderColor: '#E84142', backgroundColor: '#FFF' },
  logoutBtnText: { color: '#E84142', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});