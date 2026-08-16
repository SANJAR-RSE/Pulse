"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Sparkles, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AIAction, AIMessage } from "@/lib/types";
import { SAFETY_NOTICE } from "@/lib/types";
import { actionToLink } from "@/lib/ai-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: AIAction | null;
}

const SUGGESTIONS = [
  "Menga bugun LOR kerak",
  "Navbatim qachon?",
  "Bugun qancha suv ichdim?",
  "Tibbiy tariximni ko'rsat",
];

export default function AIPage() {
  // Messages sent during this session — the initial conversation comes from
  // /ai/history via the query below, merged in at render time so we never
  // need to mirror query data into local state inside an effect.
  const [localTurns, setLocalTurns] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => (await api.get<{ messages: AIMessage[] }>("/ai/history")).data,
  });

  const messages = useMemo<ChatEntry[]>(() => {
    const fromHistory: ChatEntry[] = (history.data?.messages ?? []).map((m, i) => ({
      id: `h-${i}`,
      role: m.role,
      content: m.content,
    }));
    return [...fromHistory, ...localTurns];
  }, [history.data, localTurns]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const chat = useMutation({
    mutationFn: async (message: string) =>
      (await api.post<{ reply: string; action: AIAction | null }>("/ai/chat", { message }))
        .data,
    onSuccess: (data, message) => {
      setLocalTurns((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: message },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          action: data.action,
        },
      ]);
    },
    onError: (_err, message) => {
      setLocalTurns((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: message },
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "PULSE AI bilan aloqa o'rnatilmadi.",
        },
      ]);
    },
  });

  const send = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || chat.isPending) return;
    setInput("");
    chat.mutate(message);
  };

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col lg:h-[calc(100dvh-5.5rem)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">PULSE AI</h1>
          <p className="text-xs text-muted-foreground">
            Navbat, shifokor, suv/uyqu/workout va tibbiy tarix bo&apos;yicha yordamchi.
          </p>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1 px-4 py-4">
          {history.isLoading && <LoadingState label="Suhbat yuklanmoqda..." />}
          {history.isError && (
            <ErrorState message="Ma'lumotlarni yuklab bo'lmadi." onRetry={() => history.refetch()} />
          )}

          {!history.isLoading && !history.isError && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Sizga qanday yordam beray?</p>
                <p className="text-sm text-muted-foreground">
                  Quyidagilardan birini so&apos;rab ko&apos;ring.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m) => {
              const isSafety = m.content === SAFETY_NOTICE;
              const link = actionToLink(m.action);
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] space-y-2 rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]",
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : isSafety
                        ? "rounded-bl-sm border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {isSafety && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Tibbiy xavfsizlik eslatmasi
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    {link && (
                      <Button
                        size="sm"
                        variant={m.role === "user" ? "secondary" : "default"}
                        className="mt-1 gap-1.5"
                        render={<Link href={link.href} />}
                      >
                        <span className="flex items-center gap-1.5">
                          {link.label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {chat.isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  PULSE AI yozmoqda...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Xabar yozing... masalan: Menga bugun LOR kerak"
            className="h-10 flex-1 rounded-lg border border-input bg-transparent px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={chat.isPending || !input.trim()}
            title="Yuborish"
          >
            {chat.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
