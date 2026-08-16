"use client";

import { Dumbbell, Flame } from "lucide-react";
import { useWorkouts } from "@/lib/hooks/use-health";
import { Card, CardContent } from "@/components/ui/card";
import { AddWorkoutDialog } from "@/components/health/add-workout-dialog";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function WorkoutPage() {
  const { data, isLoading, isError, refetch } = useWorkouts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
          <p className="text-sm text-muted-foreground">Mashg&apos;ulotlar tarixi.</p>
        </div>
        <AddWorkoutDialog />
      </div>

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.workouts.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Hali workout qayd etilmagan."
          icon={Dumbbell}
        />
      )}

      {data && data.workouts.length > 0 && (
        <div className="space-y-2">
          {data.workouts.map((w) => (
            <Card key={w._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-medium">{w.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.durationMinutes} daqiqa
                      {w.calories ? ` · ${w.calories} kkal` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {w.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      {w.calories}
                    </span>
                  )}
                  <span>{w.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
