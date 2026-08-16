import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE — Sog'ligingiz, bitta joyda",
  description:
    "PULSE — kundalik salomatlik, klinika, shifokor, raqamli navbat va tibbiy tarixni Web va Telegramda bitta hisob ostida birlashtiruvchi HealthTech ekotizimi.",
  keywords: [
    "PULSE",
    "HealthTech",
    "sog'liq",
    "tibbiyot",
    "raqamli navbat",
    "telegram bot",
    "klinika",
    "shifokor",
  ],
  openGraph: {
    title: "PULSE — YOUR HEALTH. ONE PULSE.",
    description:
      "Salomatligingiz, kundalik odatlaringiz va tibbiy xizmatlaringiz — bitta platformada.",
    type: "website",
    locale: "uz_UZ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05080f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
