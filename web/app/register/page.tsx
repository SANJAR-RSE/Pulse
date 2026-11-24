"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgidan iborat bo'lsin."),
  email: z.string().email("Email noto'g'ri formatda."),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin."),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, status } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi."
      );
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
          <h1 className="text-xl font-semibold tracking-tight">PULSE&apos;da ro&apos;yxatdan o&apos;ting</h1>
          <p className="text-sm text-muted-foreground">Bir necha soniyada boshlang.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ro&apos;yxatdan o&apos;tish</CardTitle>
            <CardDescription>Yangi hisob yarating va PULSE&apos;dan foydalaning.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Ism</Label>
                <Input
                  id="name"
                  placeholder="Sanjar Aliyev"
                  autoComplete="name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="siz@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Kamida 6 belgi"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Hisob yaratish
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Hisobingiz bormi?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Tizimga kirish
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
