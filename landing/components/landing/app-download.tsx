import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  AndroidIcon,
  BellIcon,
  CheckCircleIcon,
  DownloadIcon,
  PillIcon,
  SmartphoneIcon,
  StethoscopeIcon,
} from "@/components/icons";
import { APK_URL } from "@/lib/site-config";

const FEATURES = [
  { icon: BellIcon, text: "Navbatingiz chaqirilganda — darhol bildirishnoma va tebranish" },
  { icon: PillIcon, text: "Dori eslatmalari ilova yopiq bo'lsa ham keladi" },
  { icon: StethoscopeIcon, text: "Shifokor uchun navbat paneli — bemorni bir bosishda chaqirish" },
  { icon: SmartphoneIcon, text: "Web bilan bitta hisob — har bir o'zgarish real vaqtda" },
];

const STEPS = [
  "Tugmani bosib PULSE.apk faylini yuklab oling (~99 MB).",
  "Faylni oching — Android \"noma'lum manbalardan o'rnatish\"ga ruxsat so'rasa, ruxsat bering.",
  "Ilovani oching va \"Bemor sifatida\" yoki \"Shifokor sifatida\" demo tugmasi bilan kiring.",
];

export function AppDownload() {
  return (
    <section id="download" className="border-t border-card-border pulse-glow">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3DDC84]/30 bg-[#3DDC84]/10 px-3 py-1 text-xs font-medium text-[#3DDC84]">
              <AndroidIcon className="h-3.5 w-3.5" />
              Android ilova
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              PULSE — endi cho&apos;ntagingizda
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Bemor va shifokor uchun to&apos;liq mobil ilova: navbat, sog&apos;liq
              kuzatuvi, PULSE AI va tibbiy tarix — Web bilan bir xil hisob va bir
              xil ma&apos;lumotlar.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <f.icon className="h-4 w-4" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <a href={APK_URL} className={buttonVariants({ size: "lg", className: "mt-8 w-full sm:w-auto" })}>
              <DownloadIcon className="h-5 w-5" />
              APK yuklab olish
            </a>
            <p className="mt-3 text-xs text-muted-foreground">Android telefonlar uchun · bepul</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Phone mockup with the real app icon */}
            <div className="mx-auto flex w-56 flex-col items-center gap-4 rounded-[2.5rem] border border-card-border bg-card px-6 pb-10 pt-12 shadow-2xl shadow-black/40">
              <Image src="/logo.png" alt="PULSE ilova ikonkasi" width={96} height={96} className="h-24 w-24" />
              <p className="text-xl font-extrabold tracking-[0.2em] text-foreground">PULSE</p>
              <p className="text-xs text-muted-foreground">Your health. One pulse.</p>
              <div className="mt-2 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-90">Bildirishnoma</p>
                <p className="text-sm font-semibold">Navbatingiz keldi — L-24</p>
              </div>
              <div className="w-full rounded-2xl border border-card-border bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Eslatma</p>
                <p className="text-sm font-semibold text-foreground">💊 Vitamin D ichish vaqti</p>
              </div>
            </div>

            <ol className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm text-muted">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
              <li className="flex items-center gap-2 pt-1 text-xs text-accent">
                <CheckCircleIcon className="h-4 w-4" />
                Real backend bilan ishlaydi — Web&apos;dagi hisobingiz bilan kiring.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
