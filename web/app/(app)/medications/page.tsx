"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Loader2, Pill, Stethoscope, UtensilsCrossed } from "lucide-react";
import { useMedications, useMarkMedicationTaken } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddMedicationDialog } from "@/components/health/add-medication-dialog";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MEAL_LABEL, type Medication } from "@/lib/types";

// A prescribed medicine with N daily intakes = N Medication docs sharing a
// courseId; show them as one card with one row per intake time.
function groupCourses(meds: Medication[]) {
  const groups = new Map<string, Medication[]>();
  for (const m of meds) {
    const key = m.courseId ?? m._id;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  return [...groups.values()].map((items) => items.sort((a, b) => a.time.localeCompare(b.time)));
}

function prettyDate(d?: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export default function MedicationsPage() {
  const { data, isLoading, isError, refetch } = useMedications();
  const markTaken = useMarkMedicationTaken();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const meds = data?.medications ?? [];
  const groups = groupCourses(meds);
  const doctorGroups = groups.filter((g) => g[0].source === "doctor");
  const selfGroups = groups.filter((g) => g[0].source !== "doctor");
  const taken = meds.filter((m) => m.takenToday).length;

  const markAsTaken = async (id: string) => {
    setPendingId(id);
    try {
      await markTaken.mutateAsync(id);
      toast.success("Dori qabul qilingan deb belgilandi.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Dorini belgilab bo'lmadi."));
    } finally {
      setPendingId(null);
    }
  };

  const renderGroup = (items: Medication[]) => {
    const first = items[0];
    const isDoctor = first.source === "doctor";
    return (
      <Card key={first.courseId ?? first._id} className={isDoctor ? "border-primary/25" : undefined}>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pill className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-medium">{first.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[first.dosage, `kuniga ${items.length} mahal`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {isDoctor && (
              <Badge variant="secondary" className="gap-1">
                <Stethoscope className="h-3 w-3" />
                {first.doctorName || "Shifokor"}
              </Badge>
            )}
          </div>

          {(first.mealRelation && first.mealRelation !== "any") || first.endDate || first.note ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {first.mealRelation && first.mealRelation !== "any" && (
                <span className="flex items-center gap-1">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  {MEAL_LABEL[first.mealRelation]}
                </span>
              )}
              {first.endDate && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {prettyDate(first.endDate)} gacha
                </span>
              )}
              {first.note && <span>📝 {first.note}</span>}
            </div>
          ) : null}

          <div className="space-y-1.5">
            {items.map((m) => (
              <div key={m._id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium tabular-nums">{m.time}</span>
                {m.takenToday ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Qabul qilindi
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" disabled={pendingId === m._id} onClick={() => markAsTaken(m._id)} className="h-7 gap-1.5">
                    {pendingId === m._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Qabul qilindi
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dorilar</h1>
          <p className="text-sm text-muted-foreground">
            Bugun qabul qilingan: {taken} / {meds.length}. Har qabul vaqtida eslatma keladi.
          </p>
        </div>
        <AddMedicationDialog />
      </div>

      {isLoading && <ListSkeleton count={3} />}
      {isError && <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />}

      {data && meds.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Shifokoringiz yozgan dorilar ko'rikdan keyin shu yerda avtomatik paydo bo'ladi. O'zingiz ham qo'shishingiz mumkin."
          icon={Pill}
        />
      )}

      {doctorGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Stethoscope className="h-4 w-4" /> Shifokor tayinlagan
          </h2>
          {doctorGroups.map(renderGroup)}
        </section>
      )}

      {selfGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">O&apos;zim qo&apos;shganlarim</h2>
          {selfGroups.map(renderGroup)}
        </section>
      )}
    </div>
  );
}
