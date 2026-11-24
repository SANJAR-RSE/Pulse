"use client";

import { useRouter } from "next/navigation";
import { FileClock, Building2, FlaskConical, Pill, Stethoscope, Target } from "lucide-react";
import { MEAL_LABEL } from "@/lib/types";
import { useMedicalRecords } from "@/lib/hooks/use-clinical";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function MedicalHistoryPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMedicalRecords();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tibbiy tarix</h1>
        <p className="text-sm text-muted-foreground">
          Shifokor ko&apos;riklaringiz va tavsiyalar tarixi.
        </p>
      </div>

      {isLoading && <ListSkeleton count={3} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.records.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Shifokor ko'rigi yakunlangach, tibbiy yozuvlaringiz shu yerda paydo bo'ladi."
          icon={FileClock}
          actionLabel="Shifokorni tanlash"
          onAction={() => router.push("/doctors")}
        />
      )}

      {data && data.records.length > 0 && (
        <div className="relative space-y-6 border-l border-border pl-6">
          {data.records.map((r) => (
            <div key={r._id} className="relative">
              <span className="absolute -left-[1.65rem] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary" />
              <Card>
                <CardContent className="space-y-3 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{r.date}</p>
                    <span className="text-xs text-muted-foreground">
                      {r.department?.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Dr. {r.doctor?.firstName} {r.doctor?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {r.clinic?.name}
                    </span>
                  </div>

                  {r.examination && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Ko&apos;rik</p>
                      <p className="text-sm">{r.examination}</p>
                    </div>
                  )}

                  {r.recommendation && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Tavsiya</p>
                      <p className="text-sm">{r.recommendation}</p>
                    </div>
                  )}

                  {!!r.prescriptions?.length && (
                    <div>
                      <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Pill className="h-3.5 w-3.5" />
                        Yozilgan dorilar
                      </p>
                      <div className="space-y-1.5">
                        {r.prescriptions.map((p, i) => (
                          <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                            <p className="font-medium">
                              {p.name}
                              {p.dosage && <span className="font-normal text-muted-foreground"> — {p.dosage}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Kuniga {p.times.length} mahal ({p.times.join(", ")})
                              {p.mealRelation && p.mealRelation !== "any" ? ` · ${MEAL_LABEL[p.mealRelation]}` : ""} · {p.durationDays} kun
                              {p.note ? ` · ${p.note}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.goals && (
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Kunlik me&apos;yorlar
                      </p>
                      <p className="text-sm">
                        {[
                          r.goals.waterMl ? `Suv ${(r.goals.waterMl / 1000).toFixed(1)} L` : null,
                          r.goals.sleepHours ? `Uyqu ${r.goals.sleepHours} soat` : null,
                          r.goals.workoutMinutes !== undefined ? `Workout ${r.goals.workoutMinutes} daqiqa` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {r.goals.note && <p className="text-xs text-muted-foreground">{r.goals.note}</p>}
                    </div>
                  )}

                  {r.labResults.length > 0 && (
                    <div>
                      <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Laboratoriya natijalari
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                              <th className="px-3 py-1.5 text-left font-medium">Ko&apos;rsatkich</th>
                              <th className="px-3 py-1.5 text-left font-medium">Natija</th>
                              <th className="px-3 py-1.5 text-left font-medium">Norma</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.labResults.map((lab, i) => (
                              <tr key={i} className="border-t border-border">
                                <td className="px-3 py-1.5">{lab.name}</td>
                                <td className="px-3 py-1.5">
                                  {lab.value} {lab.unit}
                                </td>
                                <td className="px-3 py-1.5 text-muted-foreground">
                                  {lab.normalRange || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
