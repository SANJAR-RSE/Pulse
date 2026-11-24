"use client";

import { useState } from "react";
import { Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddSleep } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";

export function AddSleepDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const addSleep = useAddSleep();

  const submit = async () => {
    try {
      await addSleep.mutateAsync({ sleepTime, wakeTime });
      toast.success("Uyqu qayd etildi.");
      setOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Uyquni qayd etib bo'lmadi."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        {trigger ?? (
          <>
            <Moon className="h-3.5 w-3.5" />
            Uyquni qayd etish
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uyquni qayd etish</DialogTitle>
          <DialogDescription>
            Uxlagan va uyg&apos;ongan vaqtingizni kiriting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sleepTime">Uxlagan vaqt</Label>
            <input
              id="sleepTime"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wakeTime">Uyg&apos;ongan vaqt</Label>
            <input
              id="wakeTime"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <Button disabled={addSleep.isPending} onClick={submit} className="gap-1.5">
          {addSleep.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Uyquni saqlash
        </Button>
      </DialogContent>
    </Dialog>
  );
}
