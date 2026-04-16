import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RegisterScreen() {
  const router = useRouter();
  
  // Состояние для управления видимостью модального окна
  const [isTermsVisible, setIsTermsVisible] = useState(false);

   // 1. Состояния для всех полей ввода
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Состояние для галочки "Условия и политика"
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleRegister = async () => {
    // Валидация
    if (!firstName || !lastName || !username || !email || !password) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают!");
      return;
    }
    if (!isTermsAccepted) {
      Alert.alert("Внимание", "Вы должны принять условия политики конфиденциальности");
      return;
    }

    try {
      // Отправляем POST запрос
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username,
          email: email,
          password: password,
        })
      });

      // Пытаемся распарсить ответ
      let data;
      try {
        data = await response.json();
      } catch (err) {
        Alert.alert("Ошибка сервера", "Бэкенд недоступен или еще не обновился на Render.");
        return;
      }

      if (response.ok) {
        Alert.alert("Успех!", data.message);
        router.push({ pathname: '/confirm-email', params: { email: email } }); // Переходим на экран OTP кода
      } else {
        // Ошибка с бэкенда (например: Email уже занят)
        Alert.alert("Ошибка", data.detail || "Что-то пошло не так");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка сети", "Не удалось подключиться к серверу");
    }
  };

  const handleTermsPress = () => {
    setIsTermsVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Регистрация</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Инпуты */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Имя</Text>
          <TextInput style={styles.input} placeholder="Имя" placeholderTextColor="#A0A0A0" value={firstName} onChangeText={setFirstName} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Фамилия</Text>
          <TextInput style={styles.input} placeholder="Фамилия" placeholderTextColor="#A0A0A0" value={lastName} onChangeText={setLastName} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Псевдоним</Text>
          <TextInput style={styles.input} placeholder="Псевдоним" placeholderTextColor="#A0A0A0" value={username} onChangeText={setUsername} autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#A0A0A0" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <View style={styles.passwordBox}>
             <TextInput style={{flex: 1}} placeholder="Минимум 8 символов" secureTextEntry placeholderTextColor="#A0A0A0" value={password} onChangeText={setPassword} />
             <Ionicons name="eye-outline" size={20} color="#A0A0A0" />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Подтверждение пароля</Text>
          <TextInput style={styles.input} placeholder="Повторный ввод пароля" secureTextEntry placeholderTextColor="#A0A0A0" value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        {/* Кликабельный текст политики с чекбоксом */}
        <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.7} onPress={() => setIsTermsAccepted(!isTermsAccepted)}>
          <Ionicons name="checkmark-circle" size={20} color={isTermsAccepted ? "#4169E1" : "#E0E0E0"} />
          <Text style={styles.checkboxText}>
            Я принимаю{' '}
            <Text style={styles.linkText} onPress={() => setIsTermsVisible(true)}>
              Условия и Политику Конфиденциальности
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Кнопка регистрации */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
          <Text style={styles.primaryBtnText}>Зарегистрироваться</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Модальное окно с текстом Условий и Политики */}
      <Modal
        visible={isTermsVisible}
        animationType="slide"
        presentationStyle="pageSheet" // На iOS окно откроется как красивая карточка (BottomSheet), на Android как обычный экран
        onRequestClose={() => setIsTermsVisible(false)} // Для кнопки "Назад" на Android
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Шапка модального окна */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Условия и Политика</Text>
            <TouchableOpacity onPress={() => setIsTermsVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Контент Политики */}
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            
            <Text style={styles.termsSectionTitle}>Введение</Text>
            <Text style={styles.termsParagraph}>
              Добро пожаловать в TrackLane! Настоящий документ определяет условия использования нашего мобильного приложения и описывает, как мы собираем, используем и защищаем вашу личную информацию. Создавая аккаунт в TrackLane, вы соглашаетесь с данными условиями.
            </Text>

            <Text style={styles.termsSectionTitle}>1. Сбор данных</Text>
            <Text style={styles.termsParagraph}>Для обеспечения корректной работы сервиса мы собираем следующие данные:</Text>
            <Text style={styles.termsBullet}>• Личная информация, предоставляемая при регистрации: имя, фамилия, псевдоним, адрес электронной почты.</Text>
            <Text style={styles.termsBullet}>• Данные, создаваемые в процессе использования приложения: названия проектов, задачи, комментарии, загруженные изображения и файлы.</Text>
            <Text style={styles.termsBullet}>• Технические данные: информация об устройстве, IP-адрес, логи сбоев приложения.</Text>

            <Text style={styles.termsSectionTitle}>2. Использование данных</Text>
            <Text style={styles.termsParagraph}>Собранные данные используются исключительно для:</Text>
            <Text style={styles.termsBullet}>• Создания и управления вашим аккаунтом.</Text>
            <Text style={styles.termsBullet}>• Предоставления функционала управления проектов (Канбан-доски, комментарии, приглашение участников).</Text>
            <Text style={styles.termsBullet}>• Отправки системных уведомлений (например, OTP-кодов для подтверждения почты или сброса пароля).</Text>
            <Text style={styles.termsBullet}>• Улучшения качества нашего сервиса и устранения технических ошибок.</Text>

            <Text style={styles.termsSectionTitle}>3. Хранение и безопасность данных</Text>
            <Text style={styles.termsParagraph}>
              Ваша безопасность — наш приоритет. Все текстовые данные и учетные записи хранятся на защищенных серверах (PostgreSQL), а медиафайлы — в надежных облачных хранилищах (Firebase). Мы используем современные методы шифрования для защиты ваших паролей и личной информации от несанкционированного доступа.
            </Text>

            <Text style={styles.termsSectionTitle}>4. Передача данных третьим лицам</Text>
            <Text style={styles.termsParagraph}>
              Мы не продаем и не передаем ваши личные данные третьим лицам для маркетинговых целей. Доступ к вашим данным (именам, задачам) имеют только те пользователи TrackLane, которых вы лично пригласили в свой проект (в роли Admins, Reviewers или Members).
            </Text>

            <Text style={styles.termsSectionTitle}>5. Ваши права</Text>
            <Text style={styles.termsParagraph}>Вы имеете полное право:</Text>
            <Text style={styles.termsBullet}>• Просматривать, изменять или удалять свои личные данные через раздел "Профиль".</Text>
            <Text style={styles.termsBullet}>• Запросить полное удаление вашего аккаунта и всех связанных с ним проектов и задач из нашей системы.</Text>
            <Text style={styles.termsBullet}>• Отказаться от получения рассылок (кроме критически важных системных уведомлений).</Text>

            <Text style={styles.termsSectionTitle}>6. Изменения в Политике</Text>
            <Text style={styles.termsParagraph}>
              Мы оставляем за собой право периодически обновлять данную Политику конфиденциальности. В случае существенных изменений мы уведомим вас через интерфейс приложения TrackLane или по электронной почте.
            </Text>

            <Text style={styles.termsSectionTitle}>7. Контакты</Text>
            <Text style={styles.termsParagraph}>
              Если у вас возникли вопросы по поводу настоящих Условий или обработки ваших данных, пожалуйста, свяжитесь с нашей службой поддержки: support@tracklane.app
            </Text>

            <Text style={[styles.termsParagraph, { marginTop: 20, fontStyle: 'italic', color: '#A0A0A0' }]}>
              Последнее обновление: Март 2024 года.
            </Text>

            {/* Отступ снизу для комфортного скроллинга */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, backgroundColor: '#FFF' },
  passwordBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingRight: 20 },
  checkboxText: { marginLeft: 10, fontSize: 10, color: '#666', lineHeight: 14 },
  linkText: { color: '#4169E1', textDecorationLine: 'underline' },
  primaryBtn: { backgroundColor: '#4169E1', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 30 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Стили для модального окна
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  closeBtn: { padding: 5, backgroundColor: '#FAFAFA', borderRadius: 20 },
  modalScroll: { flex: 1 },
  modalContent: { padding: 20 },
  
  // Стили форматирования текста
  termsSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginTop: 25, marginBottom: 10 },
  termsParagraph: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 10 },
  termsBullet: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 5, paddingLeft: 10 },
});