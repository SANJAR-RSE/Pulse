import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useRealtimeStatus } from './realtime-status';
import type {
  AIAction,
  AIMessage,
  Appointment,
  Clinic,
  DashboardData,
  Department,
  Doctor,
  DoctorPanelQueueEntry,
  EmergencyContact,
  LabResult,
  MedicalRecord,
  Medication,
  Notification,
  PrescriptionInput,
  QueueStatus,
  SleepLog,
  StatisticsData,
  User,
  WaterLog,
  Workout,
} from './types';

// Query keys match the web app, so the same real-time events refresh both.
const get = async <T>(url: string, params?: object) => (await api.get<T>(url, { params })).data;

// Live data is pushed over the socket; polling is only the offline fallback.
function useFallbackInterval(ms: number) {
  return useRealtimeStatus() === 'live' ? false : ms;
}

// ---------- Account ----------
export const useMe = () => useQuery({ queryKey: ['me'], queryFn: async () => (await get<{ user: User }>('/auth/me')).user });

// ---------- Health ----------
export function useDashboard() {
  const refetchInterval = useFallbackInterval(30_000);
  return useQuery({ queryKey: ['dashboard'], queryFn: () => get<DashboardData>('/health/dashboard'), refetchInterval });
}
export const useStatistics = () => useQuery({ queryKey: ['statistics'], queryFn: () => get<StatisticsData>('/health/statistics') });
export const useWaterLogs = () => useQuery({ queryKey: ['water'], queryFn: () => get<{ logs: WaterLog[]; totalMl: number }>('/health/water') });
export const useSleepLogs = () => useQuery({ queryKey: ['sleep'], queryFn: () => get<{ logs: SleepLog[] }>('/health/sleep') });
export const useWorkouts = () => useQuery({ queryKey: ['workouts'], queryFn: () => get<{ workouts: Workout[] }>('/health/workouts') });
export const useMedications = () => useQuery({ queryKey: ['medications'], queryFn: () => get<{ medications: Medication[] }>('/health/medications') });

