import { Card, CardContent } from "@/components/ui/card";
import { DropletIcon, HospitalIcon, ClockIcon, ClipboardIcon } from "@/components/icons";

const PAIN_POINTS = [
  {
    icon: DropletIcon,
    title: "Kundalik odatlar tarqoq",
    description:
      "Suv, uyqu, sport va dori vaqtlari turli ilova va qog'ozlarda yuritiladi, birortasi ham to'liq rasm bermaydi.",
  },
  {
    icon: HospitalIcon,
    title: "Klinika qidirish vaqt oladi",
    description:
      "To'g'ri bo'lim, shifokor va bo'sh vaqtni topish uchun qo'ng'iroq qilish yoki fizik borish kerak bo'ladi.",
  },
  {
    icon: ClockIcon,
    title: "Navbatda soatlab kutish",
    description:
      "Necha kishi qolganini va qachon chaqirilishini bilmasdan, koridorda vaqt sarflanadi.",
  },
  {
    icon: ClipboardIcon,
    title: "Tibbiy tarix yo'qoladi",
    description:
      "Oldingi ko'rik, tahlil va tavsiyalar qog'ozda qoladi, keyingi shifokorga yetib bormaydi.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sog&apos;ligingiz haqidagi ma&apos;lumotlar hamma joyga sochilib yotibdi
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Suv ichish, uyqu, sport, dori vaqti — bittasi qog&apos;ozda, bittasi
            eslatmada, yana bittasi umuman hech qayerda yozilmaydi. Klinika va
            shifokor qidirish, navbatda soatlab kutish, tibbiy tarixni eslab
            qolish — bularning barchasi bir-biriga bog&apos;lanmagan holda amalga
            oshiriladi.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PAIN_POINTS.map((point) => (
            <Card
              key={point.title}
              className="transition-colors duration-200 hover:border-accent/30"
            >
              <CardContent className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted">
                  <point.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {point.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
