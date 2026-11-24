"use client";

import { Building2, MapPin, Phone, Clock, Star } from "lucide-react";
import { useClinics } from "@/lib/hooks/use-clinical";
import { Card, CardContent } from "@/components/ui/card";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function ClinicsPage() {
  const { data, isLoading, isError, refetch } = useClinics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Klinikalar</h1>
        <p className="text-sm text-muted-foreground">Hamkor klinikalar ro&apos;yxati.</p>
      </div>

      {isLoading && <CardSkeletonGrid count={6} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.clinics.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Klinikalar ro'yxati hozircha bo'sh."
          icon={Building2}
        />
      )}

      {data && data.clinics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.clinics.map((c) => (
            <Card key={c._id}>
              <CardContent className="space-y-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="font-semibold">{c.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{c.rating.toFixed(1)}</span>
                  </div>
                </div>

                {c.description && (
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                )}

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{c.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${c.phone}`} className="hover:text-primary hover:underline">
                      {c.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{c.workingHours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
