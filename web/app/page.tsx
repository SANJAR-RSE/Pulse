"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LoadingState } from "@/components/shared/loading-state";

export default function RootPage() {
  const { status, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingState label="PULSE yuklanmoqda..." />
    </div>
  );
}
