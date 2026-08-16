# PULSE — FULL HEALTH ECOSYSTEM

# MASTER DEVELOPMENT PROMPT

Siz PULSE nomli katta, real ishlaydigan HealthTech ecosystem ishlab chiqasiz.

MUHIM:
PULSE oddiy web site emas.
PULSE oddiy navbat app emas.
PULSE oddiy Telegram bot emas.
PULSE oddiy AI chatbot emas.

PULSE — insonning kundalik sog‘lig‘i va tibbiy xizmatlardan foydalanishini bitta tizimga birlashtiruvchi yagona raqamli HealthTech platforma.

Barcha funksiyalar bitta ecosystem ichida ishlashi kerak.

==================================================

1. # HACKATHON MAVZUSI

Mavzu:

"Sog‘liq, sport va tibbiyot"

Hackathon talabi:

- odam har kuni ishlatadigan mahsulot yaratish;
- ko‘plab yarimta feature emas, bir-biri bilan bog‘langan to‘liq sistema yaratish;
- sog‘liq ma’lumotlarini xavfsiz saqlash;
- AI shifokor o‘rnini bosmasligi;
- foydalanuvchining 1-kunidan 7-kunigacha bo‘lgan real foydalanish jarayonini ko‘rsatish.

PULSE ushbu mavzuni bitta katta ecosystem orqali qamrab oladi:

- kundalik sog‘liq;
- suv;
- uyqu;
- sport va mashg‘ulot;
- dori eslatmalari;
- klinika;
- bo‘lim;
- shifokor;
- appointment;
- raqamli navbat;
- queue tracking;
- Telegram notification;
- medical history;
- examination;
- lab results;
- AI assistant;
- emergency information.

Bularning hammasi alohida-alohida feature emas.

ULAR BIR-BIRI BILAN BOG‘LANGAN BIRTA SISTEMA.

================================================== 2. ASOSIY PRODUCT G‘OYA
==================================================

PULSE foydalanuvchining sog‘liq bilan bog‘liq kundalik va tibbiy jarayonlarini bitta joyga birlashtiradi.

Asosiy g‘oya:

"YOUR HEALTH. ONE PULSE."

Foydalanuvchi PULSE orqali:

- kundalik sog‘liq holatini kuzatadi;
- suv ichishini kuzatadi;
- uyqusini qayd qiladi;
- mashg‘ulotlarini kuzatadi;
- dori vaqtlarini boshqaradi;
- shifokor topadi;
- klinika topadi;
- shifokorga navbat oladi;
- navbatini real vaqtda kuzatadi;
- Telegram orqali notification oladi;
- shifokor ko‘rigidan keyingi ma’lumotlarini saqlaydi;
- tahlillarini ko‘radi;
- AI yordamchidan foydalanadi;
- kerakli paytda emergency information oladi.

================================================== 3. PULSE'NING ENG MUHIM PRINSIPI
==================================================

BARCHA FUNKSIYALAR BIR-BIRI BILAN BOG‘LANGAN BO‘LSIN.

Masalan:

USER
↓
Health Dashboard
↓
Daily Health
↓
Doctor
↓
Appointment
↓
Queue
↓
Telegram
↓
Examination
↓
Medical Record
↓
AI
↓
Future Health Tracking

Yoki:

User:
"Menga kardiolog kerak"

PULSE AI:
→ Kardiologiya bo‘limini aniqlaydi
→ mavjud klinikalarni topadi
→ mavjud shifokorlarni topadi
→ bo‘sh vaqtlarni ko‘rsatadi
→ foydalanuvchini appointment flow'iga olib boradi
→ navbat yaratiladi
→ Telegram notification yuboriladi
→ dashboard yangilanadi.

Bitta action boshqa qismlarda ham natija berishi kerak.

================================================== 4. WEB + TELEGRAM — BIRTA SISTEMA
==================================================

ENG MUHIM TALAB:

WEB va TELEGRAM BOT alohida database yoki alohida logic ishlatmasin.

Ular bitta PULSE account va bitta backend orqali ishlasin.

