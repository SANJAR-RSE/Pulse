"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Building2, Briefcase, ArrowRight, Stethoscope } from "lucide-react";
import { useDepartments, useDoctors } from "@/lib/hooks/use-clinical";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

function DoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const department = searchParams.get("department") ?? "";

  const departments = useDepartments();
  const doctors = useDoctors({ department: department || undefined });

  const setDepartment = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("department", id);
    else params.delete("department");
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shifokorlar</h1>
        <p className="text-sm text-muted-foreground">
          Bo&apos;lim bo&apos;yicha shifokorlarni toping va navbat oling.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={department === "" ? "default" : "outline"}
          onClick={() => setDepartment("")}
        >
          Barchasi
        </Button>
        {departments.data?.departments.map((d) => (
          <Button
            key={d._id}
            size="sm"
            variant={department === d._id ? "default" : "outline"}
            onClick={() => setDepartment(d._id)}
          >
            {d.name}
          </Button>
        ))}
      </div>

      {doctors.isLoading && <CardSkeletonGrid count={6} />}

      {doctors.isError && (
        <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => doctors.refetch()} />
      )}

      {doctors.data && doctors.data.doctors.length === 0 && (
        <EmptyState
          title="Hozircha ma'lumot yo'q."
          description="Ushbu bo'lim bo'yicha shifokor topilmadi. Boshqa bo'limni tanlab ko'ring."
          icon={Stethoscope}
        />
      )}

      {doctors.data && doctors.data.doctors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.data.doctors.map((doc) => {
            const initials = `${doc.firstName[0] ?? ""}${doc.lastName[0] ?? ""}`;
            return (
              <Card key={doc._id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        Dr. {doc.firstName} {doc.lastName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {doc.specialty}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{doc.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate">{doc.clinic?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{doc.experienceYears} yillik tajriba</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{doc.department?.name}</Badge>
                  </div>

                  <Button
                    className="mt-auto w-full gap-1.5"
                    render={<Link href={`/doctors/${doc._id}/book`} />}
                  >
                    <span className={cn("flex w-full items-center justify-center gap-1.5")}>
                      Shifokorni tanlash
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<CardSkeletonGrid count={6} />}>
      <DoctorsContent />
    </Suspense>
  );
}