function useHealthMutation<V>(fn: (v: V) => Promise<unknown>, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => ['dashboard', 'statistics', ...keys].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
export const useAddWater = () => useHealthMutation((amountMl: number) => api.post('/health/water', { amountMl }), ['water']);
export const useAddSleep = () =>
  useHealthMutation((d: { sleepTime: string; wakeTime: string }) => api.post('/health/sleep', d), ['sleep']);
export const useAddWorkout = () =>
  useHealthMutation((d: { type: string; durationMinutes: number; calories?: number }) => api.post('/health/workouts', d), ['workouts']);
export const useAddMedication = () =>
  useHealthMutation((d: { name: string; time: string }) => api.post('/health/medications', d), ['medications']);
// Optimistic: the intake flips to "Qabul qilindi" the moment it's tapped,
// instead of after the refetch round-trip (it lagged the success toast by
// 1-4 s on mobile networks). Rolled back if the request fails.
export const useMarkMedicationTaken = () => {
  const qc = useQueryClient();
  type MedsData = { medications: Medication[] };
  return useMutation({
    mutationFn: (id: string) => api.post(`/health/medications/${id}/taken`),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['medications'] });
      const prev = qc.getQueryData<MedsData>(['medications']);
      if (prev) {
        qc.setQueryData<MedsData>(['medications'], {
          ...prev,
          medications: prev.medications.map((m) => (m._id === id ? { ...m, takenToday: true } : m)),
        });
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['medications'], ctx.prev);
    },
    onSettled: () => ['dashboard', 'statistics', 'medications'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
};

// ---------- Clinics / doctors / booking ----------
export const useClinics = () => useQuery({ queryKey: ['clinics'], queryFn: () => get<{ clinics: Clinic[] }>('/clinics') });
export const useDepartments = () => useQuery({ queryKey: ['departments'], queryFn: () => get<{ departments: Department[] }>('/departments') });
export const useDoctors = (department?: string) =>
  useQuery({
    queryKey: ['doctors', department ?? 'all'],
    queryFn: () => get<{ doctors: Doctor[] }>('/doctors', department ? { department } : undefined),
  });
export const useDoctor = (id: string) =>
  useQuery({ queryKey: ['doctor', id], queryFn: () => get<{ doctor: Doctor }>(`/doctors/${id}`), enabled: !!id });
export const useDoctorSlots = (id: string, date: string) =>
  useQuery({
    queryKey: ['doctor-slots', id, date],
    queryFn: () => get<{ slots: string[] }>(`/doctors/${id}/slots`, { date }),
    enabled: !!id && !!date,
  });

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { doctorId: string; date: string; time: string }) =>
      (await api.post<{ appointment: Appointment; queue: QueueStatus }>('/appointments', d)).data,
    onSuccess: () => ['appointments', 'dashboard', 'notifications'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
    // Success OR "slot just got taken" — either way the slot grid is stale.
    onSettled: () => qc.invalidateQueries({ queryKey: ['doctor-slots'] }),
  });
}
export const useAppointments = () =>
  useQuery({ queryKey: ['appointments'], queryFn: () => get<{ appointments: Appointment[] }>('/appointments') });
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () =>
      ['appointments', 'dashboard', 'doctor-slots', 'notifications'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
export function useQueueStatus(appointmentId?: string) {
  const refetchInterval = useFallbackInterval(15_000);
  return useQuery({
    queryKey: ['queue', appointmentId],
    queryFn: () => get<QueueStatus>(`/queue/${appointmentId}`),
    enabled: !!appointmentId,
    refetchInterval,
  });
}

// ---------- Records / notifications / emergency ----------
export const useMedicalRecords = () =>
  useQuery({ queryKey: ['medical-records'], queryFn: () => get<{ records: MedicalRecord[] }>('/medical-records') });
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => get<{ notifications: Notification[] }>('/notifications') });
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
export const useEmergencyContacts = () =>
  useQuery({ queryKey: ['emergency'], queryFn: () => get<{ contacts: EmergencyContact[] }>('/emergency') });

// ---------- PULSE AI ----------
export const useAIHistory = () => useQuery({ queryKey: ['ai-history'], queryFn: () => get<{ messages: AIMessage[] }>('/ai/history') });
export const useAIChat = () =>
  useMutation({
    mutationFn: async (message: string) => (await api.post<{ reply: string; action: AIAction | null }>('/ai/chat', { message })).data,
  });

// ---------- Telegram ----------
export const useTelegramLinkCode = () =>
  useMutation({ mutationFn: async () => (await api.post<{ code: string; deepLink: string }>('/telegram/link-code')).data });

// ---------- Doctor panel ----------
export function useDoctorQueue(date?: string) {
  const refetchInterval = useFallbackInterval(15_000);
  return useQuery({
    queryKey: ['doctor-panel-queue', date ?? 'today'],
    queryFn: () => get<{ queue: DoctorPanelQueueEntry[] }>('/doctor-panel/queue', date ? { date } : undefined),
    refetchInterval,
  });
}
export function useCallNextPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<{ called: DoctorPanelQueueEntry | null; near: DoctorPanelQueueEntry | null }>('/doctor-panel/queue/next', {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel-queue'] }),
  });
}
export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      appointmentId: string;
      examination: string;
      recommendation?: string;
      labResults?: LabResult[];
      prescriptions?: PrescriptionInput[];
      goals?: { waterMl?: number; sleepHours?: number; workoutMinutes?: number; note?: string };
    }) =>
      api.post(`/doctor-panel/appointments/${d.appointmentId}/complete`, {
        examination: d.examination,
        recommendation: d.recommendation,
        labResults: d.labResults,
        prescriptions: d.prescriptions,
        goals: d.goals,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-panel-queue'] }),
  });
}
