import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AddMedicationSheet } from '@/components/health/sheets';
import { Badge, Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Screen } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { prettyDate } from '@/lib/format';
import { useMarkMedicationTaken, useMedications } from '@/lib/queries';
import { MEAL_LABEL, type Medication } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

// N daily intakes of one prescribed medicine share a courseId -> one card.
function groupCourses(meds: Medication[]) {
  const groups = new Map<string, Medication[]>();
  for (const m of meds) {
    const key = m.courseId ?? m._id;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  return [...groups.values()].map((items) => items.sort((a, b) => a.time.localeCompare(b.time)));
}

export default function MedicationsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMedications();
  const mark = useMarkMedicationTaken();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const meds = data?.medications ?? [];
  const taken = meds.filter((m) => m.takenToday).length;
  const groups = groupCourses(meds);
  const doctorGroups = groups.filter((g) => g[0].source === 'doctor');
  const selfGroups = groups.filter((g) => g[0].source !== 'doctor');

  const markTaken = async (id: string, name: string) => {
    setPending(id);
    try {
      await mark.mutateAsync(id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast({ type: 'success', title: `${name} — qabul qilindi` });
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Dorini belgilab bo'lmadi.") });
    } finally {
      setPending(null);
    }
  };

  const renderGroup = (items: Medication[]) => {
    const f = items[0];
    const doctor = f.source === 'doctor';
    return (
      <Card key={f.courseId ?? f._id} style={[{ gap: space.md }, doctor && { borderColor: '#BFD3FD' }]}>
        <View style={styles.row}>
          <IconBox name="medical" size={40} />
          <View style={{ flex: 1 }}>
            <Text style={font.h3}>{f.name}</Text>
            <Text style={font.small}>{[f.dosage, `kuniga ${items.length} mahal`].filter(Boolean).join(' · ')}</Text>
          </View>
        </View>
        {doctor && <Badge label={f.doctorName || 'Shifokor'} icon="medkit" />}
        {(f.mealRelation && f.mealRelation !== 'any') || f.endDate || f.note ? (
          <View style={{ gap: 4 }}>
            {f.mealRelation && f.mealRelation !== 'any' && (
              <View style={styles.row}>
                <Ionicons name="restaurant-outline" size={14} color={colors.muted} />
                <Text style={font.small}>{MEAL_LABEL[f.mealRelation]}</Text>
              </View>
            )}
            {f.endDate && (
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                <Text style={font.small}>{prettyDate(f.endDate)} gacha</Text>
              </View>
            )}
            {!!f.note && <Text style={font.small}>📝 {f.note}</Text>}
          </View>
        ) : null}
        <View style={{ gap: 6 }}>
          {items.map((m) => (
            <View key={m._id} style={styles.intake}>
              <Text style={styles.time}>{m.time}</Text>
              {m.takenToday ? (
                <Badge label="Qabul qilindi" tone="success" icon="checkmark" />
              ) : (
                <Button title="Ichdim" icon="checkmark" size="sm" variant="soft" loading={pending === m._id} onPress={() => markTaken(m._id, m.name)} />
              )}
            </View>
          ))}
        </View>
      </Card>
    );
  };

  return (
    <>
      <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
        <Card style={{ gap: space.md }}>
          <View style={styles.row}>
            <IconBox name="medkit" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Bugun qabul qilingan</Text>
              <Text style={font.stat}>{taken} / {meds.length}</Text>
            </View>
          </View>
          <Text style={font.tiny}>Har qabul vaqtida eslatma keladi — ilova yopiq bo'lsa ham.</Text>
          <Button title="Dorini belgilash" icon="add-circle" variant="outline" onPress={() => setOpen(true)} />
        </Card>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && meds.length === 0 && (
          <EmptyState icon="medkit-outline" description="Shifokoringiz yozgan dorilar ko'rikdan keyin shu yerda avtomatik paydo bo'ladi." actionLabel="Dorini belgilash" onAction={() => setOpen(true)} />
        )}
        {doctorGroups.length > 0 && <Text style={font.h3}>🩺 Shifokor tayinlagan</Text>}
        {doctorGroups.map(renderGroup)}
        {selfGroups.length > 0 && <Text style={font.h3}>O'zim qo'shganlarim</Text>}
        {selfGroups.map(renderGroup)}
        {meds.length > 0 && taken === meds.length && (
          <Text style={[font.small, { textAlign: 'center', color: colors.success }]}>Barakalla! Bugungi barcha dorilar qabul qilindi.</Text>
        )}
      </Screen>
      <AddMedicationSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  intake: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 6 },
  time: { fontSize: 16, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
});
