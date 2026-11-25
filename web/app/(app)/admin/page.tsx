"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Layers,
  Minus,
  Pill,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAdminAppointments, useAdminOverview, useAdminUsers } from "@/lib/hooks/use-admin";
import { useAuthStore } from "@/lib/auth-store";
import type { AdminAppointment, AdminOverview, Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeletonGrid, ListSkeleton } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const shortDate = (d: string) => `${Number(d.slice(8, 10))}-${MONTHS[Number(d.slice(5, 7)) - 1]}`;
const fmt = (n: number) => n.toLocaleString("ru-RU");

const ROLE_LABEL: Record<Role, string> = { patient: "Bemor", doctor: "Shifokor", admin: "Admin" };
const STATUS_LABEL: Record<AdminAppointment["status"], string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

export default function AdminPage() {
  const role = useAuthStore((s) => s.user?.role);
  const overview = useAdminOverview();

  if (role && role !== "admin") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Ruxsat yo'q"
        description="Bu sahifa faqat administrator uchun."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="text-sm text-muted-foreground">
            Platforma statistikasi{overview.data ? ` · ${shortDate(overview.data.today)}` : ""} — har 30 soniyada o&apos;zi yangilanadi.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => overview.refetch()} disabled={overview.isFetching}>
          <RefreshCw className={cn("h-4 w-4", overview.isFetching && "animate-spin")} />
          Yangilash
        </Button>
      </div>

      {overview.isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : overview.isError || !overview.data ? (
        <ErrorState message="Statistikani yuklab bo'lmadi." onRetry={() => overview.refetch()} />
      ) : (
        <OverviewSections data={overview.data} />
      )}

      <UsersTable />
      <RecentAppointments />
    </div>
  );
}

