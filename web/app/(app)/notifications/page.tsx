"use client";

import {
  Bell,
  CalendarCheck,
  CalendarX,
  Users,
  Pill,
  Droplet,
  Moon,
  Dumbbell,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { useMarkNotificationRead, useNotifications } from "@/lib/hooks/use-clinical";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TYPE_ICON: Record<string, LucideIcon> = {
  appointment_confirmed: CalendarCheck,
  appointment_cancelled: CalendarX,
  queue_near: Users,
  queue_called: Users,
  medication_reminder: Pill,
  water_reminder: Droplet,
  sleep_reminder: Moon,
  workout_reminder: Dumbbell,
  health_summary: HeartPulse,
};

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleClick = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await markRead.mutateAsync(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Bildirishnomani belgilab bo'lmadi."));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bildirishnomalar</h1>
        <p className="text-sm text-muted-foreground">
          Navbat, dori va sog&apos;liq bo&apos;yicha xabarnomalar.
        </p>
      </div>

      {isLoading && <ListSkeleton count={4} />}
      {isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => refetch()} />
      )}

      {data && data.notifications.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Hozircha bildirishnoma yo'q."
          icon={Bell}
        />
      )}

      {data && data.notifications.length > 0 && (
        <div className="space-y-2">
          {data.notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            return (
              <Card
                key={n._id}
                className={cn(
                  "cursor-pointer transition-colors duration-150",
                  !n.read && "border-primary/30 bg-primary/5"
                )}
                onClick={() => handleClick(n._id, n.read)}
              >
                <CardContent className="flex items-start gap-3 py-3.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
