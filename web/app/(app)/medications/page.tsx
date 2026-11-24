"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Pill } from "lucide-react";
import { useMedications, useMarkMedicationTaken } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddMedicationDialog } from "@/components/health/add-medication-dialog";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function MedicationsPage() {
  const { data, isLoading, isError, refetch } = useMedications();
  const markTaken = useMarkMedicationTaken();
  const [pendingId, setPendingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dorilar</h1>
          <p className="text-sm text-muted-foreground">
            Kundalik dori jadvalingiz va qabul holati.
          </p>
        </div>
        <AddMedicationDialog />
      </div>

      {isLoading && <ListSkeleton count={3} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.medications.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Hali dori belgilanmagan."
          icon={Pill}
        />
      )}

      {data && data.medications.length > 0 && (
        <div className="space-y-2">
          {data.medications.map((m) => (
            <Card key={m._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Pill className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Har kuni · {m.time}</p>
                  </div>
                </div>

                {m.takenToday ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Bugun qabul qilingan
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === m._id}
                    onClick={() => markAsTaken(m._id)}
                    className="gap-1.5"
                  >
                    {pendingId === m._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Qabul qilindi
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