function OverviewSections({ data }: { data: AdminOverview }) {
  const { users, appointments, queueToday, clinical, catalog, health } = data;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} title="Foydalanuvchilar" value={users.total} hint={`${fmt(users.patients)} bemor · ${fmt(users.doctors)} shifokor`} />
        <KpiCard icon={UserPlus} title="Yangi (7 kun)" value={users.newThisWeek} now={users.newThisWeek} prev={users.newLastWeek} />
        <KpiCard icon={CalendarCheck} title="Navbatlar (7 kun)" value={appointments.thisWeek} now={appointments.thisWeek} prev={appointments.lastWeek} />
        <KpiCard
          icon={Activity}
          title="Faol bemorlar (7 kun)"
          value={users.activeThisWeek}
          hint={`${fmt(health.waterLogs + health.sleepLogs + health.workouts)} ta suv/uyqu/workout yozuvi`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Navbatlar — oxirgi 14 kun" unit="navbat" data={data.series.map((s) => ({ date: s.date, value: s.appointments }))} />
        <ChartCard title="Yangi foydalanuvchilar — oxirgi 14 kun" unit="foydalanuvchi" data={data.series.map((s) => ({ date: s.date, value: s.users }))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Navbatlar holati</CardTitle>
            <p className="text-xs text-muted-foreground">Jami {fmt(appointments.total)} · kelgusi {fmt(appointments.upcoming)}</p>
          </CardHeader>
          <CardContent>
            <BarList
              items={(Object.keys(STATUS_LABEL) as AdminAppointment["status"][]).map((k) => ({
                key: k,
                label: STATUS_LABEL[k],
                value: appointments.byStatus[k],
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bugungi navbat</CardTitle>
            <p className="text-xs text-muted-foreground">Bugun {fmt(appointments.today)} ta qabul rejalashtirilgan</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Kutmoqda" value={queueToday.waiting} />
            <MiniStat label="Qabulda" value={queueToday.called} />
            <MiniStat label="Yakunlangan" value={queueToday.completed} />
            <MiniStat label="Bekor qilingan" value={queueToday.cancelled} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Platforma</CardTitle>
            <p className="text-xs text-muted-foreground">Katalog va tibbiy faollik</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <InfoRow icon={Stethoscope} label="Shifokorlar" value={catalog.doctors} />
            <InfoRow icon={Building2} label="Klinikalar" value={catalog.clinics} />
            <InfoRow icon={Layers} label="Bo'limlar" value={catalog.departments} />
            <InfoRow icon={FileText} label="Tibbiy xulosalar" value={clinical.records} />
            <InfoRow icon={Pill} label="Shifokor retseptlari" value={clinical.prescriptions} />
            <InfoRow icon={Bot} label="AI ga savollar" value={clinical.aiQuestions} />
            <InfoRow icon={Send} label="Telegram ulangan" value={users.telegramLinked} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Eng ko&apos;p qabul qilgan shifokorlar</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topDoctors.length ? (
              <BarList items={data.topDoctors.map((d) => ({ key: d._id, label: `Dr. ${d.name}`, sub: d.specialty, value: d.count }))} />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Hali navbatlar yo&apos;q.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Eng talabgir bo&apos;limlar</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topDepartments.length ? (
              <BarList items={data.topDepartments.map((d) => ({ key: d._id, label: d.name, value: d.count }))} />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Hali navbatlar yo&apos;q.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, title, value, hint, now, prev }: { icon: LucideIcon; title: string; value: number; hint?: string; now?: number; prev?: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-3xl font-semibold tabular-nums">{fmt(value)}</p>
        {now !== undefined && prev !== undefined ? <WeekDelta now={now} prev={prev} /> : <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function WeekDelta({ now, prev }: { now: number; prev: number }) {
  const diff = now - prev;
  if (diff === 0)
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" /> O&apos;tgan hafta bilan bir xil ({fmt(prev)})
      </p>
    );
  const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={cn("flex items-center gap-1 text-xs font-medium", diff > 0 ? "text-emerald-600" : "text-red-600")}>
      <Icon className="h-3.5 w-3.5" />
      {diff > 0 ? "+" : ""}
      {fmt(diff)} <span className="font-normal text-muted-foreground">(o&apos;tgan hafta: {fmt(prev)})</span>
    </p>
  );
}

// Single-series daily column chart: thin columns with a 2px gap, rounded data
// ends on the baseline, a full-height hover target and a per-column tooltip.
function ChartCard({ title, unit, data }: { title: string; unit: string; data: { date: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Jami {fmt(total)} {unit} · eng ko&apos;p kunida {fmt(max === 1 && total === 0 ? 0 : max)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* dashed line = the busiest day (value given in the subtitle) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <div className="flex h-40 items-end gap-[2px] border-b border-border" role="list" aria-label={title}>
            {data.map((d, i) => (
              <div key={d.date} role="listitem" aria-label={`${shortDate(d.date)}: ${d.value} ${unit}`} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-primary transition-opacity duration-150 group-hover:opacity-75"
                  style={{ height: d.value ? `${Math.max((d.value / max) * 100, 3)}%` : 0 }}
                />
                <div
                  data-tooltip
                  className={cn(
                    "pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm group-hover:block",
                    // keep edge tooltips inside the card
                    i < 2 ? "left-0" : i >= data.length - 2 ? "right-0" : "left-1/2 -translate-x-1/2"
                  )}
                >
                  <span className="text-muted-foreground">{shortDate(d.date)}:</span> <span className="font-semibold tabular-nums">{fmt(d.value)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>{shortDate(data[0].date)}</span>
            <span>{shortDate(data[Math.floor(data.length / 2)].date)}</span>
            <span>Bugun</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Horizontal magnitude bars (one hue), value printed in text ink beside each.
function BarList({ items }: { items: { key: string; label: string; sub?: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">
              {i.label}
              {i.sub && <span className="ml-1.5 text-xs text-muted-foreground">{i.sub}</span>}
            </span>
            <span className="font-semibold tabular-nums">{fmt(i.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-2xl font-semibold tabular-nums">{fmt(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{fmt(value)}</span>
    </div>
  );
}

const ROLE_FILTERS: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "patient", label: "Bemorlar" },
  { value: "doctor", label: "Shifokorlar" },
  { value: "admin", label: "Adminlar" },
];

function UsersTable() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [page, setPage] = useState(1);

  // Debounce typing so every keystroke isn't a request.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const q = useAdminUsers({ search, role, page });

  return (
    <Card>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Foydalanuvchilar
          </CardTitle>
          {q.data && <span className="text-xs text-muted-foreground">Topildi: {fmt(q.data.total)}</span>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ism yoki email bo'yicha qidirish" className="pl-8" aria-label="Foydalanuvchi qidirish" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {ROLE_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={role === f.value ? "default" : "outline"}
                onClick={() => {
                  setRole(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {q.isLoading ? (
          <ListSkeleton count={4} />
        ) : q.isError || !q.data ? (
          <ErrorState message="Foydalanuvchilarni yuklab bo'lmadi." onRetry={() => q.refetch()} />
        ) : q.data.users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Hech kim topilmadi.</p>
        ) : (
          <>
            <div className={cn("overflow-x-auto transition-opacity", q.isFetching && "opacity-60")}>
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Foydalanuvchi</th>
                    <th className="pb-2 font-medium">Rol</th>
                    <th className="pb-2 text-right font-medium">Navbatlar</th>
                    <th className="pb-2 text-center font-medium">Telegram</th>
                    <th className="pb-2 text-right font-medium">Ro&apos;yxatdan o&apos;tgan</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.users.map((u) => (
                    <tr key={u._id} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="py-2.5">
                        <Badge variant={u.role === "patient" ? "secondary" : u.role === "doctor" ? "outline" : "default"}>{ROLE_LABEL[u.role]}</Badge>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{fmt(u.appointments)}</td>
                      <td className="py-2.5 text-center text-xs">{u.telegramLinked ? "✅ Ulangan" : <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground tabular-nums">{u.createdAt.slice(0, 10).split("-").reverse().join(".")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {q.data.pages > 1 && (
              <div className="mt-3 flex items-center justify-end gap-2 text-sm">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Oldingi sahifa">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground tabular-nums">
                  {page} / {q.data.pages}
                </span>
                <Button size="sm" variant="outline" disabled={page >= q.data.pages} onClick={() => setPage((p) => p + 1)} aria-label="Keyingi sahifa">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecentAppointments() {
  const q = useAdminAppointments();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4 text-primary" /> So&apos;nggi navbatlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {q.isLoading ? (
          <ListSkeleton count={3} />
        ) : q.isError || !q.data ? (
          <ErrorState message="Navbatlarni yuklab bo'lmadi." onRetry={() => q.refetch()} />
        ) : q.data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Hali hech kim navbat olmagan.</p>
        ) : (
          <ul className="divide-y divide-border">
            {q.data.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {a.patient?.name ?? "—"}
                    <span className="font-normal text-muted-foreground"> → Dr. {a.doctor ? `${a.doctor.firstName} ${a.doctor.lastName}` : "—"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shortDate(a.date)} · {a.time} · {a.department?.name} · {a.clinic?.name}
                  </p>
                </div>
                <Badge variant={a.status === "cancelled" ? "destructive" : a.status === "completed" ? "secondary" : "outline"}>{STATUS_LABEL[a.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
