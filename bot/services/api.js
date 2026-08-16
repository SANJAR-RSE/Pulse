// PULSE Telegram bot — backend API wrapper.
// Bot never uses its own database — everything goes through the PULSE backend
// via internal bot headers (x-bot-secret + x-telegram-id).

const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const BOT_INTERNAL_SECRET = process.env.BOT_INTERNAL_SECRET || '';

if (!BOT_INTERNAL_SECRET) {
  console.warn(
    "[OGOHLANTIRISH] BOT_INTERNAL_SECRET .env faylida sozlanmagan. Backend so'rovlari 401/403 bilan qaytishi mumkin."
  );
}

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
});

// Headers used for calls that need the authenticated PULSE user linked to this
// Telegram account (most endpoints).
function forUser(telegramId) {
  return {
    headers: {
      'x-bot-secret': BOT_INTERNAL_SECRET,
      'x-telegram-id': String(telegramId),
    },
  };
}

// Headers used for calls that only need the bot secret (e.g. /telegram/connect,
// before the account is linked — there is no PULSE user to resolve yet).
function botOnlyHeaders() {
  return {
    headers: {
      'x-bot-secret': BOT_INTERNAL_SECRET,
    },
  };
}

const NOT_LINKED_MESSAGE =
  "Siz hali PULSE akkauntingizni Telegram bilan ulamagansiz.\n\n" +
  "Avval Web'da ro'yxatdan o'ting va Telegramni ulang: PULSE Web'da profil bo'limidan " +
  "\"Telegramni ulash\" tugmasini bosing, u yerda chiqqan kodni menga /start <kod> ko'rinishida yuboring.";

const GENERIC_ERROR_MESSAGE = "Kechirasiz, xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.";

function isNotLinkedError(err) {
  return Boolean(
    err &&
      err.response &&
      err.response.status === 404 &&
      err.response.data &&
      err.response.data.error === 'TAYINLANMAGANSIZ'
  );
}

// Turns any axios error into a short, human-readable Uzbek message — never a
// stack trace. Prefers the backend's own message (already human-readable per
// API_CONTRACT.md) when available, falls back to a generic message otherwise
// (network errors, timeouts, 5xx without a body, etc.).
function getErrorMessage(err) {
  if (isNotLinkedError(err)) return NOT_LINKED_MESSAGE;
  if (err && err.response && err.response.data && typeof err.response.data.error === 'string') {
    return err.response.data.error;
  }
  return GENERIC_ERROR_MESSAGE;
}

module.exports = {
  api,
  forUser,
  botOnlyHeaders,
  isNotLinkedError,
  getErrorMessage,
  NOT_LINKED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  BOT_INTERNAL_SECRET,
};
