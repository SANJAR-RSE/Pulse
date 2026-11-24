import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropletIcon,
  MoonIcon,
  DumbbellIcon,
  PillIcon,
  ArrowRightIcon,
  SendIcon,
  AndroidIcon,
} from "@/components/icons";
import { APK_URL, DEMO_ACCOUNTS, DEMO_PASSWORD, TELEGRAM_URL, WEB_URL } from "@/lib/site-config";

const DASHBOARD_METRICS = [
  { icon: DropletIcon, label: "Suv", value: "1.8L / 2.5L" },
  { icon: MoonIcon, label: "Uyqu", value: "7s 20d" },
  { icon: DumbbellIcon, label: "Mashg'ulot", value: "45 daqiqa" },
  { icon: PillIcon, label: "Dori", value: "2 / 2" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 pulse-grid pulse-glow" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:px-8 md:pb-28 md:pt-24">
        <div className="flex flex-col items-start gap-6">
          <Badge>Sog&apos;liq, sport va tibbiyot — bitta ekotizimda</Badge>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            YOUR HEALTH.
            <br />
            <span className="text-accent">ONE PULSE.</span>
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted">
            Salomatligingiz, kundalik odatlaringiz va tibbiy xizmatlaringiz —
            bitta platformada.
          </p>

          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Suv, uyqu, sport va dorilardan tortib, klinika, shifokor, raqamli
            navbat va tibbiy tarixgacha — barchasi Web, mobil ilova va
            Telegramda bitta hisob ostida, real vaqtda sinxron.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
              PULSE&apos;ni boshlash
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a href={APK_URL} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}>
              <AndroidIcon className="h-5 w-5 text-[#3DDC84]" />
              Android ilova
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "lg", className: "w-full sm:w-auto" })}>
              <SendIcon className="h-4 w-4 text-[#229ED9]" />
              Telegram bot
            </a>
          </div>

          <div className="rounded-xl border border-card-border bg-white/[0.02] px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo hisoblar:</span>{" "}
            {DEMO_ACCOUNTS.map((a, i) => (
              <span key={a.email}>
                {i > 0 && " · "}
                {a.role}: <span className="text-muted">{a.email}</span>
              </span>
            ))}{" "}
            · parol <span className="text-muted">{DEMO_PASSWORD}</span>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-card-border bg-card p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Salom, Sanjar</p>
                <p className="text-sm font-medium text-foreground">Bugungi holat</p>
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                Health Score 75%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {DASHBOARD_METRICS.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-card-border bg-white/[0.02] p-3">
                  <metric.icon className="h-4 w-4 text-accent" />
                  <p className="mt-2 text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500 p-3 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Navbatingiz keldi!</p>
                <p className="text-lg font-bold">L-24</p>
              </div>
              <p className="text-xs opacity-90">Shifokor xonasiga boring</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
