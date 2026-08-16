"use client";

import { useState } from "react";
import { Pill, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddMedication } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";

export function AddMedicationDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [time, setTime] = useState("09:00");
  const addMedication = useAddMedication();

  const submit = async () => {
    if (!name.trim()) return;
    try {
      await addMedication.mutateAsync({ name: name.trim(), time });
      toast.success("Dori belgilandi.");
      setOpen(false);
      setName("");
      setTime("09:00");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Dorini belgilab bo'lmadi."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        {trigger ?? (
          <>
            <Pill className="h-3.5 w-3.5" />
            Dorini belgilash
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dorini belgilash</DialogTitle>
          <DialogDescription>
            Dori nomi va qabul qilish vaqtini kiriting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="medName">Dori nomi</Label>
            <Input
              id="medName"
              placeholder="Masalan: Vitamin D"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="medTime">Vaqti</Label>
            <input
              id="medTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <Button
          disabled={addMedication.isPending || !name.trim()}
          onClick={submit}
          className="gap-1.5"
        >
          {addMedication.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Dorini saqlash
        </Button>
      </DialogContent>
    </Dialog>
  );
}
