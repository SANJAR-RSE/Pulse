import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminAppointment, AdminOverview, AdminUsersPage, Role } from "@/lib/types";

// Admin data refreshes on its own every 30 s so the panel stays current
// during a demo without anyone pressing reload.
const REFRESH = 30_000;

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => (await api.get<AdminOverview>("/admin/overview")).data,
    refetchInterval: REFRESH,
  });
}

export function useAdminUsers(params: { search: string; role: Role | "all"; page: number }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () =>
      (
        await api.get<AdminUsersPage>("/admin/users", {
          params: {
            search: params.search || undefined,
            role: params.role === "all" ? undefined : params.role,
            page: params.page,
            limit: 10,
          },
        })
      ).data,
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH,
  });
}

export function useAdminAppointments() {
  return useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: async () => (await api.get<{ appointments: AdminAppointment[] }>("/admin/appointments", { params: { limit: 8 } })).data.appointments,
    refetchInterval: REFRESH,
  });
}
