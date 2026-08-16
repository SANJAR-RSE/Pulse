import { create } from "zustand";
import { api, clearToken, getApiErrorMessage, setToken } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  hydrate: async () => {
    const { getToken } = await import("./api");
    const token = getToken();
    if (!token) {
      set({ status: "unauthenticated" });
      return;
    }
    set({ status: "loading" });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, status: "authenticated", error: null });
    } catch {
      clearToken();
      set({ user: null, status: "unauthenticated" });
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      set({ user: res.data.user, status: "authenticated", error: null });
    } catch (err) {
      const message = getApiErrorMessage(err, "Kirishda xatolik yuz berdi.");
      set({ status: "unauthenticated", error: message });
      throw new Error(message);
    }
  },

  register: async (name, email, password) => {
    set({ status: "loading", error: null });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      setToken(res.data.token);
      set({ user: res.data.user, status: "authenticated", error: null });
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Ro'yxatdan o'tishda xatolik yuz berdi."
      );
      set({ status: "unauthenticated", error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, status: "unauthenticated", error: null });
  },

  setUser: (user) => set({ user }),
}));
