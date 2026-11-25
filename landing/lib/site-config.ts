// Every outbound link on the landing lives here — one place to update.
export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL?.trim() || "https://pulse-web-sanjar2.vercel.app";

export const BOT_USERNAME =
  process.env.NEXT_PUBLIC_BOT_USERNAME?.trim() || "pulsehakaton_bot";

export const TELEGRAM_URL = `https://t.me/${BOT_USERNAME}`;

// Android build of the PULSE mobile app (Expo / EAS).
export const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL?.trim() ||
  "https://expo.dev/artifacts/eas/CMSPGqCiiiMalgOO3-1tsH_Wy1_DSW888Ib4rNhpMZk.apk";

export const GITHUB_URL = "https://github.com/SANJAR-RSE/Pulse";

export const DEMO_ACCOUNTS = [
  { role: "Bemor", email: "patient@pulse.demo" },
  { role: "Shifokor", email: "doctor@pulse.demo" },
];
export const DEMO_PASSWORD = "password123";

export const SITE = {
  name: "PULSE",
  tagline: "Your health. One pulse.",
  description:
    "Kundalik salomatlik va tibbiy xizmatlarni Web, mobil ilova va Telegramda bitta hisob ostida birlashtiruvchi HealthTech platforma.",
};
