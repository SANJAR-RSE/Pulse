"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Activity, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Google sends the mobile app's sign-in here (redirect_uri, token in the URL
// fragment). This page only hands the result back to the PULSE app via its
// fixed deep link — it never goes to any other address.
const APP_RETURN = "pulse://google-auth";
const KEEP = ["id_token", "state", "error"];

// Read the fragment once, then wipe it from the address bar / history.
// "" = nothing to hand over (page opened directly or reloaded).
let captured: string | undefined;
function readOnce(): string {
  if (captured === undefined) {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const out = new URLSearchParams();
    for (const k of KEEP) {
      const v = params.get(k);
      if (v) out.set(k, v);
    }
    captured = out.has("id_token") || out.has("error") ? `${APP_RETURN}?${out.toString()}` : "";
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  }
  return captured;
}
const noSubscribe = () => () => {};

export default function GoogleCallbackPage() {
  const target = useSyncExternalStore(noSubscribe, readOnce, () => undefined);

  useEffect(() => {
    if (target) window.location.replace(target);
  }, [target]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Activity className="h-6 w-6" />
        </div>
        {target === "" ? (
          <>
            <h1 className="text-lg font-semibold">Sahifa eskirgan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu sahifa PULSE mobil ilovasida Google orqali kirish uchun. Ilovaga qaytib, qaytadan urinib ko&apos;ring.
            </p>
            <Button className="mt-5 w-full" nativeButton={false} render={<Link href="/login" />}>
              Saytda kirish
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold">PULSE ilovasiga qaytilmoqda…</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ilova o&apos;zi ochilmasa, pastdagi tugmani bosing.</p>
            {target ? (
              <Button className="mt-5 w-full gap-2" nativeButton={false} render={<a href={target} />}>
                <Smartphone className="h-4 w-4" />
                Ilovani ochish
              </Button>
            ) : (
              <Loader2 className="mx-auto mt-5 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
