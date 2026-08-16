"use client";

import Link from "next/link";
import {
  Droplet,
  Moon,
  Dumbbell,
  Pill,
  CalendarClock,
  Users,
  Sparkles,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useDashboard } from "@/lib/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { AddWaterDialog } from "@/components/health/add-water-dialog";
import { AddSleepDialog } from "@/components/health/add-sleep-dialog";
import { AddWorkoutDialog } from "@/components/health/add-workout-dialog";
import { AddMedicationDialog } from "@/components/health/add-medication-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} daq`;
  if (m === 0) return `${h} soat`;
  return `${h}s ${m}daq`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Salom, {firstName || "foydalanuvchi"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Bugungi sog&apos;liq holatingiz shu yerda.
        </p>
      </div>

      {user?.role === "doctor" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-medium">Siz shifokor sifatida kirdingiz</p>
              <p className="text-xs text-muted-foreground">
                Bugungi navbatlaringizni Shifokor panelida boshqaring.
              </p>
            </div>
            <Button size="sm" render={<Link href="/doctor-panel" />}>
              <span className="flex items-center gap-1.5">
                Shifokor paneliga o&apos;tish
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && (
        <ErrorState
          message="Ma'lumotlarni yuklab bo'lmadi."
          onRetry={() => refetch()}
        />
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Droplet className="h-4 w-4 text-primary" />
                  Suv
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {(data.water.consumedMl / 1000).toFixed(1)}L
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {(data.water.goalMl / 1000).toFixed(1)}L
                  </span>
                </p>
                <Progress
                  value={Math.min(
                    100,
                    (data.water.consumedMl / data.water.goalMl) * 100
                  )}
                />
                <AddWaterDialog />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Moon className="h-4 w-4 text-primary" />
                  Uyqu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {data.sleep ? formatMinutes(data.sleep.durationMinutes) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.sleep
                    ? "Bugun qayd etilgan"
                    : "Hali qayd etilmagan"}
                </p>
                <AddSleepDialog />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  Workout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {formatMinutes(data.workout.totalMinutes)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.workout.totalMinutes > 0
                    ? "Bugungi mashg'ulot"
                    : "Hali mashg'ulot yo'q"}
                </p>
                <AddWorkoutDialog />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Pill className="h-4 w-4 text-primary" />
                  Dorilar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {data.medication.taken} / {data.medication.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.medication.total === 0
                    ? "Dori belgilanmagan"
                    : "Bugun qabul qilingan"}
                </p>
                <AddMedicationDialog />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Keyingi navbat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.nextAppointment ? (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      {data.nextAppointment.date} · {data.nextAppointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.nextAppointment.departmentName} —{" "}
                      {data.nextAppointment.doctorName}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      render={<Link href="/appointments" />}
                    >
                      <span>Navbatlarimni ko&apos;rish</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Hozircha ma&apos;lumot yo&apos;q.
                    </p>
                    <Button size="sm" render={<Link href="/doctors" />}>
                      <span>Shifokorni tanlash</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Navbat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.queue ? (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{data.queue.code}</p>
                    <p className="text-sm text-muted-foreground">
                      Oldingizda: {data.queue.aheadCount} kishi
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Taxminiy kutish: {data.queue.estimatedWaitMinutes} daqiqa
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Hozircha ma&apos;lumot yo&apos;q.
                    </p>
                    <Button size="sm" variant="outline" render={<Link href="/doctors" />}>
                      <span>Navbat olish</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="h-4 w-4 text-primary" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-semibold tracking-tight">
                  {data.healthScore}%
                </p>
                <Progress value={data.healthScore} />
                <p className="text-xs text-muted-foreground">
                  Bu tashxis emas — kundalik faoliyatingiz asosidagi progress.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <CardContent className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">PULSE AI</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Sizga qanday yordam beray?&quot;
                  </p>
                </div>
              </div>
              <Button render={<Link href="/ai" />} className="gap-1.5">
                <span className="flex items-center gap-1.5">
                  AI bilan suhbatlashish
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
