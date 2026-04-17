import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    Dimensions,
    Animated,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'Управляй проектами легко',
        subtitle:
            'Создавай проекты, распределяй задачи и следи за прогрессом команды в одном месте.',
    },
    {
        id: 2,
        title: 'Контролируй команду',
        subtitle:
            'Добавляй участников, назначай роли и управляй рабочими процессами без лишней сложности.',
    },
    {
        id: 3,
        title: 'Следи за дедлайнами',
        subtitle:
            'Отслеживай важные сроки, статусы задач и не упускай ничего важного.',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isChecking, setIsChecking] = useState(true); 

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            
            // Усиленная проверка: убеждаемся, что токен реально существует
            // и не является строковым мусором
            if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
                router.replace('/(drawer)');
            } else {
                // Очищаем мусор, если он там есть
                await SecureStore.deleteItemAsync('userToken');
                setIsChecking(false);
            }
        } catch (e) {
            console.error("Ошибка при чтении токена:", e);
            setIsChecking(false);
        }
    };

    // Если идет проверка — показываем пустой экран или экран загрузки
    if (isChecking) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1E1F24', justifyContent: 'center' }}>
                <ActivityIndicator color="#4169E1" size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topSection}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/tracklane-logo.svg')}
                        style={styles.fullLogo}
                        contentFit="contain"
                    />
                </View>
            </View>

            <View style={styles.bottomCard}>
                <Animated.ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    style={styles.slider}
                >
                    {slides.map((slide) => (
                        <View key={slide.id} style={styles.slide}>
                            <Text style={styles.title}>{slide.title}</Text>
                            <Text style={styles.subtitle}>{slide.subtitle}</Text>
                        </View>
                    ))}
                </Animated.ScrollView>

                <View style={styles.dotsContainer}>
                    {slides.map((_, index) => {
                        const inputRange = [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 22, 8],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.35, 1, 0.35],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.push('/register')}
                >
                    <Text style={styles.primaryBtnText}>Зарегистрироваться</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.secondaryBtnText}>Войти</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1F24',
    },
    topSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fullLogo: {
        width: 280,
        height: 50,
    },

    bottomCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    },

    slider: {
        width: '100%',
    },
    slide: {
        width,
        paddingHorizontal: 30,
        alignItems: 'center',
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
        lineHeight: 18,
        marginBottom: 25,
    },

    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4169E1',
        marginHorizontal: 4,
    },

    primaryBtn: {
        width: '85%',
        backgroundColor: '#4169E1',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        width: '85%',
        backgroundColor: '#E8EDFA',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#4169E1',
        fontSize: 16,
        fontWeight: 'bold',
    },
});