"use client";

import { Droplet, Moon, Dumbbell, Pill, CalendarCheck, Users } from "lucide-react";
import { useStatistics } from "@/lib/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

export default function StatisticsPage() {
  const { data, isLoading, isError, refetch } = useStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistika</h1>
        <p className="text-sm text-muted-foreground">Oxirgi 7 kunlik umumiy ko&apos;rsatkichlar.</p>
      </div>

      {isLoading && <CardSkeletonGrid count={6} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <Droplet className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Suv</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{data.waterLiters} L</p>
              <p className="text-xs text-muted-foreground">Haftalik jami</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <Moon className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Uyqu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{data.sleepHours} soat</p>
              <p className="text-xs text-muted-foreground">Haftalik jami</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{data.workoutSessions}</p>
              <p className="text-xs text-muted-foreground">Mashg&apos;ulotlar soni</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <Pill className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dori qabul qilish
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.medicationAdherence === null ? (
                <p className="text-sm text-muted-foreground">Hozircha ma&apos;lumot yo&apos;q.</p>
              ) : (
                <>
                  <p className="text-2xl font-semibold">{data.medicationAdherence}%</p>
                  <Progress value={data.medicationAdherence} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Navbatlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{data.appointments}</p>
              <p className="text-xs text-muted-foreground">Haftalik jami</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                O&apos;rtacha kutish
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.queueAverageMinutes === null ? (
                <p className="text-sm text-muted-foreground">Hozircha ma&apos;lumot yo&apos;q.</p>
              ) : (
                <p className="text-2xl font-semibold">{data.queueAverageMinutes} daq</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
