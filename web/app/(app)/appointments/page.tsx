"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  Building2,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import { useAppointments, useCancelAppointment, useQueueStatus } from "@/lib/hooks/use-clinical";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import type { Appointment } from "@/lib/types";

const STATUS_LABEL: Record<Appointment["status"], string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

const STATUS_VARIANT: Record<Appointment["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
};

function AppointmentQueueBadge({ appointmentId }: { appointmentId: string }) {
  const queue = useQueueStatus(appointmentId);
  if (!queue.data) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <Users className="h-3.5 w-3.5" />
      {queue.data.code} · Oldingizda {queue.data.aheadCount} kishi
    </div>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelAppointment.mutateAsync(id);
      toast.success("Navbat bekor qilindi.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Navbatni bekor qilib bo'lmadi."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Navbatlarim</h1>
        <p className="text-sm text-muted-foreground">
          Barcha shifokor navbatlaringiz shu yerda.
        </p>
      </div>

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.appointments.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Hali navbat olmadingiz. Shifokorni tanlab, navbat oling."
          icon={CalendarCheck}
          actionLabel="Shifokorni tanlash"
          onAction={() => router.push("/doctors")}
        />
      )}

      {data && data.appointments.length > 0 && (
        <div className="space-y-3">
          {data.appointments.map((a) => (
            <Card key={a._id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {a.date} · {a.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {a.doctor?.firstName} {a.doctor?.lastName} — {a.department?.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {a.clinic?.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                  {(a.status === "confirmed" || a.status === "pending") && (
                    <AppointmentQueueBadge appointmentId={a._id} />
                  )}
                  {(a.status === "confirmed" || a.status === "pending") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      disabled={cancellingId === a._id}
                      onClick={() => cancel(a._id)}
                    >
                      {cancellingId === a._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Navbatni bekor qilish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
