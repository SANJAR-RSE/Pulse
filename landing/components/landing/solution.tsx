import { ActivityIcon, SendIcon, ArrowRightIcon } from "@/components/icons";

const FLOW = [
  { label: "Web + Telegram", hint: "Bitta hisob" },
  { label: "Backend API", hint: "Yagona source of truth" },
  { label: "MongoDB", hint: "Yagona baza" },
  { label: "PULSE AI", hint: "Real ma'lumot bilan" },
];

export function Solution() {
  return (
    <section id="solution" className="border-t border-card-border bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <ActivityIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              PULSE — bitta ekotizim, bitta hisob
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              PULSE kundalik salomatlik va tibbiy xizmatlarni yagona
              platformaga birlashtiradi: Web ilova, Telegram bot, PULSE AI
              yordamchi va real backend — barchasi bitta PULSE account va
              bitta MongoDB orqali ishlaydi.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-accent">
              <SendIcon className="h-4 w-4" />
              Web&apos;da qilingan har bir amal Telegramga, Telegramdagi har
              bir amal esa Web&apos;ga zudlik bilan aks etadi.
            </p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-6">
            <div className="flex flex-col items-stretch">
              {FLOW.map((step, index) => (
                <div key={step.label} className="flex flex-col items-center">
                  <div className="flex w-full items-center justify-between rounded-xl border border-card-border bg-white/[0.02] px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{step.hint}</span>
                  </div>
                  {index < FLOW.length - 1 && (
                    <ArrowRightIcon className="my-1 h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
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
