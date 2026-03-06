import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // Оборачиваем всё приложение для работы жестов бокового меню
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        {/* Меняем (tabs) на (drawer) */}
        <Stack.Screen name="(drawer)" /> 
      </Stack>
    </GestureHandlerRootView>
  );
}