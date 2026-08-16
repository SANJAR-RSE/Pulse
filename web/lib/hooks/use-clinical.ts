import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Appointment,
  Clinic,
  Department,
  Doctor,
  EmergencyContact,
  MedicalRecord,
  Notification,
  QueueStatus,
} from "@/lib/types";

export function useClinics() {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: async () => (await api.get<{ clinics: Clinic[] }>("/clinics")).data,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () =>
      (await api.get<{ departments: Department[] }>("/departments")).data,
  });
}

export function useDoctors(filters: { department?: string; clinic?: string }) {
  return useQuery({
    queryKey: ["doctors", filters],
    queryFn: async () =>
      (
        await api.get<{ doctors: Doctor[] }>("/doctors", {
          params: filters,
        })
      ).data,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => (await api.get<{ doctor: Doctor }>(`/doctors/${id}`)).data,
    enabled: !!id,
  });
}

export function useDoctorSlots(id: string, date: string) {
  return useQuery({
    queryKey: ["doctor-slots", id, date],
    queryFn: async () =>
      (
        await api.get<{ slots: string[] }>(`/doctors/${id}/slots`, {
          params: { date },
        })
      ).data,
    enabled: !!id && !!date,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { doctorId: string; date: string; time: string }) =>
      (await api.post("/appointments", data)).data as {
        appointment: Appointment;
        queue: QueueStatus;
      },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () =>
      (await api.get<{ appointments: Appointment[] }>("/appointments")).data,
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch(`/appointments/${id}/cancel`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useQueueStatus(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["queue", appointmentId],
    queryFn: async () =>
      (await api.get<QueueStatus>(`/queue/${appointmentId}`)).data,
    enabled: !!appointmentId,
    refetchInterval: 15_000,
  });
}

export function useMedicalRecords() {
  return useQuery({
    queryKey: ["medical-records"],
    queryFn: async () =>
      (await api.get<{ records: MedicalRecord[] }>("/medical-records")).data,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      (await api.get<{ notifications: Notification[] }>("/notifications")).data,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch(`/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useEmergencyContacts() {
  return useQuery({
    queryKey: ["emergency"],
    queryFn: async () =>
      (await api.get<{ contacts: EmergencyContact[] }>("/emergency")).data,
  });
}
