"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Loader2, Plus, Trash2 } from "lucide-react";
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
import type { LabResult } from "@/lib/types";

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
  const complete = useCompleteAppointment();

  const addLabRow = () =>
    setLabResults((prev) => [...prev, { name: "", value: "", unit: "", normalRange: "" }]);

  const updateLabRow = (i: number, patch: Partial<LabResult>) =>
    setLabResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeLabRow = (i: number) =>
    setLabResults((prev) => prev.filter((_, idx) => idx !== i));

  const reset = () => {
    setExamination("");
    setRecommendation("");
    setLabResults([]);
  };

  const submit = async () => {
    if (!examination.trim()) return;
    try {
      await complete.mutateAsync({
        appointmentId,
        examination: examination.trim(),
        recommendation: recommendation.trim(),
        labResults: labResults.filter((r) => r.name.trim() && r.value.trim()),
      });
      toast.success("Ko'rik yakunlandi. Medical Record yaratildi.");
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ko&apos;rikni yakunlash — {patientName}</DialogTitle>
          <DialogDescription>
            Tibbiy yozuv yaratiladi va bemorga Medical History bo&apos;limida ko&apos;rinadi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="examination">Ko&apos;rik xulosasi *</Label>
            <Textarea
              id="examination"
              placeholder="Ko'rik natijalari, tashxis, muhim topilmalar..."
              value={examination}
              onChange={(e) => setExamination(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recommendation">Tavsiya</Label>
            <Textarea
              id="recommendation"
              placeholder="Bemorga tavsiyalar (ixtiyoriy)"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Laboratoriya natijalari (ixtiyoriy)</Label>
              <Button variant="outline" size="sm" className="gap-1" onClick={addLabRow} type="button">
                <Plus className="h-3.5 w-3.5" />
                Qo&apos;shish
              </Button>
            </div>

            {labResults.map((row, i) => (
              <div key={i} className="overflow-x-auto">
                <div className="grid min-w-[420px] grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5">
                  <Input
                    placeholder="Nomi"
                    value={row.name}
                    onChange={(e) => updateLabRow(i, { name: e.target.value })}
                  />
                  <Input
                    placeholder="Natija"
                    value={row.value}
                    onChange={(e) => updateLabRow(i, { value: e.target.value })}
                  />
                  <Input
                    placeholder="Birlik"
                    value={row.unit}
                    onChange={(e) => updateLabRow(i, { unit: e.target.value })}
                  />
                  <Input
                    placeholder="Norma"
                    value={row.normalRange}
                    onChange={(e) => updateLabRow(i, { normalRange: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeLabRow(i)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          disabled={complete.isPending || !examination.trim()}
          onClick={submit}
          className="gap-1.5"
        >
          {complete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Yakunlash va saqlash
        </Button>
      </DialogContent>
    </Dialog>
  );
}
