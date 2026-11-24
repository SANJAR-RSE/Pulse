import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtimeStatus } from "@/lib/realtime";
import type { DoctorPanelQueueEntry, LabResult, PrescriptionInput } from "@/lib/types";

export function useDoctorQueue(date?: string) {
  const live = useRealtimeStatus() === "live";
  return useQuery({
    queryKey: ["doctor-panel-queue", date],
    queryFn: async () =>
      (
        await api.get<{ queue: DoctorPanelQueueEntry[] }>("/doctor-panel/queue", {
          params: date ? { date } : undefined,
        })
      ).data,
    // Pushed live over the socket; polling is only the offline fallback.
    refetchInterval: live ? false : 15_000,
  });
}

export function useCallNextPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (date?: string) =>
      (await api.post("/doctor-panel/queue/next", date ? { date } : {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctor-panel-queue"] }),
  });
}

export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appointmentId,
      examination,
      recommendation,
      labResults,
      prescriptions,
      goals,
    }: {
      appointmentId: string;
      examination: string;
      recommendation?: string;
      labResults?: LabResult[];
      prescriptions?: PrescriptionInput[];
      goals?: { waterMl?: number; sleepHours?: number; workoutMinutes?: number; note?: string };
    }) =>
      (
        await api.post(`/doctor-panel/appointments/${appointmentId}/complete`, {
          examination,
          recommendation,
          labResults,
          prescriptions,
          goals,
        })
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctor-panel-queue"] }),
  });
}
