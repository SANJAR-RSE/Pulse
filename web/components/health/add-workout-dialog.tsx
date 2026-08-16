"use client";

import { useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";
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
import { useAddWorkout } from "@/lib/hooks/use-health";
import { getApiErrorMessage } from "@/lib/api";

export function AddWorkoutDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("30");
  const [calories, setCalories] = useState("");
  const addWorkout = useAddWorkout();

  const submit = async () => {
    if (!type.trim() || !duration) return;
    try {
      await addWorkout.mutateAsync({
        type: type.trim(),
        durationMinutes: Number(duration),
        calories: calories ? Number(calories) : undefined,
      });
      toast.success("Workout qo'shildi.");
      setOpen(false);
      setType("");
      setDuration("30");
      setCalories("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Workout qo'shib bo'lmadi."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        {trigger ?? (
          <>
            <Dumbbell className="h-3.5 w-3.5" />
            Workout qo&apos;shish
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workout qo&apos;shish</DialogTitle>
          <DialogDescription>Bugungi mashg&apos;ulotingizni qayd eting.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="workoutType">Turi</Label>
            <Input
              id="workoutType"
              placeholder="Masalan: Yugurish, Zal, Yoga"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Davomiyligi (daqiqa)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={600}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calories">Kaloriya (ixtiyoriy)</Label>
              <Input
                id="calories"
                type="number"
                min={0}
                placeholder="—"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          disabled={addWorkout.isPending || !type.trim() || !duration}
          onClick={submit}
          className="gap-1.5"
        >
          {addWorkout.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Workout saqlash
        </Button>
      </DialogContent>
    </Dialog>
  );
}
