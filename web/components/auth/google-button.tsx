"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
let gisLoading: Promise<void> | null = null;
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve();
  gisLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoading = null;
      reject(new Error("Google skriptini yuklab bo'lmadi."));
    };
    document.head.appendChild(s);
  });
  return gisLoading;
}

// "Google orqali kirish". Rendered only when the backend has a Google client
// id configured (GET /auth/config) — otherwise nothing is shown.
export function GoogleButton({ onSignedIn, text = "signin_with" }: { onSignedIn: () => void; text?: "signin_with" | "signup_with" }) {
  const box = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const done = useRef(onSignedIn);
  useEffect(() => {
    done.current = onSignedIn;
  }, [onSignedIn]);

  useEffect(() => {
    let alive = true;
    api
      .get<{ googleClientId: string | null }>("/auth/config")
      .then(({ data }) => alive && setClientId(data.googleClientId))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!clientId || !box.current) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !box.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              await loginWithGoogle(credential);
              toast.success("Xush kelibsiz!");
              done.current();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Google orqali kirib bo'lmadi.");
            }
          },
        });
        window.google.accounts.id.renderButton(box.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text,
          locale: "uz",
          width: Math.min(box.current.clientWidth || 320, 400),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogle, text]);

  if (!clientId) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        yoki
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={box} className="flex min-h-10 w-full justify-center" data-testid="google-button" />
    </div>
  );
}
