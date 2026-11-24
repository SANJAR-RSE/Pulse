import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Sheet } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useCompleteAppointment } from '@/lib/queries';
import type { LabResult } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

const EMPTY_LAB: LabResult = { name: '', value: '', unit: '', normalRange: '' };

// Doctor finishes the visit: examination + recommendation + lab results
// become a Medical Record the patient sees instantly (real-time).
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
  const [labs, setLabs] = useState<LabResult[]>([]);

  const update = (i: number, patch: Partial<LabResult>) => setLabs((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const submit = async () => {
    if (!examination.trim()) return toast({ type: 'error', title: "Ko'rik xulosasini kiriting." });
    try {
      await complete.mutateAsync({
        appointmentId,
        examination: examination.trim(),
        recommendation: recommendation.trim(),
        labResults: labs.filter((l) => l.name.trim() && l.value.trim()),
      });
      toast({ type: 'success', title: "Ko'rik yakunlandi", message: 'Tibbiy yozuv bemorga yuborildi.' });
      setExamination('');
      setRecommendation('');
      setLabs([]);
      onClose();
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Ko'rikni yakunlab bo'lmadi.") });
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Ko'rikni yakunlash" subtitle={patientName}>
      <Input label="Ko'rik xulosasi *" multiline value={examination} onChangeText={setExamination} placeholder="Ko'rik natijalari, muhim topilmalar..." />
      <Input label="Tavsiya" multiline value={recommendation} onChangeText={setRecommendation} placeholder="Bemorga tavsiyalar (ixtiyoriy)" />

      <View style={{ gap: space.sm }}>
        <View style={styles.labHead}>
          <Text style={styles.label}>Laboratoriya natijalari</Text>
          <Pressable onPress={() => setLabs((p) => [...p, { ...EMPTY_LAB }])} hitSlop={8} style={styles.addLab}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Qo'shish</Text>
          </Pressable>
        </View>
        {labs.length === 0 && <Text style={font.small}>Ixtiyoriy — masalan: Gemoglobin, 135, g/L</Text>}
        {labs.map((l, i) => (
          <View key={i} style={styles.labCard}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1.4 }}>
                <Input placeholder="Nomi" value={l.name} onChangeText={(v) => update(i, { name: v })} />
              </View>
              <View style={{ flex: 1 }}>
                <Input placeholder="Natija" value={l.value} onChangeText={(v) => update(i, { value: v })} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Input placeholder="Birlik" value={l.unit} onChangeText={(v) => update(i, { unit: v })} />
              </View>
              <View style={{ flex: 1 }}>
                <Input placeholder="Norma" value={l.normalRange} onChangeText={(v) => update(i, { normalRange: v })} />
              </View>
              <Pressable onPress={() => setLabs((p) => p.filter((_, idx) => idx !== i))} hitSlop={8} accessibilityLabel="Natijani o'chirish">
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Button title="Yakunlash va saqlash" icon="checkmark-done" onPress={submit} loading={complete.isPending} disabled={!examination.trim()} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
  labHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addLab: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  labCard: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border },
});
