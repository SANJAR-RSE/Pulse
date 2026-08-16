import Link from "next/link";
import { PulseIcon } from "@/components/icons";
import { WEB_URL, TELEGRAM_URL, SITE } from "@/lib/site-config";

const COLUMNS = [
  {
    title: "Platforma",
    links: [
      { label: "Web ilova", href: WEB_URL, external: true },
      { label: "Telegram bot", href: TELEGRAM_URL, external: true },
    ],
  },
  {
    title: "Imkoniyatlar",
    links: [
      { label: "Kundalik salomatlik", href: "#daily-health" },
      { label: "Tibbiyot", href: "#medical" },
      { label: "Raqamli navbat", href: "#queue" },
      { label: "PULSE AI", href: "#ai" },
    ],
  },
  {
    title: "Ekotizim",
    links: [
      { label: "Qanday ishlaydi", href: "#how-it-works" },
      { label: "Statistika", href: "#statistics" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                <PulseIcon className="h-4.5 w-4.5" />
              </span>
              <span className="text-base text-foreground">{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{SITE.tagline}</p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium text-foreground">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-card-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} PULSE. Barcha huquqlar himoyalangan.</p>
          <p>Hackathon uchun yaratilgan HealthTech demo loyihasi.</p>
        </div>
      </div>
    </footer>
  );
}
