import { buttonVariants } from "@/components/ui/button";
import { SendIcon, QrCodeIcon, BellIcon } from "@/components/icons";
import { TELEGRAM_URL } from "@/lib/site-config";

const NOTIFICATIONS = [
  "Vitamin D ichish vaqti keldi.",
  "Navbatingiz tasdiqlandi: A-24",
  "Sizning navbatingiz keldi. Iltimos, shifokor xonasiga boring.",
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
              Web&apos;da ro&apos;yxatdan o&apos;tib, Telegram botni bir marta
              ulaysiz. Shundan so&apos;ng ikkala platformadagi barcha
              ma&apos;lumotlar — dori, navbat, appointment — bir xil hisobga
              tegishli bo&apos;ladi.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <QrCodeIcon className="h-4 w-4 shrink-0" />
              Web&apos;dagi &quot;Telegramni ulash&quot; tugmasi orqali QR yoki
              unique kod bilan bir zumda bog&apos;lanadi.
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
              {NOTIFICATIONS.map((text) => (
                <div
                  key={text}
                  className="w-fit max-w-[85%] rounded-2xl rounded-tl-sm border border-card-border bg-white/[0.03] px-4 py-2.5 text-sm text-foreground"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
