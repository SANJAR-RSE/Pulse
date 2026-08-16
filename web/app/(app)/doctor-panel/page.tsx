"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardList, Users, ArrowRightCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useCallNextPatient, useDoctorQueue } from "@/lib/hooks/use-doctor-panel";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CompleteExaminationDialog } from "@/components/doctor-panel/complete-examination-dialog";
import type { DoctorPanelQueueEntry } from "@/lib/types";

const STATUS_LABEL: Record<DoctorPanelQueueEntry["status"], string> = {
  WAITING: "Kutmoqda",
  NEAR: "Navbat yaqin",
  CALLED: "Chaqirildi",
  COMPLETED: "Yakunlangan",
  CANCELLED: "Bekor qilingan",
};

const STATUS_VARIANT: Record<
  DoctorPanelQueueEntry["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  WAITING: "outline",
  NEAR: "secondary",
  CALLED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export default function DoctorPanelPage() {
  const router = useRouter();
  const { user, status } = useAuthStore();
  const { data, isLoading, isError, refetch } = useDoctorQueue();
  const callNext = useCallNextPatient();

  useEffect(() => {
    if (status === "authenticated" && user && user.role !== "doctor") {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  if (user && user.role !== "doctor") return null;

  const handleCallNext = async () => {
    try {
      const res = await callNext.mutateAsync(undefined);
      if (res.called) {
        toast.success(`Keyingi bemor chaqirildi: ${res.called.code}`);
      } else {
        toast.info("Navbatda kutayotgan bemor qolmadi.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Keyingi bemorni chaqirib bo'lmadi."));
    }
  };

  const activeCount = data?.queue.filter(
    (q) => q.status === "WAITING" || q.status === "NEAR"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardList className="h-6 w-6 text-primary" />
            Shifokor paneli
          </h1>
          <p className="text-sm text-muted-foreground">Bugungi navbatlaringiz.</p>
        </div>
        <Button className="gap-1.5" disabled={callNext.isPending} onClick={handleCallNext}>
          {callNext.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRightCircle className="h-4 w-4" />
          )}
          Keyingi bemor
        </Button>
      </div>

      {data && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Kutayotgan bemorlar</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.queue.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Bugun uchun navbat topilmadi."
          icon={Users}
        />
      )}

      {data && data.queue.length > 0 && (
        <div className="space-y-2">
          {data.queue.map((q) => (
            <Card key={q._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                    {q.code}
                  </div>
                  <div>
                    <p className="font-medium">{q.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.appointment?.date} · {q.appointment?.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[q.status]}>{STATUS_LABEL[q.status]}</Badge>
                  {q.status === "CALLED" && q.appointment && (
                    <CompleteExaminationDialog
                      appointmentId={
                        typeof q.appointment === "string" ? q.appointment : q.appointment._id
                      }
                      patientName={q.patient?.name ?? ""}
                    />
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