ARCHITECTURE:

                    PULSE
                      |
          ┌───────────┴───────────┐
          |                       |
       WEB APP              TELEGRAM BOT
          |                       |
          └───────────┬───────────┘
                      |
                 BACKEND API
                      |
                   MONGODB
                      |
                 PULSE AI
                      |
              AI / Health Services

WEB:

- asosiy full-featured interface

TELEGRAM:

- notification;
- quick actions;
- appointment;
- queue;
- reminders;
- health assistant;
- account access.

BACKEND:

- yagona source of truth.

MONGODB:

- yagona database.

AI:

- backend orqali real PULSE data bilan ishlaydi.

================================================== 5. ACCOUNT SYNC
==================================================

User Web'da register qiladi.

Keyin Telegram accountini PULSE accountiga ulaydi.

Masalan:

WEB:
"Telegramni ulash"

↓

QR yoki unique linking code

↓

Telegram:
/start

↓

Backend user accountlarni bog‘laydi.

Natijada:

# WEB USER ID

# TELEGRAM USER ID

PULSE ACCOUNT

Shundan keyin Web va Telegramdagi barcha ma’lumotlar bir xil accountga tegishli bo‘ladi.

Boshqa userning ma’lumotlari hech qachon ko‘rinmasin.

================================================== 6. WEB'DAGI O‘ZGARISH TELEGRAMGA TA’SIR QILADI
==================================================

Misol:

Web'da user:

"Dori: Vitamin D
09:00"

saqlaydi.

Telegram:

"Vitamin D ichish vaqti keldi."

---

Web'da:

"Navbat A-24"

Telegram:

"Navbatingiz tasdiqlandi: A-24"

---

Doctor:

"A-24 chaqirildi"

Web:

"Navbatingiz keldi"

Telegram:

"Sizning navbatingiz keldi. Iltimos, shifokor xonasiga boring."

---

Telegram orqali appointment olinsa:

Telegram
↓
Backend
↓
MongoDB
↓
Web Dashboard

Web'da appointment avtomatik paydo bo‘ladi.

HECH QANDAY FAKE SYNC QILMANG.

================================================== 7. PULSE MAIN MODULES
==================================================

PULSE quyidagi asosiy modullardan iborat:

1. Health Dashboard
2. Daily Health
3. Water Tracker
4. Sleep Tracker
5. Sport & Workout
6. Medication Reminder
7. Clinics
8. Departments
9. Doctors
10. Doctor Schedule
11. Appointment
12. Digital Queue
13. Queue Tracking
14. Notifications
15. Telegram Integration
16. Medical History
17. Examinations
18. Lab Results
19. PULSE AI
20. Emergency
21. Profile
22. Health Statistics

Bularning barchasi bitta PULSE accountga tegishli.

================================================== 8. HEALTH DASHBOARD
==================================================

Dashboard PULSE'ning markaziy sahifasi.

User kirganda sog‘lig‘i bo‘yicha eng muhim ma’lumotlarni bir qarashda ko‘rsin.

Masalan:

SALOM, SANJAR

Bugungi holat

Water
1.8L / 2.5L

Sleep
7h 20m

Workout
45 min

Medication
2 / 2

NEXT APPOINTMENT
14:30
LOR
Dr. Aliyev

QUEUE
A-24
Oldingizda: 3 kishi

HEALTH SCORE
78%

PULSE AI
"Sizga qanday yordam beray?"

Dashboard foydalanuvchini har kuni PULSE'ga qaytishga sabab bo‘lsin.

================================================== 9. DAILY HEALTH
==================================================

User kundalik sog‘liq ma’lumotlarini boshqaradi.

WATER:

- daily goal;
- consumed;
- progress;
- reminders;
- history.

SLEEP:

- sleep time;
- wake time;
- duration;
- sleep history;
- weekly statistics.

WORKOUT:

- workout type;
- duration;
- calories optional;
- weekly progress;
- history.

MEDICATION:

- medication name;
- schedule;
- reminder;
- taken/not taken;
- history.

Muhim:

PULSE tashxis qilmaydi.

Health Score medical diagnosis emas.

U faqat foydalanuvchi kiritgan kundalik activity ma’lumotlari asosidagi umumiy progress ko‘rsatkichi.

================================================== 10. MEDICATION
==================================================

User dori jadvalini qo‘sha oladi.

Masalan:

