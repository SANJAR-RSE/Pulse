"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type CodeChallenge } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// "Emailingizga kod yubordik" — 6 digits, auto-submits when complete.
export function CodeStep({
  challenge,
  onVerified,
  onBack,
}: {
  challenge: CodeChallenge;
  onVerified: () => void;
  onBack: () => void;
}) {
  const { verifyCode, resendCode } = useAuthStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendLeft, setResendLeft] = useState(challenge.resendIn);
  const inputRef = useRef<HTMLInputElement>(null);
  const tried = useRef<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendLeft]);

  const submit = async (value: string) => {
    if (busy || value.length !== 6) return;
    tried.current = value;
    setBusy(true);
    setError(null);
    try {
      await verifyCode(challenge.challengeId, value);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri.");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  // Auto-submit once 6 digits are in (typed or pasted) — but not the same wrong code twice.
  useEffect(() => {
    if (code.length === 6 && tried.current !== code) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    try {
      await resendCode(challenge.challengeId);
      setResendLeft(challenge.resendIn);
      setError(null);
      toast.success("Yangi kod emailingizga yuborildi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kodni qayta yuborib bo'lmadi.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-3">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="font-medium">{challenge.email}</span> manziliga 6 xonali kod yubordik. Kod 10 daqiqa amal qiladi.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          tried.current = null;
          void submit(code);
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="code">Tasdiqlash kodi</Label>
          <Input
            id="code"
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            aria-invalid={!!error}
            className="h-12 text-center font-mono text-2xl tracking-[0.5em]"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full gap-2" disabled={busy || code.length !== 6}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Tasdiqlash
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-muted-foreground transition-colors duration-150 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </button>
        {resendLeft > 0 ? (
          <span className="text-muted-foreground tabular-nums">Qayta yuborish: {resendLeft} s</span>
        ) : (
          <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
            Kodni qayta yuborish
          </button>
        )}
      </div>
    </div>
  );
}
