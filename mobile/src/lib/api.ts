import { create, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Static dot access is required for Expo to inline EXPO_PUBLIC_ vars.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://pulse-backend-co87.onrender.com/api').replace(/\/$/, '');
// Socket.IO lives at the server root, the REST API under /api.
export const SOCKET_ORIGIN = API_URL.replace(/\/api$/, '');

const TOKEN_KEY = 'pulse_token';

// The token lives in the OS keystore (SecureStore); this in-memory copy
// avoids an async keystore read on every request.
let token: string | null = null;

// SecureStore (OS keystore) on phones; localStorage on web, where the
// keystore doesn't exist (web build is used for previews and UI tests).
const store =
  Platform.OS === 'web'
    ? {
        get: async (k: string) => globalThis.localStorage?.getItem(k) ?? null,
        set: async (k: string, v: string) => globalThis.localStorage?.setItem(k, v),
        del: async (k: string) => globalThis.localStorage?.removeItem(k),
      }
    : { get: SecureStore.getItemAsync, set: SecureStore.setItemAsync, del: SecureStore.deleteItemAsync };

export const tokenStore = {
  get: () => token,
  async load() {
    token = await store.get(TOKEN_KEY);
    return token;
  },
  async set(value: string) {
    token = value;
    await store.set(TOKEN_KEY, value);
  },
  async clear() {
    token = null;
    await store.del(TOKEN_KEY);
  },
};

// Render's free tier cold-starts in up to ~60s; don't fail before that.
export const api = create({ baseURL: API_URL, timeout: 60_000 });

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Set by the auth store: an expired/invalid token signs the user out.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error?.config?.url ?? '';
    if (error?.response?.status === 401 && token && !url.startsWith('/auth/login')) onUnauthorized?.();
    return Promise.reject(error);
  }
);

// Every backend error is { error: "human-readable Uzbek message" }.
export function errorMessage(error: unknown, fallback = "Ma'lumotlarni yuklab bo'lmadi."): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { error?: string } | undefined)?.error;
    if (msg) return msg;
    if (!error.response) return "Internet aloqasini tekshiring va qayta urinib ko'ring.";
  }
  return fallback;
}
