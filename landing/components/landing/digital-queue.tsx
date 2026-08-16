import { UsersIcon, ClockIcon, CheckCircleIcon } from "@/components/icons";

const STATUSES = [
  { key: "WAITING", label: "Kutmoqda", active: true },
  { key: "NEAR", label: "Yaqinlashdi", active: false },
  { key: "CALLED", label: "Chaqirildi", active: false },
];

export function DigitalQueue() {
  return (
    <section id="queue" className="border-t border-card-border">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Raqamli navbat — endi koridorda kutish shart emas
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Navbat holatingiz real vaqtda yangilanadi:{" "}
              <span className="text-foreground">WAITING → NEAR → CALLED</span>.
              Oldingizda nechta odam qolgani va taxminiy kutish vaqtini
              istalgan joydan kuzatib boring.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-accent">
              <CheckCircleIcon className="h-4 w-4 shrink-0" />
              Navbat backend tomonidan boshqariladi — hech qanday soxta
              countdown yo&apos;q.
            </p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sizning navbatingiz</p>
                <p className="text-2xl font-bold text-foreground">A-24</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <UsersIcon className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-card-border bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">Hozir chaqirilgan</p>
                <p className="text-sm font-semibold text-foreground">A-21</p>
              </div>
              <div className="rounded-xl border border-card-border bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">Oldingizda</p>
                <p className="text-sm font-semibold text-foreground">3 kishi</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-card-border bg-white/[0.02] p-3 text-sm text-muted">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              Taxminiy kutish: <span className="font-medium text-foreground">25 daqiqa</span>
            </div>

            <div className="mt-6 flex items-center">
              {STATUSES.map((status, index) => (
                <div key={status.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        status.active ? "bg-accent" : "bg-white/15"
                      }`}
                    />
                    <span
                      className={`text-[11px] ${
                        status.active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {status.label}
                    </span>
                  </div>
                  {index < STATUSES.length - 1 && (
                    <span className="mx-2 h-px flex-1 bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
