"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRound, Mail, Shield, Send, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<string, string> = {
  patient: "Bemor",
  doctor: "Shifokor",
  admin: "Administrator",
};

export default function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();
  const [deepLink, setDeepLink] = useState<string | null>(null);

  // The link is completed inside Telegram, not here — so re-read the account
  // (every 4s while a link is pending) instead of trusting the login snapshot.
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<{ user: User }>("/auth/me")).data.user,
    refetchInterval: deepLink && !user?.telegramLinked ? 4000 : false,
  });
  useEffect(() => {
    if (me.data && me.data.telegramLinked !== user?.telegramLinked) {
      setUser(me.data);
      if (me.data.telegramLinked) toast.success("Telegram muvaffaqiyatli ulandi!");
    }
  }, [me.data, user?.telegramLinked, setUser]);

  const linkTelegram = useMutation({
    mutationFn: async () =>
      (await api.post<{ code: string; deepLink: string }>("/telegram/link-code")).data,
    onSuccess: (data) => {
      setDeepLink(data.deepLink);
      toast.success("Havola tayyor! Telegramda oching.");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Telegram havolasini olib bo'lmadi."));
    },
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Hisobingiz ma&apos;lumotlari.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-xl text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
            <Badge variant="secondary" className="mt-1.5 gap-1">
              <Shield className="h-3 w-3" />
              {ROLE_LABEL[user?.role ?? "patient"]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-primary" />
            Telegram bot
          </CardTitle>
          <CardDescription>
            PULSE Telegram botiga ulaning va suv/uyqu/dori eslatmalarini u yerdan ham boshqaring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.telegramLinked ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Telegram ulangan
            </div>
          ) : deepLink ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Quyidagi tugma orqali Telegram botini oching va ulanishni yakunlang.
              </p>
              <Button
                className="gap-1.5"
                render={<a href={deepLink} target="_blank" rel="noreferrer" />}
              >
                <Send className="h-4 w-4" />
                Telegram botni ochish
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={linkTelegram.isPending}
              onClick={() => linkTelegram.mutate()}
            >
              {linkTelegram.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Telegramni ulash
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Hisobdan chiqish
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
            Chiqish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