Vitamin D
09:00
Daily

Telegram:

"Vitamin D ichish vaqti keldi."

User:

"Taken"

↓

Backend

↓

Medication history yangilanadi.

WEB va TELEGRAM bir xil state ko‘rsatadi.

PULSE o‘zi yangi dori yoki doza tavsiya qilmasin.

================================================== 11. CLINICS
==================================================

Ko‘plab realistik demo klinikalar yarating.

Masalan:

- MedLine Clinic
- Tashkent Medical Center
- City Hospital
- Neo Clinic
- Family Clinic
- Shifo Medical
- Grand Med
- Healthy Life Clinic

Har bir klinikada:

- name;
- logo;
- address;
- phone;
- working hours;
- description;
- rating;
- departments;
- doctors;
- schedules.

================================================== 12. DEPARTMENTS
==================================================

Masalan:

- LOR
- Kardiologiya
- Terapiya
- Dermatologiya
- Nevrologiya
- Oftalmologiya
- Stomatologiya
- Pediatriya
- Urologiya
- Ginekologiya
- Laboratoriya
- Diagnostika

================================================== 13. DOCTORS
==================================================

Har bir klinikada ko‘plab doctorlar bo‘lsin.

Doctor:

- first name;
- last name;
- avatar;
- specialty;
- experience;
- rating;
- clinic;
- department;
- working days;
- working hours;
- schedules;
- available slots.

Demo database bo‘sh ko‘rinmasin.

================================================== 14. APPOINTMENT
==================================================

User:

Clinic
↓
Department
↓
Doctor
↓
Date
↓
Available Time
↓
Confirmation
↓
Appointment
↓
Queue

Appointment real MongoDB record bo‘lsin.

Fake frontend state yetarli emas.

================================================== 15. DIGITAL QUEUE
==================================================

PULSE'ning eng kuchli modullaridan biri.

User:

A-24

Hozir:

A-21

Oldingizda:

3 kishi

Taxminiy kutish:

25 daqiqa

Status:

WAITING / NEAR / CALLED

Queue status:

PENDING
CONFIRMED
WAITING
NEAR
CALLED
COMPLETED
CANCELLED

Queue backend tomonidan boshqarilsin.

Frontend fake countdown yaratmasin.

Polling yoki WebSocket ishlatish mumkin.

================================================== 16. DOCTOR PANEL
==================================================

Doctor:

- dashboard;
- today's patients;
- queue;
- call patient;
- complete appointment;
- examination;
- medical record;
- lab result.

Misol:

A-21 → CALLED
A-22 → WAITING
A-23 → WAITING
A-24 → WAITING

Doctor:

[ NEXT PATIENT ]

bosganda:

A-21 → COMPLETED
A-22 → CALLED

Web patient dashboard yangilanadi.

Telegram notification yuboriladi.

================================================== 17. TELEGRAM BOT
==================================================

Technology:

Node.js + Telegraf.

Bot PULSE ecosystemning ikkinchi interface'i.

Bot orqali:

- account linking;
- dashboard summary;
- appointment;
- clinic search;
- doctor search;
- queue status;
- cancel appointment;
- water tracking;
- medication reminders;
- notifications;
- PULSE AI;
- health summary.

Bot backend API orqali ishlasin.

Bot alohida database ishlatmasin.

================================================== 18. TELEGRAM QUICK MENU
==================================================

Masalan:

[ Navbatim ]
[ Navbat olish ]

[ Bugungi sog‘lig‘im ]
[ Suv ]

[ Dori ]
[ Shifokor topish ]

[ PULSE AI ]
[ Profil ]

Telegram bot Web'dagi PULSE account bilan bog‘langan bo‘lishi kerak.

================================================== 19. PULSE AI
==================================================

PULSE AI — butun ecosystemning aqlli yordamchisi.

AI:

- clinic search;
- doctor search;
- appointment;
- queue;
- health dashboard;
- water;
- sleep;
- workout;
- medication reminders;
- medical history;
- platform navigation

bo‘yicha yordam beradi.

AI Web'da ham, Telegramda ham ishlashi mumkin.

ENG MUHIM:

AI backend orqali real user data oladi.

AI o‘zicha fake data yaratmasin.

