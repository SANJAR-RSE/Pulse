import { UsersIcon, ActivityIcon, StethoscopeIcon, BellIcon } from "@/components/icons";

const STEPS = [
  {
    icon: UsersIcon,
    title: "Ro'yxatdan o'tish",
    description: "Bir necha soniyada PULSE account yarating va Telegramni ulang.",
  },
  {
    icon: ActivityIcon,
    title: "Sog'liq holatini kuzatish",
    description: "Suv, uyqu, mashg'ulot va dori vaqtlarini har kuni qayd eting.",
  },
  {
    icon: StethoscopeIcon,
    title: "Shifokor topish va navbat olish",
    description: "Kerakli bo'lim va shifokorni tanlang, bo'sh vaqtga yoziling, raqamli navbat oling.",
  },
  {
    icon: BellIcon,
    title: "Telegram orqali bildirishnoma olish",
    description: "Navbat, dori va appointment eslatmalarini Telegramda zudlik bilan oling.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Qanday ishlaydi
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            PULSE bilan tanishish to&apos;rtta oddiy qadamdan iborat.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-muted">
                  <step.icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
