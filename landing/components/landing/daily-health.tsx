import { Card, CardContent } from "@/components/ui/card";
import { DropletIcon, MoonIcon, DumbbellIcon, PillIcon } from "@/components/icons";

const ITEMS = [
  {
    icon: DropletIcon,
    title: "Suv",
    description: "Kunlik maqsad, ichilgan miqdor va eslatmalar — progress bir qarashda.",
    stat: "1.8L / 2.5L",
  },
  {
    icon: MoonIcon,
    title: "Uyqu",
    description: "Uxlash va uyg'onish vaqti, davomiylik va haftalik statistika.",
    stat: "7s 20d",
  },
  {
    icon: DumbbellIcon,
    title: "Mashg'ulot",
    description: "Mashg'ulot turi, davomiyligi va haftalik progress tarixi.",
    stat: "45 daqiqa",
  },
  {
    icon: PillIcon,
    title: "Dori",
    description: "Dori jadvali, eslatma va qabul qilinganini belgilash.",
    stat: "2 / 2 qabul qilindi",
  },
];

export function DailyHealth() {
  return (
    <section id="daily-health" className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Kundalik salomatlik — bir joyda
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Suv, uyqu, sport va dori — har kuni kuzatiladigan to&apos;rtta
            asosiy ko&apos;rsatkich, bittasi ham e&apos;tibordan chetda
            qolmaydi.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <Card key={item.title} className="transition-colors duration-200 hover:border-accent/30">
              <CardContent className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                <p className="mt-4 text-sm font-semibold text-accent">{item.stat}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
