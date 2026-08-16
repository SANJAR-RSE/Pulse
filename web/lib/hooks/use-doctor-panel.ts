import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DoctorPanelQueueEntry, LabResult } from "@/lib/types";

export function useDoctorQueue(date?: string) {
  return useQuery({
    queryKey: ["doctor-panel-queue", date],
    queryFn: async () =>
      (
        await api.get<{ queue: DoctorPanelQueueEntry[] }>("/doctor-panel/queue", {
          params: date ? { date } : undefined,
        })
      ).data,
    refetchInterval: 15_000,
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
    }: {
      appointmentId: string;
      examination: string;
      recommendation?: string;
      labResults?: LabResult[];
    }) =>
      (
        await api.post(`/doctor-panel/appointments/${appointmentId}/complete`, {
          examination,
          recommendation,
          labResults,
        })
      ).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctor-panel-queue"] }),
  });
}
