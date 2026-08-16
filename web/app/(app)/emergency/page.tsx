"use client";

import { Siren, Phone } from "lucide-react";
import { useEmergencyContacts } from "@/lib/hooks/use-clinical";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export default function EmergencyPage() {
  const { data, isLoading, isError, refetch } = useEmergencyContacts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Siren className="h-6 w-6 text-destructive" />
          Favqulodda yordam
        </h1>
        <p className="text-sm text-muted-foreground">
          Zudlik bilan bog&apos;lanish uchun kontaktlar.
        </p>
      </div>

      {isLoading && <ListSkeleton count={3} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.contacts.length === 0 && (
        <EmptyState title="Hozircha ma'lumot yo'q." icon={Siren} />
      )}

      {data && data.contacts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.contacts.map((c, i) => (
            <Card key={i} className="border-destructive/20">
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{c.name}</p>
                    <Badge variant="outline">{c.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-0.5 text-sm font-medium">{c.phone}</p>
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="shrink-0"
                  render={<a href={`tel:${c.phone}`} aria-label={`${c.name}ga qo'ng'iroq qilish`} />}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
