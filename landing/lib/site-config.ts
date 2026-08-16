export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL?.trim() || "https://pulse-web-delta.vercel.app/";

export const BOT_USERNAME =
  process.env.NEXT_PUBLIC_BOT_USERNAME?.trim() || "pulse_health_bot";

export const TELEGRAM_URL = `https://t.me/${BOT_USERNAME}`;

export const SITE = {
  name: "PULSE",
  tagline: "Your health. One pulse.",
  description:
    "Kundalik salomatlik va tibbiy xizmatlarni bitta ekotizimga birlashtiruvchi HealthTech platforma.",
};
