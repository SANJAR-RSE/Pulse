"use client";

import { ArrowDownRight, ArrowUpRight, CalendarCheck, Droplet, Dumbbell, Minus, Moon, Pill, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStatistics } from "@/lib/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

// Change vs last week. `higherIsBetter` = false for things like wait time.
function Delta({ now, prev, unit = "", higherIsBetter = true }: { now: number | null; prev: number | null; unit?: string; higherIsBetter?: boolean }) {
  if (now === null || prev === null) return <span className="text-xs text-muted-foreground">O&apos;tgan hafta: —</span>;
  const diff = +(now - prev).toFixed(1);
  if (diff === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" /> O&apos;tgan hafta bilan bir xil ({prev}{unit})
      </span>
    );
  const good = diff > 0 === higherIsBetter;
  const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", good ? "text-emerald-600" : "text-red-600")}>
      <Icon className="h-3.5 w-3.5" />
      {diff > 0 ? "+" : ""}
      {diff}
      {unit} <span className="font-normal text-muted-foreground">(o&apos;tgan hafta: {prev}{unit})</span>
    </span>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  prev,
  goal,
  higherIsBetter,
}: {
  icon: LucideIcon;
  title: string;
  value: number | null;
  unit: string;
  prev: number | null;
  goal?: number;
  higherIsBetter?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Icon className="h-4 w-4 text-primary" />
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold">
          {value === null ? "—" : `${value}${unit}`}
          {goal !== undefined && <span className="text-sm font-normal text-muted-foreground"> / {goal}{unit}</span>}
        </p>
        {goal !== undefined && value !== null && <Progress value={Math.min(100, (value / goal) * 100)} />}
        <Delta now={value} prev={prev} unit={unit} higherIsBetter={higherIsBetter} />
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { data, isLoading, isError, refetch } = useStatistics();
  const t = data?.thisWeek;
  const l = data?.lastWeek;
  const g = data?.weeklyGoals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistika</h1>
        <p className="text-sm text-muted-foreground">
          Oxirgi 7 kun — o&apos;tgan hafta bilan solishtirish
          {g?.setBy ? ` va ${g.setBy} belgilagan haftalik me'yor bilan.` : " va haftalik me'yor bilan."}
        </p>
      </div>

      {isLoading && <CardSkeletonGrid count={6} />}
      {isError && <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />}

      {t && l && g && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Droplet} title="Suv" value={t.waterLiters} unit=" L" prev={l.waterLiters} goal={g.waterLiters} />
          <StatCard icon={Moon} title="Uyqu" value={t.sleepHours} unit=" soat" prev={l.sleepHours} goal={g.sleepHours} />
          <StatCard icon={Dumbbell} title="Workout" value={t.workoutMinutes} unit=" daq" prev={l.workoutMinutes} goal={g.workoutMinutes} />
          <StatCard icon={Pill} title="Dori qabuli" value={t.medicationAdherence} unit="%" prev={l.medicationAdherence} goal={100} />
          <StatCard icon={CalendarCheck} title="Shifokor qabullari" value={t.appointments} unit="" prev={l.appointments} />
          <StatCard icon={Users} title="O'rtacha navbat kutish" value={t.queueAverageMinutes} unit=" daq" prev={l.queueAverageMinutes} higherIsBetter={false} />
        </div>
      )}
    </div>
  );
}
