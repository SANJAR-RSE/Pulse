import { create } from "zustand";
import { api, clearToken, getApiErrorMessage, setToken } from "./api";
import type { User } from "./types";

/** Step 2 of login/sign-up: a 6-digit code was emailed. */
export interface CodeChallenge {
  challengeId: string;
  email: string; // masked, e.g. "sa*****@gmail.com"
  expiresIn: number; // seconds
  resendIn: number; // seconds
}

type SessionOrCode = { token: string; user: User } | ({ otpRequired: true } & CodeChallenge);

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  hydrate: () => Promise<void>;
  /** Resolves to a code challenge when the email step is needed, else signs in. */
  login: (email: string, password: string) => Promise<CodeChallenge | null>;
  register: (name: string, email: string, password: string) => Promise<CodeChallenge | null>;
  verifyCode: (challengeId: string, code: string) => Promise<void>;
  resendCode: (challengeId: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const accept = (data: { token: string; user: User }) => {
    setToken(data.token);
    set({ user: data.user, status: "authenticated", error: null });
  };

  // Shared by login/register: either a session or the code step.
  const start = async (path: string, body: object, fallback: string): Promise<CodeChallenge | null> => {
    try {
      const { data } = await api.post<SessionOrCode>(path, body);
      if ("otpRequired" in data) {
        const { challengeId, email, expiresIn, resendIn } = data;
        return { challengeId, email, expiresIn, resendIn };
      }
      accept(data);
      return null;
    } catch (err) {
      const message = getApiErrorMessage(err, fallback);
      set({ error: message });
      throw new Error(message);
    }
  };

  return {
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

    login: (email, password) => start("/auth/login", { email, password }, "Kirishda xatolik yuz berdi."),

    register: (name, email, password) =>
      start("/auth/register", { name, email, password }, "Ro'yxatdan o'tishda xatolik yuz berdi."),

    verifyCode: async (challengeId, code) => {
      try {
        const { data } = await api.post("/auth/verify-code", { challengeId, code });
        accept(data);
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Kodni tasdiqlab bo'lmadi."));
      }
    },

    resendCode: async (challengeId) => {
      try {
        await api.post("/auth/resend-code", { challengeId });
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Kodni qayta yuborib bo'lmadi."));
      }
    },

    loginWithGoogle: async (credential) => {
      try {
        const { data } = await api.post("/auth/google", { credential });
        accept(data);
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Google orqali kirib bo'lmadi."));
      }
    },

    logout: () => {
      clearToken();
      set({ user: null, status: "unauthenticated", error: null });
    },

    setUser: (user) => set({ user }),
  };
});
