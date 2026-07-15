# 🧠 BrainCards — Umumiy Tushuntirish (Oddiy Til)

> Bu hujjat texnik emas.
> Loyihani **har kim tushunadigan** tarzda tushuntirish uchun yozilgan.

---

## 🎯 BrainCards nima?

**BrainCards** — bu bolalar uchun yaratilgan **o'quv o'yinlar platformasi**.

Oddiy qilib aytganda:

> Bola kitob o'qish o'rniga — **o'yin o'ynab** ingliz tilini o'rganadi.

Masalan:
- "Apple" so'zini ko'radi 🍎
- Rasmini ko'radi
- Talaffuzini eshitadi
- So'ng test o'tadi — to'g'ri javob bersa **ball oladi**
- Ball to'plansa **level oshadi**, **mukofot ochiladi**

---

## 👶 Kim uchun?

| Foydalanuvchi | Nima qiladi? |
|---|---|
| **Bola (3–12 yosh)** | O'yin o'ynab o'rganadi, XP to'playdi |
| **Ota-ona** | Farzandining o'qishini nazorat qiladi |
| **O'qituvchi** | Sinf ochadi, vazifa beradi |
| **Admin** | Hamma narsani boshqaradi |
| **Mehmon** | Ro'yxatdan o'tmasdan demo ko'radi |

---

## 🎮 Qanday o'yinlar bo'ladi?

```
1.  Xotira o'yini      → Juft kartochkalarni top
2.  Rasm tanlash       → To'g'ri rasmni bos
3.  So'z tanlash       → To'g'ri so'zni bos
4.  Quloq solish       → Eshit va javob ber
5.  Imlo tekshirish    → So'zni to'g'ri yoz
6.  Ha / Yo'q          → To'g'rimi yoki noto'g'rimi?
7.  Sudrab tashlash    → So'zni rasmga mos qo'y
8.  Soya moslashtirish → Soyani ob'ektga mos qo'y
9.  So'z qidirish      → So'zlarni topib chiz
10. Krossvord          → So'zlarni taxmin qil
11. Darvoqe o'yini     → Bitta xato = o'yin tugaydi
12. Boss Challenge     → 50 savol, vaqt chegarasi bilan
13. Kunlik vazifa      → Har kuni yangi topshiriq
14. Haftalik vazifa    → Uzoq topshiriq + bonus mukofot
```

---

## 🏆 O'yin qiziqarli qanday bo'ladi? (Gamifikatsiya)

Bola to'g'ri javob bergan sari:

```
✅ To'g'ri javob      → +10 XP
⚡ Tez javob          → +5 XP (tezlik bonusi)
🔥 Qator to'g'ri     → +10 XP (combo bonusi)
🌟 Mukammal tur       → +20 XP

XP to'plansa:
  → Level ko'tariladi (1 dan 100 gacha)
  → Coin (virtual tanga) olinadi
  → Yangi avatar ochiladi
  → Yangi tema ochiladi
  → Animatsiyalar ochiladi
```

### 🔥 Streak (Ketma-ketlik)
Har kuni o'qisa "streak" o'sadi:
- 7 kun ketma-ket → maxsus mukofot 🎁
- 30 kun ketma-ket → katta sovrin 🏅
- Bitta kun o'tkazib yuborsa → streak nolga tushadi
- "Streak freeze" (muzlatish) sotib olinishi mumkin

---

## 📚 Flashcard (Kartochka) nima?

Har bir so'z uchun bitta "kartochka" bo'ladi:

```
┌─────────────────────────────────┐
│   🍎  [Rasm: Olma]              │
│                                 │
│   So'z:        Apple            │
│   Tarjima:     Olma             │
│   Talaffuz:    /ˈæpəl/          │
│   Misol:       I eat an apple.  │
│   Audio:       🔊 [Eshitish]    │
│   Daraja:      Boshlang'ich     │
│   Mavzu:       Mevalar 🍓       │
└─────────────────────────────────┘
```

---

## 🗂️ Mavzular (Kategoriyalar)

Platformada **20+ mavzu** bo'ladi:

```
Alifbo       | Hayvonlar    | Ovqatlar    | Mevalar
Sabzavotlar  | Ranglar      | Shakllar    | Transport
Kasblar      | Mamlakatlar  | Bayroqlar   | Ob-havo
Tana a'zolari| Maktab       | Tabiat      | Sport
Texnologiya  | Grammatika   | Matematika  | Kosmос
Kundalik hayot va yana ko'proq...
```

---

## 📊 Statistika (Nima kuzatiladi?)

Har bir bola uchun quyidagilar saqlanadi:

```
📈 Aniqlik darajasi      (nechi foiz to'g'ri javob)
⏱️ O'qish vaqti          (kun/hafta/oy)
📝 O'rganilgan so'zlar   (umumiy soni)
🎮 O'ynalgan o'yinlar    (necha marta)
🏆 Eng yuqori ball        
⚠️ Zaif mavzular         (qaysi joylarda xato ko'p)
💪 Kuchli mavzular        
```

---

## 👨‍👩‍👧 Ota-ona nima ko'radi?

Ota-onaning alohida paneli bo'ladi:
- Farzand bugun necha daqiqa o'qidi
- Qaysi mavzularda kuchli / zaif
- Kundagi o'qish maqsadi bajarilganmi
- Oylik hisobot
- Ekran vaqtini cheklash imkoniyati

---

## 👩‍🏫 O'qituvchi nima qila oladi?