================================================== 20. AI EXAMPLES
==================================================

User:

"Menga bugun LOR kerak."

AI:

"Bugun 3 ta LOR shifokorida bo‘sh vaqt mavjud."

[ Shifokorlarni ko‘rish ]

---

User:

"Navbatim qachon?"

AI:

"Sizning navbatingiz A-24. Oldingizda 3 kishi bor."

[ Navbatni ko‘rish ]

---

User:

"Bugun qancha suv ichdim?"

AI:

"Siz bugun 1.8 litr suv ichgansiz. Maqsadingiz 2.5 litr."

[ Suvni qo‘shish ]

---

User:

"Kecha necha soat uxladim?"

AI:

"Kecha siz 7 soat 20 daqiqa uyqu qayd etgansiz."

---

User:

"Bugun mashg‘ulot qildimmi?"

AI:

"Siz bugun 45 daqiqalik workout qayd etgansiz."

---

User:

"Tibbiy tariximni ko‘rsat."

AI:

"Oxirgi ko‘riklaringizni Medical History bo‘limida ko‘rishingiz mumkin."

[ Medical History ]

================================================== 21. AI MEDICAL SAFETY
==================================================

AI:

- diagnosis qilmaydi;
- kasallikni tasdiqlamaydi;
- prescription bermaydi;
- dori dozasini o‘zboshimchalik bilan aytmaydi;
- xavfli medical advice bermaydi;
- fake medical record yaratmaydi;
- boshqa user data'sini bermaydi.

AI platforma yordamchisi.

Agar jiddiy medical question bo‘lsa:

"Men shifokor o‘rnini bosa olmayman. Tegishli shifokor yoki tibbiy yordamga murojaat qiling."

Keyin PULSE orqali tegishli doctor/department topishga yordam berishi mumkin.

================================================== 22. MEDICAL HISTORY
==================================================

Doctor appointmentni completed qilgach:

Medical Record yaratiladi.

Record:

- date;
- doctor;
- clinic;
- department;
- examination;
- recommendation;
- lab results.

Patient timeline ko‘rinishida ko‘radi.

Masalan:

15.08.2026
LOR
Dr. Aliyev

Examination
...

Lab Result
...

Recommendation
...

Faqat shu userning medical data'si ko‘rinsin.

================================================== 23. EMERGENCY
==================================================

PULSE'da Emergency bo‘limi bo‘lsin.

U foydalanuvchini tegishli professional tibbiy yordamga yo‘naltiradi.

Emergency mode:

- emergency information;
- nearest emergency facility;
- emergency contacts;
- location-based help where available.

PULSE emergency diagnosis qilmaydi.

PULSE favqulodda holatda professional yordam chaqirishni tavsiya qiladi.

================================================== 24. HEALTH STATISTICS
==================================================

User weekly/monthly statistics ko‘rsin.

Masalan:

THIS WEEK

Water
12.4L

Sleep
51h

Workout
3 sessions

Medication
95%

Appointments
2

Queue average
18 min

Bu statistikalar real user data asosida hisoblanadi.

================================================== 25. 1-KUN → 7-KUN EXPERIENCE
==================================================

PULSE foydalanuvchini bir martalik app bo‘lib qolmasin.

DAY 1:

User:

- account yaratadi;
- health profile to‘ldiradi;
- water goal;
- sleep;
- medication;
- doctor/clinic preferences.

DAY 2:

User:

- water tracking;
- sleep;
- reminder.

DAY 3:

User:

- workout;
- health statistics.

DAY 4:

User:

- doctor qidiradi;
- appointment oladi.

DAY 5:

User:

- queue tracking;
- Telegram notification.

DAY 6:

User:

- doctor appointment;
- examination;
- medical record.

DAY 7:

User:

- weekly health summary;
- statistics;
- AI summary;
- upcoming appointment.

Shunday qilib PULSE foydalanuvchining har kungi health companioniga aylanadi.

================================================== 26. DATA MODEL
==================================================

MongoDB / Mongoose models:

User
Patient
HealthProfile
WaterLog
SleepLog
Workout
Medication
MedicationLog
Clinic
Department
Doctor
Schedule
Appointment
Queue
MedicalRecord
Examination
LabResult
Notification
TelegramConnection
AIConversation
AIMessage
EmergencyContact
HealthSummary

