"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Loader2, Pill, Plus, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompleteAppointment } from "@/lib/hooks/use-doctor-panel";
import { getApiErrorMessage } from "@/lib/api";
import { MEAL_LABEL, type LabResult, type MealRelation, type PrescriptionInput } from "@/lib/types";

// Sensible default intake times for "N times a day" — the doctor can edit each.
const DEFAULT_TIMES: Record<number, string[]> = {
  1: ["09:00"],
  2: ["08:00", "20:00"],
  3: ["08:00", "14:00", "20:00"],
  4: ["08:00", "12:00", "16:00", "20:00"],
};

const emptyRx = (): PrescriptionInput => ({
  name: "",
  dosage: "",
  times: [...DEFAULT_TIMES[1]],
  mealRelation: "after",
  durationDays: 7,
  note: "",
});

const selectCls =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CompleteExaminationDialog({
  appointmentId,
  patientName,
}: {
  appointmentId: string;
  patientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [examination, setExamination] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [rx, setRx] = useState<PrescriptionInput[]>([]);
  const [goals, setGoals] = useState({ waterL: "", sleepH: "", workoutMin: "", note: "" });
  const complete = useCompleteAppointment();

  const updateLab = (i: number, patch: Partial<LabResult>) =>
    setLabResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const updateRx = (i: number, patch: Partial<PrescriptionInput>) =>
    setRx((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const reset = () => {
    setExamination("");
    setRecommendation("");
    setLabResults([]);
    setRx([]);
    setGoals({ waterL: "", sleepH: "", workoutMin: "", note: "" });
  };

  const submit = async () => {
    if (!examination.trim()) return;
    const prescriptions = rx
      .filter((r) => r.name.trim())
      .map((r) => ({ ...r, name: r.name.trim(), dosage: r.dosage.trim(), note: r.note.trim() }));
    const g = {
      ...(goals.waterL ? { waterMl: Math.round(Number(goals.waterL) * 1000) } : {}),
      ...(goals.sleepH ? { sleepHours: Number(goals.sleepH) } : {}),
      ...(goals.workoutMin ? { workoutMinutes: Math.round(Number(goals.workoutMin)) } : {}),
      ...(goals.note.trim() ? { note: goals.note.trim() } : {}),
    };
    try {
      await complete.mutateAsync({
        appointmentId,
        examination: examination.trim(),
        recommendation: recommendation.trim(),
        labResults: labResults.filter((r) => r.name.trim() && r.value.trim()),
        prescriptions,
        goals: Object.keys(g).length ? g : undefined,
      });
      toast.success("Ko'rik yakunlandi", {
        description: prescriptions.length
          ? `${prescriptions.length} ta dori bemor jadvaliga qo'shildi — eslatmalar avtomatik.`
          : "Tibbiy yozuv bemorga yuborildi.",
      });
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Ko'rikni yakunlab bo'lmadi."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <ClipboardCheck className="h-3.5 w-3.5" />
        Ko&apos;rikni yakunlash
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ko&apos;rikni yakunlash — {patientName}</DialogTitle>
          <DialogDescription>
            Tibbiy yozuv, dorilar va kunlik me&apos;yorlar bemorga darhol yetib boradi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="examination">Ko&apos;rik xulosasi / tashxis *</Label>
            <Textarea id="examination" placeholder="Ko'rik natijalari, tashxis, muhim topilmalar..." value={examination} onChange={(e) => setExamination(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recommendation">Tavsiya</Label>
            <Textarea id="recommendation" placeholder="Bemorga tavsiyalar (ixtiyoriy)" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={2} />
          </div>

          {/* ---------- Prescriptions ---------- */}
          <section className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Pill className="h-4 w-4 text-primary" /> Dorilar (retsept)
              </p>
              <Button variant="outline" size="sm" className="gap-1" type="button" onClick={() => setRx((p) => [...p, emptyRx()])}>
                <Plus className="h-3.5 w-3.5" /> Dori qo&apos;shish
              </Button>
            </div>
            {rx.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Yozilgan dorilar bemorning &quot;Dorilar&quot; bo&apos;limiga tushadi va har qabul vaqtida Telegram, ilova va Web&apos;ga eslatma keladi.
              </p>
            )}
            {rx.map((r, i) => (
              <div key={i} className="space-y-3 rounded-lg bg-muted/40 p-3">
                <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
                  <Input placeholder="Dori nomi (masalan: Amoksitsillin 500 mg)" value={r.name} onChange={(e) => updateRx(i, { name: e.target.value })} />
                  <Input placeholder="Doza (1 tabletka)" value={r.dosage} onChange={(e) => updateRx(i, { dosage: e.target.value })} />
                  <Button variant="ghost" size="icon" type="button" className="text-destructive" onClick={() => setRx((p) => p.filter((_, idx) => idx !== i))} aria-label="Dorini o'chirish">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Kuniga necha mahal</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <Button key={n} type="button" size="sm" variant={r.times.length === n ? "default" : "outline"} onClick={() => updateRx(i, { times: [...DEFAULT_TIMES[n]] })}>
                        {n} mahal
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.times.map((t, ti) => (
                      <input
                        key={ti}
                        type="time"
                        value={t}
                        aria-label={`${ti + 1}-qabul vaqti`}
                        onChange={(e) => updateRx(i, { times: r.times.map((x, xi) => (xi === ti ? e.target.value : x)) })}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Qachon ichiladi</Label>
                    <select className={selectCls} value={r.mealRelation} onChange={(e) => updateRx(i, { mealRelation: e.target.value as MealRelation })}>
                      {(Object.keys(MEAL_LABEL) as MealRelation[]).map((k) => (
                        <option key={k} value={k}>{MEAL_LABEL[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Davomiyligi (kun)</Label>
                    <Input type="number" min={1} max={365} value={r.durationDays} onChange={(e) => updateRx(i, { durationDays: Math.max(1, Math.min(365, Number(e.target.value) || 1)) })} />
                  </div>
                </div>
                <Input placeholder="Izoh (masalan: ko'p suv bilan iching)" value={r.note} onChange={(e) => updateRx(i, { note: e.target.value })} />
              </div>
            ))}
          </section>

          {/* ---------- Daily goals ---------- */}
          <section className="space-y-3 rounded-xl border border-border p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" /> Kunlik me&apos;yorlar (ixtiyoriy)
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Suv (litr)</Label>
                <Input type="number" step="0.1" min={0.5} max={6} placeholder="2" value={goals.waterL} onChange={(e) => setGoals((g) => ({ ...g, waterL: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Uyqu (soat)</Label>
                <Input type="number" step="0.5" min={4} max={14} placeholder="8" value={goals.sleepH} onChange={(e) => setGoals((g) => ({ ...g, sleepH: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Workout (daqiqa)</Label>
                <Input type="number" min={0} max={300} placeholder="30" value={goals.workoutMin} onChange={(e) => setGoals((g) => ({ ...g, workoutMin: e.target.value }))} />
              </div>
            </div>
            <Input placeholder="Izoh (masalan: kasallik davrida yengil mashq)" value={goals.note} onChange={(e) => setGoals((g) => ({ ...g, note: e.target.value }))} />
          </section>

          {/* ---------- Lab results ---------- */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Laboratoriya natijalari (ixtiyoriy)</Label>
              <Button variant="outline" size="sm" className="gap-1" type="button" onClick={() => setLabResults((p) => [...p, { name: "", value: "", unit: "", normalRange: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Qo&apos;shish
              </Button>
            </div>
            {labResults.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5">
                <Input placeholder="Nomi" value={row.name} onChange={(e) => updateLab(i, { name: e.target.value })} />
                <Input placeholder="Natija" value={row.value} onChange={(e) => updateLab(i, { value: e.target.value })} />
                <Input placeholder="Birlik" value={row.unit} onChange={(e) => updateLab(i, { unit: e.target.value })} />
                <Input placeholder="Norma" value={row.normalRange} onChange={(e) => updateLab(i, { normalRange: e.target.value })} />
                <Button variant="ghost" size="icon" type="button" className="text-destructive" onClick={() => setLabResults((p) => p.filter((_, idx) => idx !== i))} aria-label="Natijani o'chirish">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </section>
        </div>

        <Button disabled={complete.isPending || !examination.trim()} onClick={submit} className="gap-1.5">
          {complete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Yakunlash va bemorga yuborish
        </Button>
      </DialogContent>
    </Dialog>
  );
}
