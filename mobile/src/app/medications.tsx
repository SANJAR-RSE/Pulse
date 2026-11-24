import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AddMedicationSheet } from '@/components/health/sheets';
import { Badge, Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Screen } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useMarkMedicationTaken, useMedications } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function MedicationsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMedications();
  const mark = useMarkMedicationTaken();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const meds = data?.medications ?? [];
  const taken = meds.filter((m) => m.takenToday).length;

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

  return (
    <>
      <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBox name="medkit" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Bugun qabul qilingan</Text>
              <Text style={font.stat}>{taken} / {meds.length}</Text>
            </View>
          </View>
          <Text style={font.tiny}>PULSE dori yoki doza tavsiya qilmaydi — faqat sizning jadvalingizni eslatadi.</Text>
          <Button title="Dorini belgilash" icon="add-circle" onPress={() => setOpen(true)} />
        </Card>

        <Text style={font.h3}>Kundalik jadval</Text>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && meds.length === 0 && (
          <EmptyState icon="medkit-outline" description="Hali dori belgilanmagan." actionLabel="Dorini belgilash" onAction={() => setOpen(true)} />
        )}
        {meds.map((m) => (
          <Card key={m._id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
            <IconBox name="medical-outline" size={38} />
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>{m.name}</Text>
              <Text style={font.small}>Har kuni · {m.time}</Text>
            </View>
            {m.takenToday ? (
              <Badge label="Qabul qilindi" tone="success" icon="checkmark" />
            ) : (
              <Button title="Ichdim" icon="checkmark" size="sm" variant="soft" loading={pending === m._id} onPress={() => markTaken(m._id, m.name)} />
            )}
          </Card>
        ))}
        {meds.length > 0 && taken === meds.length && (
          <Text style={[font.small, { textAlign: 'center', color: colors.success }]}>Barakalla! Bugungi barcha dorilar qabul qilindi.</Text>
        )}
      </Screen>
      <AddMedicationSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