Relationshiplar Mongoose ref orqali to‘g‘ri tashkil qilinsin.

================================================== 27. BACKEND ARCHITECTURE
==================================================

Node.js
Express.js
Mongoose
MongoDB
JWT
bcrypt
Zod yoki express-validator

Structure:

backend/

models/
routes/
controllers/
services/
middleware/
utils/
scripts/
config/

Har bir entity modular bo‘lsin.

Masalan:

appointments.routes.js
appointments.controller.js
appointments.service.js

queue.routes.js
queue.controller.js
queue.service.js

AI uchun:

ai.routes.js
ai.controller.js
ai.service.js

Telegram uchun:

telegram.routes.js
telegram.controller.js
telegram.service.js

================================================== 28. WEB STACK
==================================================

Next.js
App Router
TypeScript
Tailwind CSS
TanStack Query
Axios
Zustand yoki React Context
React Hook Form
Zod
lucide-react

Mavjud repository stackini avval tekshiring.

Ishlayotgan stackni sababsiz almashtirmang.

================================================== 29. LANDING
==================================================

Landing PULSE'ni professional startup sifatida ko‘rsatsin.

Hero:

# YOUR HEALTH. ONE PULSE.

"Salomatligingiz, kundalik odatlaringiz va tibbiy xizmatlaringiz — bitta platformada."

CTA:

