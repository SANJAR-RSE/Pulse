import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";
import { WEB_URL, TELEGRAM_URL } from "@/lib/site-config";

export function FinalCta() {
  return (
    <section className="border-t border-card-border pulse-glow">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-8 md:py-28">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          PULSE&apos;ni hoziroq boshlang
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          Sog&apos;ligingiz bilan bog&apos;liq barcha narsani boshqa-boshqa
          ilovalardan qidirishga hojat yo&apos;q. Hammasi bitta joyda —
          PULSE&apos;da.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              PULSE&apos;ni hoziroq boshlang
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            Telegram botni sinab ko&apos;ring
          </a>
        </div>
      </div>
    </section>
  );
}
