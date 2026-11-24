"use client";

import { Moon } from "lucide-react";
import { useSleepLogs } from "@/lib/hooks/use-health";
import { Card, CardContent } from "@/components/ui/card";
import { AddSleepDialog } from "@/components/health/add-sleep-dialog";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} soat ${m} daqiqa`;
}

export default function SleepPage() {
  const { data, isLoading, isError, refetch } = useSleepLogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uyqu</h1>
          <p className="text-sm text-muted-foreground">Uyqu tarixi va statistikasi.</p>
        </div>
        <AddSleepDialog />
      </div>

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.logs.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Hali uyqu qayd etilmagan."
          icon={Moon}
        />
      )}

      {data && data.logs.length > 0 && (
        <div className="space-y-2">
          {data.logs.map((log) => (
            <Card key={log._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Moon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-medium">{formatMinutes(log.durationMinutes)}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.sleepTime} — {log.wakeTime}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{log.date}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
