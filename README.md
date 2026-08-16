# PULSE — Your health. One pulse.

HealthTech ekotizimi: kundalik sog'liq kuzatuvi (suv/uyqu/mashg'ulot/dori), klinika/shifokor topish, raqamli navbat, tibbiy tarix va PULSE AI yordamchi — Web va Telegram'da bitta hisob ostida.

## Live

| Qism | URL |
|---|---|
| 🌐 Landing | https://pulse-landing-sanjar2.vercel.app |
| 💻 Web ilova | https://pulse-web-sanjar2.vercel.app |
| 🔌 Backend API | https://pulse-backend-xw5c.onrender.com/api |
| 🤖 Telegram bot | https://t.me/pulsehakaton_bot |

**Demo login:** `patient@pulse.demo` / `password123` (bemor), `doctor@pulse.demo` / `password123` (shifokor).

> Render bepul tarifi cold start qiladi — birinchi so'rov 30-60 soniya davom etishi mumkin.

## Arxitektura

```
web/       — Next.js patient/doctor ilovasi (Vercel)
landing/   — marketing sahifa (Vercel)
backend/   — Express + Mongoose API, yagona source of truth (Render)
bot/       — Telegraf Telegram bot, backend bilan bir xil PULSE account (Render)
```

Web va Telegram alohida database ishlatmaydi — ikkalasi ham bitta `backend/` API va bitta MongoDB orqali ishlaydi (`API_CONTRACT.md`ga qarang).

## Stack

- **Backend:** Node.js, Express, Mongoose, MongoDB Atlas, JWT, bcrypt, Zod
- **Web/Landing:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand
- **Bot:** Telegraf

## Lokal ishga tushirish

```bash
# 1) Backend
cd backend
cp .env.example .env   # MONGO_URI, JWT_SECRET, BOT_TOKEN, BOT_INTERNAL_SECRET to'ldiring
npm install
npm run seed            # demo klinika/shifokor/foydalanuvchi ma'lumotlari
npm run dev              # http://localhost:4000

# 2) Web
cd web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev               # http://localhost:3000

# 3) Landing (ixtiyoriy)
cd landing
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3001

# 4) Telegram bot
cd bot
cp .env.example .env   # BOT_TOKEN, BACKEND_URL, BOT_INTERNAL_SECRET (backend bilan bir xil!)
npm install
npm start
```

## Deploy

- **Backend/Bot → Render:** Root Directory mos ravishda `backend/` / `bot/`, `render.yaml` blueprint mavjud. Bot bepul tarifda "web service" sifatida ishlaydi (health-check uchun kichik HTTP server + Telegram long-polling bitta processda).
- **Web/Landing → Vercel:** Root Directory `web/` / `landing/`, GitHub repo ulangan — `git push` bilan avtomatik qayta deploy.

## Xavfsizlik

`.env` fayllar `.gitignore`da. `NEXT_PUBLIC_*` o'zgaruvchilar bundan mustasno — ular baribir brauzerga chiqadi, shuning uchun maxfiy emas.
