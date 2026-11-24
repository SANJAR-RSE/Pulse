import { buttonVariants } from "@/components/ui/button";
import { SendIcon, LinkIcon, BellIcon } from "@/components/icons";
import { TELEGRAM_URL } from "@/lib/site-config";

const NOTIFICATIONS = [
  { text: "Navbatingiz tasdiqlandi: L-24", button: null },
  { text: "💊 Dori ichish vaqti — Vitamin D ichish vaqti keldi (09:00).", button: "✅ Ichdim" },
  { text: "Navbatingiz keldi (L-24). Iltimos, shifokor xonasiga boring.", button: null },
];

export function Telegram() {
  return (
    <section id="telegram" className="border-t border-card-border bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <SendIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Web va Telegram — bitta hisob, ikkita interfeys
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Web yoki mobil ilovada ro&apos;yxatdan o&apos;tib, Telegram botni bir
              marta ulaysiz. Shundan so&apos;ng navbat, dori va appointment — bir
              xil hisobga tegishli: bot orqali navbat olasiz, suv qo&apos;shasiz,
              dori eslatmasida esa bir bosish bilan &quot;Ichdim&quot; deysiz.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <LinkIcon className="h-4 w-4 shrink-0" />
              Profildagi &quot;Telegramni ulash&quot; tugmasi bir martalik havola
              orqali hisobingizni bir zumda bog&apos;laydi.
            </div>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "default", className: "mt-6" })}
            >
              Telegram botni ochish
            </a>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-card-border pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                <BellIcon className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-foreground">PULSE bot</p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.text} className="w-fit max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm border border-card-border bg-white/[0.03] px-4 py-2.5 text-sm text-foreground">
                    {n.text}
                  </div>
                  {n.button && (
                    <div className="mt-1 rounded-lg border border-card-border bg-white/[0.05] py-1.5 text-center text-xs font-medium text-accent">
                      {n.button}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
