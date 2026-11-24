import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardData,
  Medication,
  SleepLog,
  StatisticsData,
  WaterLog,
  Workout,
} from "@/lib/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<DashboardData>("/health/dashboard")).data,
    refetchInterval: 30_000,
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: async () => (await api.get<StatisticsData>("/health/statistics")).data,
  });
}

export function useWaterLogs() {
  return useQuery({
    queryKey: ["water"],
    queryFn: async () =>
      (await api.get<{ logs: WaterLog[]; totalMl: number }>("/health/water")).data,
  });
}

export function useAddWater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amountMl: number) =>
      (await api.post("/health/water", { amountMl })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useSleepLogs() {
  return useQuery({
    queryKey: ["sleep"],
    queryFn: async () => (await api.get<{ logs: SleepLog[] }>("/health/sleep")).data,
  });
}

export function useAddSleep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sleepTime: string; wakeTime: string }) =>
      (await api.post("/health/sleep", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sleep"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () =>
      (await api.get<{ workouts: Workout[] }>("/health/workouts")).data,
  });
}

export function useAddWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      type: string;
      durationMinutes: number;
      calories?: number;
    }) => (await api.post("/health/workouts", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useMedications() {
  return useQuery({
    queryKey: ["medications"],
    queryFn: async () =>
      (await api.get<{ medications: Medication[] }>("/health/medications")).data,
  });
}

export function useAddMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; time: string }) =>
      (await api.post("/health/medications", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useMarkMedicationTaken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post(`/health/medications/${id}/taken`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}
