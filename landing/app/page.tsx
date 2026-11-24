import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { DailyHealth } from "@/components/landing/daily-health";
import { Medical } from "@/components/landing/medical";
import { DigitalQueue } from "@/components/landing/digital-queue";
import { Telegram } from "@/components/landing/telegram";
import { PulseAI } from "@/components/landing/pulse-ai";
import { Statistics } from "@/components/landing/statistics";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <DailyHealth />
        <Medical />
        <DigitalQueue />
        <Telegram />
        <PulseAI />
        <Statistics />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
