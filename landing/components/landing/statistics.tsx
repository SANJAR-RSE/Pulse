import { Card } from "@/components/ui/card";
import {
  DropletIcon,
  MoonIcon,
  DumbbellIcon,
  PillIcon,
  CalendarCheckIcon,
  ClockIcon,
} from "@/components/icons";

const STATS = [
  { icon: DropletIcon, label: "Suv", value: "12.4L" },
  { icon: MoonIcon, label: "Uyqu", value: "51 soat" },
  { icon: DumbbellIcon, label: "Mashg'ulot", value: "3 marta" },
  { icon: PillIcon, label: "Dori qabul qilish", value: "95%" },
  { icon: CalendarCheckIcon, label: "Qabullar", value: "2 ta" },
  { icon: ClockIcon, label: "O'rtacha navbat", value: "18 daqiqa" },
];

export function Statistics() {
  return (
    <section id="statistics" className="border-t border-card-border bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Haftalik statistikangiz — bir qarashda
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            PULSE kiritgan ma&apos;lumotlaringiz asosida haftalik va oylik
            progressni hisoblaydi — bu tashxis emas, shunchaki sizning
            odatlaringiz haqidagi umumiy ko&apos;rinish.
          </p>
        </div>

        <Card className="mt-12 p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Bu hafta
          </p>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <stat.icon className="h-4.5 w-4.5" />
                </span>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
