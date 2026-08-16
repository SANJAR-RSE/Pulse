"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Star,
  CalendarDays,
  Clock,
  Loader2,
  PartyPopper,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useDoctor, useDoctorSlots, useCreateAppointment } from "@/lib/hooks/use-clinical";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { Appointment, QueueStatus } from "@/lib/types";

function nextDays(count: number) {
  const days: { value: string; label: string }[] = [];
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "short" });
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    days.push({ value, label: formatter.format(d) });
  }
  return days;
}

export default function BookAppointmentPage() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;

  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(days[0]?.value ?? "");
  const [time, setTime] = useState<string | null>(null);
  const [result, setResult] = useState<{
    appointment: Appointment;
    queue: QueueStatus;
  } | null>(null);

  const doctor = useDoctor(doctorId);
  const slots = useDoctorSlots(doctorId, date);
  const createAppointment = useCreateAppointment();

  const confirm = async () => {
    if (!time) return;
    try {
      const data = await createAppointment.mutateAsync({ doctorId, date, time });
      setResult(data);
      toast.success("Navbat muvaffaqiyatli olindi!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Navbat olishda xatolik yuz berdi."));
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Navbat tasdiqlandi!</h1>
          <p className="text-sm text-muted-foreground">
            {result.appointment.date} kuni soat {result.appointment.time} da kutamiz.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-3 py-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Navbat kodingiz
            </p>
            <p className="text-4xl font-bold tracking-tight text-primary">
              {result.queue.code}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Oldingizda {result.queue.aheadCount} kishi
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button render={<Link href="/dashboard" />}>
            <span>Dashboard&apos;ga qaytish</span>
          </Button>
          <Button variant="outline" render={<Link href="/appointments" />}>
            <span>Navbatlarimni ko&apos;rish</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" render={<Link href="/doctors" />}>
        <span className="flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Shifokorlarga qaytish
        </span>
      </Button>

      {doctor.isLoading && <LoadingState label="Shifokor ma'lumotlari yuklanmoqda..." />}
      {doctor.isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => doctor.refetch()} />
      )}

      {doctor.data && (
        <>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-lg text-primary">
                  {doctor.data.doctor.firstName[0]}
                  {doctor.data.doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Dr. {doctor.data.doctor.firstName} {doctor.data.doctor.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{doctor.data.doctor.specialty}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {doctor.data.doctor.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {doctor.data.doctor.clinic?.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" />
              Sanani tanlang
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    setDate(d.value);
                    setTime(null);
                  }}
                  className={cn(
                    "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-150",
                    date === d.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Vaqtni tanlang
            </p>

            {slots.isLoading && <LoadingState label="Bo'sh vaqtlar yuklanmoqda..." />}
            {slots.isError && (
              <ErrorState
                message="Ma'lumotlarni yuklab bo'lmadi."
                onRetry={() => slots.refetch()}
              />
            )}
            {slots.data && slots.data.slots.length === 0 && (
              <EmptyState
                title="Hozircha ma'lumot yo'q."
                description="Ushbu kunda bo'sh vaqt yo'q. Boshqa sanani tanlang."
                icon={Clock}
              />
            )}
            {slots.data && slots.data.slots.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.data.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-sm font-medium transition-colors duration-150",
                      time === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            className="w-full gap-2 sm:w-auto"
            disabled={!time || createAppointment.isPending}
            onClick={confirm}
          >
            {createAppointment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Navbat olish
          </Button>
        </>
      )}
    </div>
  );
}
