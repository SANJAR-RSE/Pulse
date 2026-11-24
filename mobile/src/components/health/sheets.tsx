import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Sheet, TimeField } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useAddMedication, useAddSleep, useAddWater, useAddWorkout } from '@/lib/queries';
import { colors, radius, space } from '@/theme';

type SheetProps = { visible: boolean; onClose: () => void };

// ---------- Water ----------
const WATER_PRESETS = [200, 300, 500, 750];
export function AddWaterSheet({ visible, onClose }: SheetProps) {
  const add = useAddWater();
  const toast = useToast();
  const [custom, setCustom] = useState('');
  const submit = async (ml: number) => {
    if (!Number.isInteger(ml) || ml <= 0) return toast({ type: 'error', title: 'Miqdorni butun son (ml) bilan kiriting.' });
    try {
      await add.mutateAsync(ml);
      toast({ type: 'success', title: `${ml} ml suv qo'shildi` });
      setCustom('');
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Suv qo'shib bo'lmadi.") });
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Suv qo'shish" subtitle="Bugun ichgan suv miqdorini belgilang.">
      <View style={styles.presets}>
        {WATER_PRESETS.map((ml) => (
          <Pressable key={ml} disabled={add.isPending} onPress={() => submit(ml)} style={({ pressed }) => [styles.preset, pressed && { backgroundColor: colors.primarySoft }]}>
            <Text style={styles.presetValue}>{ml}</Text>
            <Text style={styles.presetUnit}>ml</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Input label="Boshqa miqdor (ml)" keyboardType="number-pad" value={custom} onChangeText={setCustom} placeholder="Masalan: 250" maxLength={4} />
        </View>
        <Button title="Qo'shish" onPress={() => submit(Number(custom))} disabled={!custom} loading={add.isPending} />
      </View>
    </Sheet>
  );
}

// ---------- Sleep ----------
export function AddSleepSheet({ visible, onClose }: SheetProps) {
  const add = useAddSleep();
  const toast = useToast();
  const [sleepTime, setSleep] = useState('23:00');
  const [wakeTime, setWake] = useState('07:00');
  const submit = async () => {
    try {
      await add.mutateAsync({ sleepTime, wakeTime });
      toast({ type: 'success', title: 'Uyqu qayd etildi' });
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Uyquni qayd etib bo'lmadi.") });
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Uyquni qayd etish" subtitle="Uxlagan va uyg'ongan vaqtingizni belgilang.">
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <TimeField label="Uxlagan vaqt" value={sleepTime} onChange={setSleep} />
        <TimeField label="Uyg'ongan vaqt" value={wakeTime} onChange={setWake} />
      </View>
      <Button title="Uyquni saqlash" icon="moon" onPress={submit} loading={add.isPending} />
    </Sheet>
  );
}

// ---------- Workout ----------
const WORKOUT_TYPES = ['Yugurish', 'Yurish', 'Zal', 'Yoga', 'Velosiped', 'Suzish'];
export function AddWorkoutSheet({ visible, onClose }: SheetProps) {
  const add = useAddWorkout();
  const toast = useToast();
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('');
  const submit = async () => {
    const mins = Number(duration);
    if (type.trim().length < 2) return toast({ type: 'error', title: 'Mashg\'ulot turini kiriting.' });
    if (!Number.isInteger(mins) || mins <= 0) return toast({ type: 'error', title: 'Davomiylikni daqiqada kiriting.' });
    try {
      await add.mutateAsync({ type: type.trim(), durationMinutes: mins, calories: calories ? Number(calories) : undefined });
      toast({ type: 'success', title: "Workout qo'shildi" });
      setType('');
      setDuration('30');
      setCalories('');
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Workout qo'shib bo'lmadi.") });
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Workout qo'shish" subtitle="Bugungi mashg'ulotingizni qayd eting.">
      <View style={styles.wrapRow}>
        {WORKOUT_TYPES.map((t) => (
          <Pressable key={t} onPress={() => setType(t)} style={[styles.tag, type === t && styles.tagActive]}>
            <Text style={[styles.tagText, type === t && { color: colors.white }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Turi" value={type} onChangeText={setType} placeholder="Masalan: Yugurish" />
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Input label="Davomiylik (daqiqa)" keyboardType="number-pad" value={duration} onChangeText={setDuration} maxLength={3} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Kaloriya (ixtiyoriy)" keyboardType="number-pad" value={calories} onChangeText={setCalories} placeholder="—" maxLength={4} />
        </View>
      </View>
      <Button title="Workout saqlash" icon="barbell" onPress={submit} loading={add.isPending} />
    </Sheet>
  );
}

// ---------- Medication ----------
export function AddMedicationSheet({ visible, onClose }: SheetProps) {
  const add = useAddMedication();
  const toast = useToast();
  const [name, setName] = useState('');
  const [time, setTime] = useState('09:00');
  const submit = async () => {
    if (name.trim().length < 2) return toast({ type: 'error', title: 'Dori nomini kiriting.' });
    try {
      await add.mutateAsync({ name: name.trim(), time });
      toast({ type: 'success', title: 'Dori belgilandi', message: `${name.trim()} — har kuni ${time}` });
      setName('');
      setTime('09:00');
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Dorini belgilab bo'lmadi.") });
    }
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Dorini belgilash" subtitle="PULSE dori tavsiya qilmaydi — faqat sizning jadvalingizni eslab qoladi.">
      <Input label="Dori nomi" value={name} onChangeText={setName} placeholder="Masalan: Vitamin D" />
      <TimeField label="Qabul vaqti (har kuni)" value={time} onChange={setTime} />
      <Button title="Dorini saqlash" icon="medkit" onPress={submit} loading={add.isPending} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: 'row', gap: space.sm },
  preset: { flex: 1, alignItems: 'center', paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  presetValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  presetUnit: { fontSize: 11, color: colors.muted },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
});