- Sinf yaratadi va o'quvchilarni qo'shadi
- Dars va uy vazifasi beradi
- O'quvchilar progressini kuzatadi
- Reyting ko'radi
- O'z testlarini yaratadi
- Hisobotlarni yuklab oladi

---

## 🏗️ Texnik tomon (Sodda qilib)

Loyiha **2 asosiy qism**dan iborat:

### 1️⃣ Frontend — Foydalanuvchi ko'radigan qism
```
Texnologiya : React + TypeScript + Tailwind CSS
Nima qiladi : Ekrandagi hamma narsa — tugmalar,
              kartochkalar, o'yinlar, animatsiyalar
Joylashuv   : Vercel (bepul hosting)
```

### 2️⃣ Backend — Orqa tomongi "motor"
```
Texnologiya : Node.js + Express + TypeScript
Nima qiladi : Foydalanuvchilarni tekshiradi,
              ma'lumotlarni saqlaydi va yuboradi,
              o'yin natijalarini hisoblaydi
Joylashuv   : Railway yoki Render
```

### 3️⃣ Ma'lumotlar bazasi
```
Texnologiya : PostgreSQL + Prisma ORM
Nima saqlaydi: Foydalanuvchilar, so'zlar, balllar,
               o'yinlar, yutuqlar, sinflar
Hosting     : Neon PostgreSQL (bulutda)
```

### 4️⃣ Rasm va Audio fayllar
```
Texnologiya : Cloudinary
Nima qiladi : Kartochkalar uchun rasmlar va
              ovozlarni bulutda saqlaydi
```

### 5️⃣ Kirish (Login) tizimi
```
Texnologiya : JWT + Refresh Token + bcrypt
Nima qiladi : Parollarni xavfsiz saqlaydi,
              foydalanuvchini taniydi
```

---

## 📄 Qanday hujjatlar yoziladi (va nima uchun)?

Kod yozishdan oldin **10 ta hujjat** yoziladi.
Bu shunchaki tartib uchun emas — bu hujjatlar bo'lmasa,
kod yozishda har safar qaror qabul qilishga to'g'ri keladi
va xatolar ko'payadi.

```
01 → PRD              Loyiha nima, kim uchun, nima qiladi
                      (siz o'qigan hujjat aynan shu edi)

02 → SRS              Aniq talablar ro'yxati
                      FR-001: Foydalanuvchi ro'yxatdan o'ta olishi kerak
                      NFR-001: Sahifa 2 soniyadan tez ochilishi kerak

03 → Arxitektura      Sistema qanday ishlaydi
                      (diagramma: frontend ↔ backend ↔ DB)

04 → Ma'lumotlar bazasi  Jadvallar va ularning aloqalari
                         (users, flashcards, games, achievements...)

05 → API              Server bilan qanday "gaplashiladi"
                      GET /api/v1/flashcards → kartochkalar ro'yxati
                      POST /api/v1/games → o'yin boshlash

06 → Dizayn sistema   Ranglar, shriftlar, tugma o'lchamlari,
                      animatsiya tezliklari — hamma visual qoidalar

07 → Komponentlar     Har bir UI blok qanday ko'rinadi va ishlaydi
                      (Button, FlashCard, XPBar, LeaderboardRow...)

08 → Dev qoidalari    Kod qanday yoziladi
                      (fayl nomlash, git commit, TypeScript qoidalari)

09 → Test strategiya  Nima qanday sinovdan o'tkaziladi
                      (unit test, integration test, E2E test)

10 → Deployment       Serverlarga qanday qo'yiladi
                      (GitHub Actions, Vercel, Railway, Neon)
```

---

## 🗺️ Rivojlanish bosqichlari

```
📦 Bosqich 1 — Poydevor
   ├── Loyiha sozlash (monorepo, ESLint, Prettier)
   ├── Login / Ro'yxatdan o'tish / Chiqish
   ├── Foydalanuvchi profili
   ├── Kategoriyalar ro'yxati
   └── Kartochkalarni ko'rish

🎮 Bosqich 2 — O'quv sistema
   ├── Quiz mexanizmi
   ├── Xotira o'yini
   ├── Audio qo'llab-quvvatlash
   └── Progress kuzatish

🏆 Bosqich 3 — Gamifikatsiya
   ├── XP va Level tizimi
   ├── Tanga va do'kon
   ├── Yutuqlar (Achievements)
   └── Reyting (Leaderboard)

👨‍👩‍👧 Bosqich 4 — Dashboardlar
   ├── Ota-ona paneli
   ├── O'qituvchi paneli
   └── Admin paneli

🤖 Bosqich 5 — AI imkoniyatlar
   ├── AI O'qituvchi (chatbot)
   ├── Shaxsiy o'quv yo'li
   ├── Nutq talaffuz tekshiruvi
   └── AI test va kartochka generatori

🚀 Bosqich 6 — Ishga tushirish
   ├── Keng qamrovli testlar
   ├── Xavfsizlik tekshiruvi
   ├── Optimallashtirish
   ├── Deploy (Vercel + Railway + Neon)
   └── Monitoring sozlash
```

---

## ✅ Xulosa: BrainCards nima?

```
BrainCards = Duolingo + Quizlet + O'yin = Bolalar uchun
```

Bola har kuni **15–20 daqiqa** o'ynab, ingliz tilini eslab qoladi.
Kitob o'qimasdan. Majburlamasdan. O'yin orqali.

---

*Keyingi qadam → 10 ta texnik hujjat yozish → so'ng kod yozish boshlanadi.*
