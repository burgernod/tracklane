# TrackLane - Kanban жобаларын басқару жүйесі

## Сипаттама (Description)
TrackLane — бұл IT командалар мен стартаптарға арналған заманауи мобильді жобаларды басқару қосымшасы. Жүйе Kanban әдіснамасына негізделген және команданың шамадан тыс жұмыс істеуіне жол бермейтін қатаң, бэкенд деңгейінде тексерілетін WIP (Work In Progress) лимиттер логикасын қолданады. Қосымшада Drag & Drop интерфейсі, қауіпсіз Passwordless/OTP авторизациясы және бұлттық медиа сақтау мүмкіндігі іске асырылған.

## Негізгі мүмкіндіктері (Features)
- **Қауіпсіз Авторизация:** Email OTP арқылы тіркелу, JWT токенмен кіру және құпиясөзді қалпына келтіру.
- **Қатаң WIP-лимиттер:** Бір бағандағы тапсырмалар санына сервер деңгейіндегі шектеулер.
- **Интерактивті Kanban тақтасы:** Анимациясы (Snap-back) бар React Native Drag & Drop функциясы.
- **Жобалар мен команданы басқару:** Жобалар құру, бағандарды реттеу және тапсырмаларды бөлу.
- **Пайдаланушы профилі:** Жеке деректерді басқару, құпиясөзді ауыстыру және Cloudinary арқылы аватар жүктеу.
- **Дешборд және Аналитика:** Аяқталған, мерзімі өтіп кеткен және алдағы тапсырмаларды визуалды қадағалау.

## Технологиялық стек (Tech Stack)
**Frontend:**
- React Native (Expo)
- TypeScript
- React Navigation (Expo Router)
- react-native-drax (Drag & Drop)

**Backend:**
- Python 3.10+
- FastAPI
- PostgreSQL (Neon.tech / Render)
- SQLAlchemy (ORM) & Pydantic
- Cloudinary API (Суреттерді сақтау)
- SMTP (Email қызметі)

## Орнату және іске қосу (Installation & Run)

Бұл жоба екі бөлек репозиторийден тұрады: Backend (серверлік бөлік) және Frontend (мобильді қосымша). Оларды жеке-жеке клондап, іске қосу қажет.

### 1. Backend (Серверлік бөлікті) орнату

```bash
# 1. Бэкенд репозиторийін клондау және папкаға өту
git clone https://github.com/burgernod/tracklane-backend
cd tracklane-backend

# 2. Виртуалды ортаны құру және іске қосу
python -m venv venv
source venv/bin/activate  # Windows үшін: venv\Scripts\activate

# 3. Тәуелділіктерді (кітапханаларды) орнату
pip install -r requirements.txt

# 4. Қоршаған орта айнымалыларын баптау
# .env файлын жасап, өз мәліметтеріңізді жазыңыз:
# DATABASE_URL=postgresql://user:password@host/dbname
# CLOUDINARY_CLOUD_NAME=your_name
# CLOUDINARY_API_KEY=your_key
# CLOUDINARY_API_SECRET=your_secret
# SMTP_EMAIL=your_email@mail.ru
# SMTP_PASSWORD=your_app_password

# 5. FastAPI серверін іске қосу
uvicorn main:app --reload
```

### 2. Frontend (Клиенттік бөлікті) орнату
Жаңа терминал ашып, келесі пәрмендерді орындаңыз:

```bash
# 1. Фронтенд репозиторийін клондау және папкаға өту
git clone https://github.com/burgernod/tracklane.git
cd tracklane

# 2. Node модульдерін орнату
npm install

# 3. Қоршаған орта айнымалыларын баптау
# .env файлын жасап, сервер сілтемесін көрсетіңіз:
# EXPO_PUBLIC_API_URL= сіздің-бэкенд-доменіңіз (немесе http://localhost:8000)

# 4. Expo әзірлеу серверін іске қосу
npx expo start
```

Ескерту: Қосымшаны ашу үшін iOS/Android құрылғысындағы Expo Go қосымшасы арқылы терминалдағы QR-кодты сканерлеңіз.