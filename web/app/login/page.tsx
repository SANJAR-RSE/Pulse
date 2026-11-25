"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type CodeChallenge } from "@/lib/auth-store";
import { homePath } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeStep } from "@/components/auth/code-step";
import { GoogleButton } from "@/components/auth/google-button";

const schema = z.object({
  email: z.string().email("Email noto'g'ri formatda."),
  password: z.string().min(1, "Parolni kiriting."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, status, user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace(homePath(user?.role));
  }, [status, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const goHome = () => {
    toast.success("Xush kelibsiz!");
    router.replace(homePath(useAuthStore.getState().user?.role));
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const code = await login(values.email, values.password);
      if (code) setChallenge(code); // step 2: code from the email
      else goHome();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">PULSE&apos;ga xush kelibsiz</h1>
          <p className="text-sm text-muted-foreground">Sog&apos;lig&apos;ingiz — bitta pulsda.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{challenge ? "Emailni tasdiqlang" : "Kirish"}</CardTitle>
            <CardDescription>
              {challenge ? "Xavfsizlik uchun emailingizga kelgan kodni kiriting." : "Hisobingizga kiring va sog'ligingizni kuzating."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challenge ? (
              <CodeStep challenge={challenge} onVerified={goHome} onBack={() => setChallenge(null)} />
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="siz@gmail.com" autoComplete="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Parol</Label>
                    <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Tizimga kirish
                  </Button>
                </form>

                <div className="mt-4">
                  <GoogleButton onSignedIn={goHome} />
                </div>

                <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Demo hisoblar (kodsiz)</p>
                  <p>Bemor: patient@pulse.demo / password123</p>
                  <p>Shifokor: doctor@pulse.demo / password123</p>
                </div>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Hisobingiz yo&apos;qmi?{" "}
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
