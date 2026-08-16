"use client";

import { useState } from "react";
import { Droplet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddWater } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";

const PRESETS = [200, 300, 500, 750];

export function AddWaterDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const addWater = useAddWater();

  const submit = async (amountMl: number) => {
    if (!amountMl || amountMl <= 0) return;
    try {
      await addWater.mutateAsync(amountMl);
      toast.success(`${amountMl} ml suv qo'shildi.`);
      setOpen(false);
      setCustom("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Suv qo'shib bo'lmadi."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        {trigger ?? (
          <>
            <Droplet className="h-3.5 w-3.5" />
            Suv qo&apos;shish
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suv qo&apos;shish</DialogTitle>
          <DialogDescription>
            Bugun ichgan suv miqdorini belgilang.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((ml) => (
            <Button
              key={ml}
              variant="outline"
              disabled={addWater.isPending}
              onClick={() => submit(ml)}
              className="flex-col gap-0.5 h-auto py-3"
            >
              <span className="text-sm font-semibold">{ml}</span>
              <span className="text-[10px] text-muted-foreground">ml</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={5000}
            placeholder="Boshqa miqdor (ml)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            disabled={addWater.isPending || !custom}
            onClick={() => submit(Number(custom))}
            className="gap-1.5"
          >
            {addWater.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Qo&apos;shish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
