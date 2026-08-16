"use client";

import { Droplet } from "lucide-react";
import { useWaterLogs } from "@/lib/hooks/use-health";
import { Card, CardContent } from "@/components/ui/card";
import { AddWaterDialog } from "@/components/health/add-water-dialog";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function WaterPage() {
  const { data, isLoading, isError, refetch } = useWaterLogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suv</h1>
          <p className="text-sm text-muted-foreground">
            Bugungi ichgan suvingiz tarixi.
          </p>
        </div>
        <AddWaterDialog />
      </div>

      {data && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Droplet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{(data.totalMl / 1000).toFixed(1)} L</p>
              <p className="text-xs text-muted-foreground">Bugun jami ichilgan suv</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.logs.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Bugun hali suv qo'shmadingiz."
          icon={Droplet}
        />
      )}

      {data && data.logs.length > 0 && (
        <div className="space-y-2">
          {data.logs.map((log) => (
            <Card key={log._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  <Droplet className="h-4 w-4 text-primary" />
                  <span className="font-medium">{log.amountMl} ml</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
