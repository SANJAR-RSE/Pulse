"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LoadingState } from "@/components/shared/loading-state";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState label="Yuklanmoqda..." />
      </div>
    );
  }

  if (status !== "authenticated") return null;

  return <>{children}</>;
}
