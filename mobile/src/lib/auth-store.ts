import { create } from 'zustand';
import { api, errorMessage, setUnauthorizedHandler, tokenStore } from './api';
import { cancelMedicationReminders, resetMedicationReminderCache } from './med-reminders';
import type { User } from './types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

/** Step 2 of login/sign-up: a 6-digit code was emailed. */
export interface CodeChallenge {
  challengeId: string;
  email: string; // masked, e.g. "sa*****@gmail.com"
  expiresIn: number;
  resendIn: number;
}
type SessionOrCode = { token: string; user: User } | ({ otpRequired: true } & CodeChallenge);

interface AuthState {
  user: User | null;
  status: Status;
  hydrate: () => Promise<void>;
  /** Resolves to a code challenge when the email step is needed, else signs in. */
  login: (email: string, password: string) => Promise<CodeChallenge | null>;
  register: (name: string, email: string, password: string) => Promise<CodeChallenge | null>;
  verifyCode: (challengeId: string, code: string) => Promise<void>;
  resendCode: (challengeId: string) => Promise<void>;
  /** Signs in with a Google ID token bound to `nonce` (see google-auth.ts). */
  loginWithGoogle: (credential: string, nonce: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

type SetState = (partial: Partial<AuthState>) => void;

// Shared by login/register: either a session or the emailed-code step.
async function start(set: SetState, path: string, body: object, fallback: string): Promise<CodeChallenge | null> {
  try {
    const { data } = await api.post<SessionOrCode>(path, body);
    if ('otpRequired' in data) {
      const { challengeId, email, expiresIn, resendIn } = data;
      return { challengeId, email, expiresIn, resendIn };
    }
    await tokenStore.set(data.token);
    set({ user: data.user, status: 'authenticated' });
    return null;
  } catch (err) {
    throw new Error(errorMessage(err, fallback));
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  // On app start: restore the saved token and confirm it is still valid.
  hydrate: async () => {
    const saved = await tokenStore.load().catch(() => null);
    if (!saved) return set({ status: 'unauthenticated' });
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      // Only a rejected token logs out; a network error keeps the session.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 404) {
        await tokenStore.clear();
        set({ user: null, status: 'unauthenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    }
  },

  login: (email, password) =>
    start(set, '/auth/login', { email: email.trim(), password }, 'Kirishda xatolik yuz berdi.'),

  register: (name, email, password) =>
    start(set, '/auth/register', { name: name.trim(), email: email.trim(), password }, "Ro'yxatdan o'tishda xatolik yuz berdi."),

  verifyCode: async (challengeId, code) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/verify-code', { challengeId, code });
      await tokenStore.set(data.token);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      throw new Error(errorMessage(err, "Kodni tasdiqlab bo'lmadi."));
    }
  },

  resendCode: async (challengeId) => {
    try {
      await api.post('/auth/resend-code', { challengeId });
    } catch (err) {
      throw new Error(errorMessage(err, "Kodni qayta yuborib bo'lmadi."));
    }
  },

  loginWithGoogle: async (credential, nonce) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/google', { credential, nonce });
      await tokenStore.set(data.token);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      throw new Error(errorMessage(err, "Google orqali kirib bo'lmadi."));
    }
  },

  logout: async () => {
    // The next person on this phone must not get this user's reminders.
    await cancelMedicationReminders();
    resetMedicationReminderCache();
    await tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },

  setUser: (user) => set({ user }),
}));

setUnauthorizedHandler(() => {
  void useAuth.getState().logout();
});
