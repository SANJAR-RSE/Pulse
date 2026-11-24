"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_URL, getToken } from "@/lib/api";
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
        if (typeof window !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
      } else if (n.type === "queue_near") {
        toast.warning(n.title, { description: n.message, duration: 15_000 });
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

// Small "Live" badge so the doctor/patient can trust what they see.
export function LiveIndicator({ className = "" }: { className?: string }) {
  const s = useRealtimeStatus();
  const label = s === "live" ? "Jonli" : s === "connecting" ? "Ulanmoqda…" : "Oflayn";
  const color =
    s === "live" ? "bg-emerald-500" : s === "connecting" ? "bg-amber-400" : "bg-muted-foreground/50";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground ${className}`}
      title={
        s === "live"
          ? "Ma'lumotlar real vaqtda yangilanmoqda"
          : "Real vaqt aloqasi yo'q — ma'lumotlar vaqti-vaqti bilan yangilanadi"
      }
    >
      <span className="relative flex h-2 w-2">
        {s === "live" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      {label}
    </span>
  );
}
