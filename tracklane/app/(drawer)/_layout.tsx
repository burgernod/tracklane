import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
  return (
    <Drawer 
      screenOptions={{ 
        headerShown: false,
        drawerPosition: 'right',
        drawerActiveBackgroundColor: '#E8EDFA',
        drawerActiveTintColor: '#4169E1',
        drawerInactiveTintColor: '#1A1A1A',
      }}
    >
      {/* --- ВИДИМЫЕ ПУНКТЫ МЕНЮ --- */}
      <Drawer.Screen 
        name="index" 
        options={{
          drawerLabel: 'Дешборд',
          title: 'Дешборд',
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }} 
      />
      <Drawer.Screen 
        name="projects" 
        options={{
          drawerLabel: 'Проекты',
          title: 'Проекты',
          drawerIcon: ({ color }) => <Ionicons name="folder-outline" size={24} color={color} />,
        }} 
      />
      <Drawer.Screen 
        name="team" 
        options={{
          drawerLabel: 'Команда',
          title: 'Команда',
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
        }} 
      />
      <Drawer.Screen 
        name="profile" 
        options={{
          drawerLabel: 'Профиль',
          title: 'Профиль',
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }} 
      />

      {/* --- НЕВИДИМЫЕ ЭКРАНЫ (СКРЫТЫ ИЗ МЕНЮ) --- */}
      <Drawer.Screen 
        name="project-workspace" 
        options={{
          drawerItemStyle: { display: 'none' } // Прячем кнопку
        }} 
      />
      <Drawer.Screen 
        name="task" 
        options={{
          drawerItemStyle: { display: 'none' } // Прячем кнопку
        }} 
      />
    </Drawer>
  );
}