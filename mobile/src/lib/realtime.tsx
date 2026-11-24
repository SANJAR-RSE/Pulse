import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { io, type Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/toast';
import { SOCKET_ORIGIN, api, tokenStore } from './api';
import { useAuth } from './auth-store';
import { notifyDevice, setupNotifications } from './notifications';
import { RealtimeContext, type RealtimeStatus } from './realtime-status';
import type { User } from './types';

// One Socket.IO connection per signed-in user. The server only sends
// "X changed" signals scoped to this user's own rooms; we refetch the
// affected queries from the REST API, which stays the single source of truth.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const toast = useToast();
  const status = useAuth((s) => s.status);
  const userId = useAuth((s) => s.user?.id);
  const role = useAuth((s) => s.user?.role);
  const setUser = useAuth((s) => s.setUser);
  const [state, setState] = useState<RealtimeStatus>('offline');

  useEffect(() => {
    const token = tokenStore.get();
    if (status !== 'authenticated' || !token) return;
    void setupNotifications();

    const socket: Socket = io(SOCKET_ORIGIN, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
    });
    const refresh = (...keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

    queueMicrotask(() => setState('connecting'));
    socket.on('connect', () => {
      setState('live');
      // Anything may have changed while we were away — catch up once.
      refresh('dashboard', 'appointments', 'queue', 'doctor-panel-queue', 'notifications');
    });
    socket.on('disconnect', () => setState('connecting'));
    socket.on('connect_error', () => setState('offline'));

    socket.on('notification:new', (n: { type: string; title: string; message: string; meta?: { medicationId?: string } }) => {
      refresh('notifications', 'dashboard');
      if (n.type === 'medication_reminder') {
        refresh('medications');
        // In the background the phone's own scheduled reminder shows it.
        if (AppState.currentState !== 'active') return;
        const medId = n.meta?.medicationId;
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        toast({
          type: 'warning',
          title: `💊 ${n.title}`,
          message: n.message,
          duration: 30_000,
          action: medId
            ? {
                label: 'Ichdim',
                onPress: () => {
                  api
                    .post(`/health/medications/${medId}/taken`)
                    .then(() => toast({ type: 'success', title: 'Dori qabul qilindi' }))
                    .catch(() => toast({ type: 'error', title: "Dorini belgilab bo'lmadi." }));
                },
              }
            : undefined,
        });
        return;
      }
      if (n.type === 'queue_called') {
        toast({ type: 'success', title: n.title, message: n.message, duration: 15_000 });
        void notifyDevice(n.title, n.message, true);
      } else if (n.type === 'queue_near') {
        toast({ type: 'warning', title: n.title, message: n.message, duration: 8000 });
        void notifyDevice(n.title, n.message, true);
      } else {
        toast({ type: 'info', title: n.title, message: n.message });
        void notifyDevice(n.title, n.message);
      }
    });

    socket.on('queue:changed', (p: { reason?: string; date?: string }) => {
      refresh('queue', 'dashboard', 'appointments', 'doctor-panel-queue', 'doctor-slots');
      if (role === 'doctor') {
        if (p.reason === 'booked') {
          toast({ type: 'info', title: 'Yangi bemor navbatga yozildi', message: p.date });
          void notifyDevice('Yangi bemor', 'Navbatingizga yangi bemor yozildi.');
        }
        if (p.reason === 'cancelled') toast({ type: 'warning', title: 'Bemor navbatni bekor qildi', message: p.date });
      }
    });
    socket.on('appointments:changed', () => refresh('appointments', 'dashboard', 'doctor-slots', 'statistics'));
    socket.on('records:changed', () => refresh('medical-records', 'statistics'));
    socket.on('health:changed', () => refresh('dashboard', 'water', 'sleep', 'workouts', 'medications', 'statistics'));
    socket.on('account:changed', async () => {
      try {
        const { data } = await api.get<{ user: User }>('/auth/me');
        setUser(data.user);
        refresh('me');
        if (data.user.telegramLinked) toast({ type: 'success', title: 'Telegram muvaffaqiyatli ulandi!' });
      } catch {
        /* profile refetch will catch up */
      }
    });

    // Phones suspend sockets in the background: reconnect + refresh on return.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        if (!socket.connected) socket.connect();
        refresh('dashboard', 'queue', 'appointments', 'doctor-panel-queue', 'notifications');
      }
    });

    return () => {
      sub.remove();
      socket.removeAllListeners();
      socket.close();
      setState('offline');
    };
  }, [status, userId, role, qc, setUser, toast]);

  return <RealtimeContext.Provider value={state}>{children}</RealtimeContext.Provider>;
}
