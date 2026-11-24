import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Sheet, TimeField } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useCompleteAppointment } from '@/lib/queries';
import { MEAL_LABEL, type LabResult, type MealRelation, type PrescriptionInput } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

const DEFAULT_TIMES: Record<number, string[]> = {
  1: ['09:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};
const MEALS: MealRelation[] = ['after', 'before', 'with', 'any'];
const emptyRx = (): PrescriptionInput => ({ name: '', dosage: '', times: ['09:00'], mealRelation: 'after', durationDays: 7, note: '' });

// Doctor finishes the visit: examination + prescriptions + daily goals + lab
// results. Prescriptions land on the patient's medication schedule (with
// reminders), goals on their dashboard — instantly, over the socket.
export function CompleteExamSheet({
  visible,
  onClose,
  appointmentId,
  patientName,
}: {
  visible: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
}) {
  const complete = useCompleteAppointment();
  const toast = useToast();
  const [examination, setExamination] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [rx, setRx] = useState<PrescriptionInput[]>([]);
  const [goals, setGoals] = useState({ waterL: '', sleepH: '', workoutMin: '', note: '' });
  const [labs, setLabs] = useState<LabResult[]>([]);

  const updateRx = (i: number, patch: Partial<PrescriptionInput>) => setRx((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const updateLab = (i: number, patch: Partial<LabResult>) => setLabs((p) => p.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const submit = async () => {
    if (!examination.trim()) return toast({ type: 'error', title: "Ko'rik xulosasini kiriting." });
    const prescriptions = rx.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim(), dosage: r.dosage.trim(), note: r.note.trim() }));
    const num = (v: string) => Number(v.replace(',', '.'));
    const g = {
      ...(goals.waterL ? { waterMl: Math.round(num(goals.waterL) * 1000) } : {}),
      ...(goals.sleepH ? { sleepHours: num(goals.sleepH) } : {}),
      ...(goals.workoutMin ? { workoutMinutes: Math.round(num(goals.workoutMin)) } : {}),
      ...(goals.note.trim() ? { note: goals.note.trim() } : {}),
    };
    try {
      await complete.mutateAsync({
        appointmentId,
        examination: examination.trim(),
        recommendation: recommendation.trim(),
        labResults: labs.filter((l) => l.name.trim() && l.value.trim()),
        prescriptions,
        goals: Object.keys(g).length ? g : undefined,
      });
      toast({
        type: 'success',
        title: "Ko'rik yakunlandi",
        message: prescriptions.length ? `${prescriptions.length} ta dori bemor jadvaliga qo'shildi.` : 'Tibbiy yozuv bemorga yuborildi.',
      });
      setExamination('');
      setRecommendation('');
      setRx([]);
      setGoals({ waterL: '', sleepH: '', workoutMin: '', note: '' });
      setLabs([]);
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Ko'rikni yakunlab bo'lmadi.") });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Ko'rikni yakunlash" subtitle={patientName}>
      <Input label="Ko'rik xulosasi / tashxis *" multiline value={examination} onChangeText={setExamination} placeholder="Ko'rik natijalari, tashxis..." />
      <Input label="Tavsiya" multiline value={recommendation} onChangeText={setRecommendation} placeholder="Bemorga tavsiyalar (ixtiyoriy)" />

      {/* ---------- Prescriptions ---------- */}
      <View style={{ gap: space.sm }}>
        <View style={styles.head}>
          <Text style={styles.label}>💊 Dorilar (retsept)</Text>
          <Pressable onPress={() => setRx((p) => [...p, emptyRx()])} hitSlop={8} style={styles.add}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addText}>Dori qo'shish</Text>
          </Pressable>
        </View>
        {rx.length === 0 && <Text style={font.small}>Yozilgan dorilar bemor jadvaliga tushadi, har qabul vaqtida eslatma keladi.</Text>}
        {rx.map((r, i) => (
          <View key={i} style={styles.box}>
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Input placeholder="Dori nomi (Amoksitsillin 500 mg)" value={r.name} onChangeText={(v) => updateRx(i, { name: v })} />
              </View>
              <Pressable onPress={() => setRx((p) => p.filter((_, idx) => idx !== i))} hitSlop={8} accessibilityLabel="Dorini o'chirish">
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
            <Input placeholder="Doza (1 tabletka)" value={r.dosage} onChangeText={(v) => updateRx(i, { dosage: v })} />

            <Text style={styles.small}>Kuniga necha mahal</Text>
            <View style={styles.chips}>
              {[1, 2, 3, 4].map((n) => (
                <Chip key={n} label={`${n} mahal`} active={r.times.length === n} onPress={() => updateRx(i, { times: [...DEFAULT_TIMES[n]] })} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {r.times.map((t, ti) => (
                <View key={ti} style={{ width: '47%' }}>
                  <TimeField label={`${ti + 1}-qabul`} value={t} onChange={(v) => updateRx(i, { times: r.times.map((x, xi) => (xi === ti ? v : x)) })} />
                </View>
              ))}
            </View>

            <Text style={styles.small}>Qachon ichiladi</Text>
            <View style={styles.chips}>
              {MEALS.map((m) => (
                <Chip key={m} label={MEAL_LABEL[m].split(' (')[0]} active={r.mealRelation === m} onPress={() => updateRx(i, { mealRelation: m })} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Necha kun"
                  keyboardType="number-pad"
                  value={String(r.durationDays)}
                  onChangeText={(v) => updateRx(i, { durationDays: Math.max(1, Math.min(365, Number(v.replace(/\D/g, '')) || 1)) })}
                  maxLength={3}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Input label="Izoh" value={r.note} onChangeText={(v) => updateRx(i, { note: v })} placeholder="Ko'p suv bilan iching" />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ---------- Daily goals ---------- */}
      <View style={[styles.box, { gap: space.sm }]}>
        <Text style={styles.label}>🎯 Kunlik me'yorlar (ixtiyoriy)</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Input label="Suv (L)" keyboardType="decimal-pad" value={goals.waterL} onChangeText={(v) => setGoals((g) => ({ ...g, waterL: v }))} placeholder="2" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Uyqu (soat)" keyboardType="decimal-pad" value={goals.sleepH} onChangeText={(v) => setGoals((g) => ({ ...g, sleepH: v }))} placeholder="8" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Workout (daq)" keyboardType="number-pad" value={goals.workoutMin} onChangeText={(v) => setGoals((g) => ({ ...g, workoutMin: v }))} placeholder="30" />
          </View>
        </View>
        <Input placeholder="Izoh (kasallik davrida yengil mashq)" value={goals.note} onChangeText={(v) => setGoals((g) => ({ ...g, note: v }))} />
      </View>

      {/* ---------- Labs ---------- */}
      <View style={{ gap: space.sm }}>
        <View style={styles.head}>
          <Text style={styles.label}>🧪 Laboratoriya natijalari</Text>
          <Pressable onPress={() => setLabs((p) => [...p, { name: '', value: '', unit: '', normalRange: '' }])} hitSlop={8} style={styles.add}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addText}>Qo'shish</Text>
          </Pressable>
        </View>
        {labs.map((l, i) => (
          <View key={i} style={styles.box}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1.4 }}>
                <Input placeholder="Nomi" value={l.name} onChangeText={(v) => updateLab(i, { name: v })} />
              </View>
              <View style={{ flex: 1 }}>
                <Input placeholder="Natija" value={l.value} onChangeText={(v) => updateLab(i, { value: v })} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Input placeholder="Birlik" value={l.unit} onChangeText={(v) => updateLab(i, { unit: v })} />
              </View>
              <View style={{ flex: 1 }}>
                <Input placeholder="Norma" value={l.normalRange} onChangeText={(v) => updateLab(i, { normalRange: v })} />
              </View>
              <Pressable onPress={() => setLabs((p) => p.filter((_, idx) => idx !== i))} hitSlop={8} accessibilityLabel="Natijani o'chirish">
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Button title="Yakunlash va bemorga yuborish" icon="checkmark-done" onPress={submit} loading={complete.isPending} disabled={!examination.trim()} />
    </Sheet>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  small: { fontSize: 12, fontWeight: '600', color: colors.muted },
  add: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addText: { color: colors.primary, fontWeight: '600' },
  box: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
});
