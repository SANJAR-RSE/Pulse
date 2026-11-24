import { BotIcon, ShieldCheckIcon } from "@/components/icons";

const CONVERSATION = [
  { role: "user" as const, text: "Boshim og'riyapti." },
  {
    role: "ai" as const,
    text: "Boshingiz og'riyotgan bo'lsa, odatda Nevrologiya yoki Terapiya shifokoriga murojaat qilish mumkin. Men tashxis qo'ymayman — sababini faqat shifokor aniqlaydi.",
    notice: true,
    action: "Nevrologiya shifokorlari →",
  },
  { role: "user" as const, text: "Navbatim qachon?" },
  { role: "ai" as const, text: "Sizning navbatingiz L-24. Oldingizda 3 kishi bor." },
  { role: "user" as const, text: "Bugun qancha suv ichdim?" },
  { role: "ai" as const, text: "Siz bugun 1.8 litr suv ichgansiz. Maqsadingiz 2.5 litr." },
];

export function PulseAI() {
  return (
    <section id="ai" className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <BotIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              PULSE AI — sizning sog&apos;liq yordamchingiz
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              PULSE AI real backend ma&apos;lumotlaringiz asosida javob
              beradi: navbatingiz, suv va uyqungiz, tibbiy tarixingiz va
              bugun bo&apos;sh vaqti bor shifokorlar haqida. Shikoyatingizni
              aytsangiz — tegishli bo&apos;lim shifokoriga yo&apos;naltiradi.
              Web, mobil ilova va Telegramda bir xil ishlaydi.
            </p>

            <div className="mt-6 flex gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
              <ShieldCheckIcon className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-foreground">
                PULSE AI hech qachon tashxis qo&apos;ymaydi va dori tavsiya
                etmaydi. Xavfli belgilar (ko&apos;krak og&apos;rig&apos;i, nafas
                qisishi) aytilsa — darhol 103 ga qo&apos;ng&apos;iroq qilishni
                tavsiya qiladi.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-5">
            <div className="flex flex-col gap-3">
              {CONVERSATION.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-accent-strong text-accent-foreground"
                        : "notice" in message && message.notice
                          ? "rounded-tl-sm border border-amber-400/30 bg-amber-400/10 text-foreground"
                          : "rounded-tl-sm border border-card-border bg-white/[0.03] text-foreground"
                    }`}
                  >
                    {"notice" in message && message.notice && (
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Tibbiy xavfsizlik eslatmasi
                      </p>
                    )}
                    {message.text}
                    {"action" in message && message.action && (
                      <span className="mt-2 block w-fit rounded-lg bg-accent-strong px-3 py-1.5 text-xs font-semibold text-white">
                        {message.action}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
