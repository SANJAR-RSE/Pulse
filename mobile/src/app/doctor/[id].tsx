import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { addDays, dayLabel, initials, prettyDate, tashkentToday } from '@/lib/format';
import { useCreateAppointment, useDoctor, useDoctorSlots } from '@/lib/queries';
import type { Appointment, QueueStatus } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

// Clinic -> department -> doctor -> date -> free time -> confirmation -> queue.
export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const today = tashkentToday();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [result, setResult] = useState<{ appointment: Appointment; queue: QueueStatus } | null>(null);

  const doctor = useDoctor(id);
  const slots = useDoctorSlots(id, date);
  const create = useCreateAppointment();
  const toast = useToast();

  const confirm = async () => {
    if (!time) return;
    try {
      const res = await create.mutateAsync({ doctorId: id, date, time });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult(res);
    } catch (e) {
      setTime(null);
      toast({ type: 'error', title: errorMessage(e, 'Navbat olishda xatolik yuz berdi.') });
    }
  };

  if (result) {
    return (
      <Screen style={{ alignItems: 'stretch', paddingTop: space.xxxl }}>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={44} color={colors.white} />
          </View>
          <Text style={font.h1}>Navbat tasdiqlandi!</Text>
          <Text style={[font.body, { textAlign: 'center' }]}>
            {prettyDate(result.appointment.date)} kuni soat {result.appointment.time} da kutamiz.
          </Text>
        </View>
        <Card style={{ alignItems: 'center', gap: space.xs }}>
          <Text style={font.tiny}>NAVBAT KODINGIZ</Text>
          <Text style={styles.code}>{result.queue.code}</Text>
          <Text style={font.small}>Navbat holati real vaqtda yangilanadi — chaqirilganingizda xabar olasiz.</Text>
        </Card>
        <Button title="Navbatlarimni ko'rish" icon="calendar" size="lg" onPress={() => router.replace('/appointments')} />
        <Button title="Bosh sahifaga qaytish" variant="outline" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  if (doctor.isLoading) return <LoadingState label="Shifokor ma'lumotlari yuklanmoqda..." />;
  if (doctor.isError || !doctor.data) return <Screen><ErrorState onRetry={() => doctor.refetch()} /></Screen>;
  const d = doctor.data.doctor;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen onRefresh={() => slots.refetch()} refreshing={slots.isRefetching}>
        <Card>
          <View style={styles.row}>
            <Avatar text={initials(`${d.firstName} ${d.lastName}`)} size={60} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={font.h2}>Dr. {d.firstName} {d.lastName}</Text>
              <Text style={font.small}>{d.specialty} · {d.experienceYears} yil tajriba</Text>
              <View style={styles.meta}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={font.small}>{d.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.meta, { marginTop: space.md }]}>
            <Ionicons name="business-outline" size={15} color={colors.muted} />
            <Text style={font.small}>{d.clinic?.name} · {d.clinic?.address}</Text>
          </View>
          <View style={[styles.meta, { marginTop: 4 }]}>
            <Ionicons name="time-outline" size={15} color={colors.muted} />
            <Text style={font.small}>Ish vaqti: {d.workingHours.start} – {d.workingHours.end} (Dush–Jum)</Text>
          </View>
        </Card>

        <Text style={font.h3}>Sanani tanlang</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {days.map((day) => {
            const l = dayLabel(day, today);
            const active = day === date;
            return (
              <Pressable
                key={day}
                onPress={() => {
                  setDate(day);
                  setTime(null);
                  void Haptics.selectionAsync();
                }}
                style={[styles.day, active && styles.active]}
              >
                <Text style={[styles.dayTop, active && { color: colors.white }]}>{l.top}</Text>
                <Text style={[styles.dayBottom, active && { color: colors.white }]}>{l.bottom}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={font.h3}>Bo'sh vaqtni tanlang</Text>
        {slots.isLoading && <LoadingState label="Bo'sh vaqtlar yuklanmoqda..." />}
        {slots.isError && <ErrorState onRetry={() => slots.refetch()} />}
        {slots.data && slots.data.slots.length === 0 && (
          <EmptyState icon="time-outline" title="Bu kunda bo'sh vaqt yo'q" description="Boshqa sanani tanlang (shifokor dam olish kunlari ishlamaydi)." />
        )}
        {slots.data && slots.data.slots.length > 0 && (
          <View style={styles.slots}>
            {slots.data.slots.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setTime(s);
                  void Haptics.selectionAsync();
                }}
                style={[styles.slot, time === s && styles.active]}
              >
                <Text style={[styles.slotText, time === s && { color: colors.white }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Screen>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Text style={font.small}>
          {time ? `${dayLabel(date, today).top}, ${dayLabel(date, today).bottom} · ${time}` : 'Vaqtni tanlang'}
        </Text>
        <Button title="Navbat olish" icon="checkmark-circle" size="lg" disabled={!time} loading={create.isPending} onPress={confirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  day: { width: 72, paddingVertical: space.md, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  dayTop: { fontSize: 13, fontWeight: '600', color: colors.muted },
  dayBottom: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  slot: { width: '23%', paddingVertical: 12, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  slotText: { fontSize: 15, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  footer: { padding: space.lg, paddingBottom: space.xl, gap: space.sm, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  successIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  code: { fontSize: 52, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
});
