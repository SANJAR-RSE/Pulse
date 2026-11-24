import { create } from 'zustand';
import { api, errorMessage, setUnauthorizedHandler, tokenStore } from './api';
import { cancelMedicationReminders, resetMedicationReminderCache } from './med-reminders';
import type { User } from './types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: Status;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
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

  login: async (email, password) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email: email.trim(), password });
      await tokenStore.set(data.token);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      throw new Error(errorMessage(err, 'Kirishda xatolik yuz berdi.'));
    }
  },

  register: async (name, email, password) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await tokenStore.set(data.token);
      set({ user: data.user, status: 'authenticated' });
    } catch (err) {
      throw new Error(errorMessage(err, "Ro'yxatdan o'tishda xatolik yuz berdi."));
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
