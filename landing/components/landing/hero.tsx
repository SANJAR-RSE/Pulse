import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropletIcon,
  MoonIcon,
  DumbbellIcon,
  PillIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { WEB_URL } from "@/lib/site-config";

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
            Suv, uyqu, sport va dorilardan tortib, klinika, shifokor, navbat va
            tibbiy tarixgacha — barchasi Web va Telegramda bitta hisob ostida.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href={WEB_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto">
                PULSE&apos;ni boshlash
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </a>
            <a
              href="#how-it-works"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Qanday ishlaydi
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
            <span>Real backend</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span>Telegram bilan sinxron</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span>PULSE AI yordamchi</span>
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
                Health Score 78%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {DASHBOARD_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-card-border bg-white/[0.02] p-3"
                >
                  <metric.icon className="h-4 w-4 text-accent" />
                  <p className="mt-2 text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Navbat</p>
                <p className="text-sm font-semibold text-foreground">A-24</p>
              </div>
              <p className="text-xs text-accent">Oldingizda: 3 kishi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