[ PULSE'ni boshlash ]

[ Qanday ishlaydi ]

Sections:

- Problem
- Solution
- Daily Health
- Medical
- Digital Queue
- Telegram
- PULSE AI
- Statistics
- How It Works
- CTA
- Footer

================================================== 30. WEB NAVIGATION
==================================================

Dashboard
My Health
Water
Sleep
Workout
Medications
Appointments
Queue
Clinics
Doctors
Medical History
Statistics
Notifications
PULSE AI
Profile
Emergency

Mobile'da bottom navigation yoki qulay mobile navigation ishlating.

================================================== 31. UI/UX
==================================================

PULSE professional medical-tech product ko‘rinishida bo‘lsin.

Oddiy CRUD dashboard ko‘rinishida bo‘lmasin.

UI:

- clean;
- modern;
- professional;
- trustworthy;
- responsive;
- accessible.

User har bir sahifada keyingi nima qilishni tushunsin.

Noaniq buttonlardan foydalanmang.

"Submit", "Action", "Continue" kabi generic textlar o‘rniga:

"Navbat olish"
"Suv qo‘shish"
"Uyquni qayd etish"
"Workout qo‘shish"
"Dorini belgilash"
"Shifokorni tanlash"

kabi aniq textlardan foydalaning.

================================================== 32. DESIGN SYSTEM
==================================================

Yagona design system.

Components:

Button
Input
Card
Modal
Toast
Badge
Avatar
ClinicCard
DoctorCard
AppointmentCard
QueueCard
HealthCard
WaterTracker
SleepCard
WorkoutCard
MedicationCard
AIChat
AIMessage
AIQuickActions
MedicalTimeline
NotificationCard
EmptyState
LoadingState
ErrorState

================================================== 33. LOADING / ERROR / EMPTY
==================================================

Har bir async action loading holatiga ega.

API error:

"Ma'lumotlarni yuklab bo‘lmadi."

AI error:

"PULSE AI bilan aloqa o‘rnatilmadi."

Empty:

"Hozircha ma'lumot yo‘q."

Har bir empty state userni keyingi actionga yo‘naltirsin.

================================================== 34. NOTIFICATIONS
==================================================

Notification system quyidagilar uchun ishlasin:

- appointment confirmed;
- appointment cancelled;
- queue near;
- queue called;
- medication reminder;
- water reminder;
- sleep reminder;
- workout reminder;
- health summary.

Notificationlar Web + Telegram orqali ishlashi mumkin.

================================================== 35. SECURITY
==================================================

Majburiy:

- JWT authentication;
- bcrypt password hashing;
- role-based authorization;
- protected API;
- input validation;
- patient data isolation;
- doctor authorization;
- AI conversation isolation;
- medical record authorization;
- Telegram account authorization.

Secretlarni hardcode qilmang.

Frontendga:

- MongoDB credentials;
- Bot Token;
- AI API Key;
- JWT Secret;
- Render Token

chiqmasin.

================================================== 36. ENV
==================================================

.env.example yarating:

MONGO_URI=
JWT_SECRET=
AI_API_KEY=
BOT_TOKEN=
BACKEND_URL=
FRONTEND_URL=

.env GitHubga chiqmasin.

.gitignore ichida bo‘lsin.

================================================== 37. PROJECT STRUCTURE
==================================================

pulse/

web/
landing/
backend/
bot/
README.md

Har bir qism mustaqil loyiha bo‘lsin.

web/package.json
landing/package.json
backend/package.json
bot/package.json

Web va Telegram bir-birining source code'ini import qilmasin.

Ular backend API orqali bog‘lansin.

================================================== 38. DATABASE SEED
==================================================

backend/scripts/seedDatabase.js

Demo uchun:

8+ clinics
12+ departments
20+ doctors
schedules
available slots
patients
appointments
queues
medical records
lab results
health data
medications
notifications

yarating.

Demo paytida sistema bo‘sh ko‘rinmasin.

================================================== 39. DEMO SCENARIO
==================================================

Hackathon demo quyidagicha bo‘lsin:

1. Landing ochiladi.

2. User PULSE'ni ko‘radi.

3. Register/Login.

4. Dashboard ochiladi.

5. User health summary'ni ko‘radi.

6. Suv qo‘shadi.

7. Uyquni qayd qiladi.

8. Workout qo‘shadi.

9. Dori reminder yaratadi.

10. PULSE AI ochadi.

11. User:
    "Menga bugun LOR kerak."

12. AI real backenddan doctor topadi.

13. User doctor tanlaydi.

14. Vaqt tanlaydi.

15. Appointment yaratiladi.

16. Queue yaratiladi.

17. Dashboardda:

A-24

ko‘rinadi.

18. Telegramga:

"Navbatingiz tasdiqlandi."

keladi.

19. Doctor panelidan:

"Next Patient"

bosiladi.

20. User Web'da:

"Sizning navbatingiz keldi."

ko‘radi.

21. Telegramga notification keladi.

22. Doctor appointmentni completed qiladi.

23. Medical Record yaratiladi.

24. User Medical History'da recordni ko‘radi.

25. 7-kun health summary ko‘rsatiladi.

Bu demo PULSE'ning bitta ecosystem ekanini isbotlashi kerak.

================================================== 40. PULSE ACCOUNT — SINGLE SOURCE OF IDENTITY
==================================================

ENG MUHIM LOGIKALARDAN BIRI:

Bitta user:

PULSE USER

shu account orqali:

Web
Telegram
AI
Health
Appointments
Queue
Medical History
Notifications

hammasidan foydalanadi.

Boshqa-boshqa user system yaratmang.

Telegram linking orqali accountlarni birlashtiring.

================================================== 41. SINGLE SOURCE OF TRUTH
==================================================

Barcha ma'lumotlarning yagona manbasi:

MONGODB

Web state:

Backend'dan.

Telegram state:

Backend'dan.

AI context:

Backend'dan.

Medical History:

Backend'dan.

Queue:

Backend'dan.

Health statistics:

Backend'dan.

Frontendda hardcoded fake data ishlatmang.

================================================== 42. REAL DATA FLOW
==================================================

Misol:

WEB:

User navbat oladi.

↓

POST /appointments

↓

Backend

↓

MongoDB

↓

Queue yaratish

↓

Notification yaratish

↓

Telegram service

↓

Telegram message

↓

Web TanStack Query refetch

↓

Dashboard update

Xuddi shu logic Telegramdan action bajarilganda ham ishlasin.

================================================== 43. AI DATA FLOW
==================================================

User:

"Navbatim qachon?"

↓

WEB / TELEGRAM

↓

BACKEND

↓

Authenticated user

↓

Appointment query

↓

Queue query

↓

Relevant context

↓

AI

↓

Response

AI hech qachon boshqa user data'sini contextga olmasin.

================================================== 44. HACKATHON QUALITY
==================================================

PULSE:

- fake startup mockup bo‘lmasin;
- fake queue bo‘lmasin;
- fake Telegram bo‘lmasin;
- fake AI data bo‘lmasin;
- fake database bo‘lmasin.

Real:

- backend;
- MongoDB;
- authentication;
- API;
- Telegram;
- AI;
- queue;
- health tracking

ishlashi kerak.

================================================== 45. FINAL QUALITY CHECK
==================================================

Ish tugagach quyidagilarni tekshiring:

WEB

- ishlaydimi?
- responsive mi?
- mobile ishlaydimi?

LANDING

- ishlaydimi?
- CTA ishlaydimi?

BACKEND

- ishlaydimi?
- API ishlaydimi?
- MongoDB ishlaydimi?

AUTH

- register?
- login?
- logout?
- protected routes?

HEALTH

- water?
- sleep?
- workout?
- medication?

MEDICAL

- clinics?
- departments?
- doctors?
- schedule?
- appointment?
- queue?
- medical history?
- examination?
- lab result?

TELEGRAM

- /start?
- account linking?
- notification?
- queue?
- appointment?
- medication?
- health data?

AI

- real backend data?
- user isolation?
- no diagnosis?
- no fake data?
- Web?
- Telegram?

SYNC

- Web → Telegram?
- Telegram → Web?
- Doctor → Web?
- Doctor → Telegram?
- AI → real database?

SECURITY

- secrets protected?
- JWT?
- bcrypt?
- role access?
- medical privacy?

UX

- loading?
- error?
- empty?
- toast?
- accessibility?
- mobile?

================================================== 46. FINAL PRODUCT
==================================================

PULSE quyidagi ko‘rinishda ishlashi kerak:

                         PULSE
                           |
          ┌────────────────┼────────────────┐
          |                |                |
       DAILY HEALTH      MEDICAL          AI
          |                |                |
     Water/Sleep       Clinics/Doctors   Assistant
     Workout           Appointment      Real Data
     Medication        Queue
                       Medical History
                       Lab Results
          |                |                |
          └────────────────┼────────────────┘
                           |
                     PULSE BACKEND
                           |
                       MONGODB
                           |
                    TELEGRAM BOT
                           |
                     NOTIFICATIONS

PULSE'ning asosiy maqsadi:

Foydalanuvchining kundalik sog‘liq odatlari, tibbiy xizmatlari, shifokor qabuli, navbati, notificationlari va tibbiy tarixini bitta yagona ecosystemga birlashtirish.

PULSE foydalanuvchiga quyidagi hissiyot berishi kerak:

"Men sog‘lig‘im bilan bog‘liq kerakli narsalarni boshqa-boshqa ilovalardan qidirishim shart emas. Hammasi PULSE'da."

================================================== 47. DEVELOPMENT QOIDASI
==================================================

Ishni boshlashdan oldin repositoryni to‘liq tekshiring.

Mavjud kodni tushuning.

Mavjud stackni tekshiring.

Keraksiz qayta yozish qilmang.

Keyin implementationni bosqichma-bosqich bajaring.

Har bir katta feature'dan keyin:

- build;
- API;
- database;
- frontend;
- integration

tekshirilsin.

Console errorlar qolmasin.

Broken route qolmasin.

Finalda README.md yangilansin.

README ichida:

- project architecture;
- setup;
- environment variables;
- MongoDB setup;
- backend run;
- web run;
- landing run;
- bot run;
- seed command;
- AI setup;
- Telegram setup;
- deployment

aniq yozilsin.

YAKUNIY MAQSAD:

PULSE'ni shunchaki chiroyli prototype emas, hackathon demo paytida boshidan oxirigacha ishlaydigan real HealthTech MVP sifatida ishlab chiqing.

Eng muhim narsa:

BARCHA MODULLAR BIR-BIRI BILAN BOG‘LANGAN BO‘LSIN.

WEB VA TELEGRAM BIRTA PULSE ACCOUNT ORQALI ISHLASIN.

BARCHA MA'LUMOTLAR BIRTA BACKEND VA BIRTA MONGODB ORQALI BOSHQARILSIN.

AI REAL PULSE DATA BILAN ISHLASIN.

PULSE — BIRTA KATTA SISTEMA.
