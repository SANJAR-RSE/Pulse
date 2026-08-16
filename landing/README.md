# PULSE — Landing

PULSE HealthTech ekotizimining marketing/tanishtiruv sahifasi. Next.js App
Router + TypeScript + Tailwind CSS v4 asosida qurilgan, statik (backend
chaqiruvisiz) sahifa.

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` da ochiladi.

## Environment o'zgaruvchilari

`.env.example` dan nusxa oling:

```bash
cp .env.example .env.local
```

| O'zgaruvchi | Tavsif | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_WEB_URL` | PULSE Web ilova manzili (CTA tugmalar shu yerga yo'naltiradi) | `http://localhost:3000` |
| `NEXT_PUBLIC_BOT_USERNAME` | Telegram bot username (`https://t.me/<username>` hosil qilinadi) | `pulse_health_bot` |

## Struktura

```
app/
  layout.tsx        — root layout, metadata
  page.tsx           — barcha sectionlarni yig'adi
  globals.css         — dizayn tokenlari (rang, spacing, shrift)
components/
  ui/                 — Button, Card, Badge (shadcn uslubidagi primitivlar)
  icons.tsx           — inline SVG icon set
  landing/            — Hero, Problem, Solution, DailyHealth, Medical,
                        DigitalQueue, Telegram, PulseAI, Statistics,
                        HowItWorks, FinalCta, Footer, Header
lib/
  site-config.ts       — WEB_URL / TELEGRAM_URL / SITE konstantalari
  utils.ts              — `cn` classname helper
```

## Build

```bash
npm run build
```

## Deploy

Vercel'da Root Directory sifatida `landing/` ko'rsatiladi, environment
o'zgaruvchilari (`NEXT_PUBLIC_WEB_URL`, `NEXT_PUBLIC_BOT_USERNAME`) loyiha
sozlamalarida qo'shiladi.
