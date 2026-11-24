import { Card, CardContent } from "@/components/ui/card";
import {
  HospitalIcon,
  StethoscopeIcon,
  CalendarCheckIcon,
  ClipboardIcon,
  FlaskIcon,
} from "@/components/icons";

const ITEMS = [
  {
    icon: HospitalIcon,
    title: "Klinikalar",
    description: "Shaharning ishonchli klinikalari — manzil, ish vaqti, bo'limlar va reyting bilan.",
  },
  {
    icon: StethoscopeIcon,
    title: "Shifokorlar",
    description: "Mutaxassislik, tajriba va reyting bo'yicha to'g'ri shifokorni tanlang.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Qabulga yozilish",
    description: "Bo'lim → shifokor → sana → bo'sh vaqt — bir necha bosqichda qabulga yoziling.",
  },
  {
    icon: ClipboardIcon,
    title: "Tibbiy tarix",
    description: "Har bir ko'rik, tashxis va tavsiya vaqt tartibida saqlanadi.",
  },
  {
    icon: FlaskIcon,
    title: "Tahlil natijalari",
    description: "Laboratoriya natijalarini istalgan vaqt PULSE'da ko'ring.",
  },
];

export function Medical() {
  return (
    <section id="medical" className="border-t border-card-border bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tibbiyot — bir necha bosqichda
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Klinikadan shifokorgacha, navbatdan tibbiy tarixgacha — barchasi
            PULSE ichida, alohida qidiruv va qo&apos;ng&apos;iroqlarsiz.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Card key={item.title} className="transition-colors duration-200 hover:border-accent/30">
              <CardContent className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
