"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_URL, api, getApiErrorMessage, getToken } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { User } from "@/lib/types";

// Real-time bridge: one Socket.IO connection per signed-in user.
// The server only sends "X changed" signals scoped to this user's own rooms;
// we react by invalidating the matching TanStack queries, so every screen
// re-reads the truth from the REST API instantly — no fake client state.

export type RealtimeStatus = "connecting" | "live" | "offline";

const RealtimeContext = createContext<RealtimeStatus>("offline");
export const useRealtimeStatus = () => useContext(RealtimeContext);

// Socket.IO lives at the server root, the REST API under /api.
const SOCKET_ORIGIN = API_URL.replace(/\/api\/?$/, "");

interface IncomingNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  meta?: { medicationId?: string };
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const setUser = useAuthStore((s) => s.setUser);
  const [state, setState] = useState<RealtimeStatus>("offline");

  useEffect(() => {
    const token = getToken();
    if (status !== "authenticated" || !token) return;

    const socket: Socket = io(SOCKET_ORIGIN, {
      auth: { token },
      // Websocket first; long-polling only if a network blocks websockets.
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    const refresh = (...keys: string[]) =>
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

    // Initial connect can take a while on Render's free tier (cold start).
    queueMicrotask(() => setState("connecting"));
    socket.on("connect", () => {
      setState("live");
      // Anything may have changed while we were offline — catch up once.
      refresh("dashboard", "appointments", "queue", "doctor-panel-queue", "notifications");
    });
    socket.on("disconnect", () => setState("connecting"));
    socket.on("connect_error", () => setState("offline"));

    socket.on("notification:new", (n: IncomingNotification) => {
      refresh("notifications", "dashboard");
      if (n.type === "queue_called") {
        // The one moment that must not be missed.
        toast.success(n.title, { description: n.message, duration: 30_000 });
        // Browsers block (and log an error for) vibrate before the user has
        // interacted with the page — only buzz when it's allowed.
        const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
        if ("vibrate" in navigator && (!ua || ua.hasBeenActive)) navigator.vibrate?.([200, 100, 200]);
      } else if (n.type === "queue_near") {
        toast.warning(n.title, { description: n.message, duration: 15_000 });
      } else if (n.type === "medication_reminder" && n.meta?.medicationId) {
        // "Vitamin D ichish vaqti keldi" — mark it taken right from the toast.
        const medId = n.meta.medicationId;
        toast(`💊 ${n.title}`, {
          description: n.message,
          duration: 60_000,
          action: {
            label: "Ichdim",
            onClick: async () => {
              try {
                await api.post(`/health/medications/${medId}/taken`);
                toast.success("Dori qabul qilindi.");
              } catch (err) {
                toast.error(getApiErrorMessage(err, "Dorini belgilab bo'lmadi."));
              }
            },
          },
        });
        refresh("medications");
      } else {
        toast(n.title, { description: n.message });
      }
    });

    socket.on("queue:changed", (p: { reason?: string; date?: string }) => {
      refresh("queue", "dashboard", "appointments", "doctor-panel-queue", "doctor-slots");
      // Doctors are told who joined/left their queue; patients already get a
      // personal notification for anything that concerns them directly.
      if (role === "doctor") {
        if (p.reason === "booked") toast.info("Yangi bemor navbatga yozildi", { description: p.date });
        if (p.reason === "cancelled") toast("Bemor navbatni bekor qildi", { description: p.date });
      }
    });
    socket.on("appointments:changed", () =>
      refresh("appointments", "dashboard", "doctor-slots", "statistics")
    );
    socket.on("records:changed", () => refresh("medical-records", "statistics"));
    socket.on("health:changed", () =>
      refresh("dashboard", "water", "sleep", "workouts", "medications", "statistics")
    );
    socket.on("account:changed", async () => {
      refresh("me");
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const { user } = (await res.json()) as { user: User };
          setUser(user);
          if (user.telegramLinked) toast.success("Telegram muvaffaqiyatli ulandi!");
        }
      } catch {
        /* the profile query will catch up on next refetch */
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.close();
      setState("offline");
    };
    // Reconnect only when the signed-in account changes.
  }, [status, userId, role, qc, setUser]);

  return <RealtimeContext.Provider value={state}>{children}</RealtimeContext.Provider>;
}
