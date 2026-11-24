import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompleteExamSheet } from '@/components/doctor/complete-exam-sheet';
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { initials, prettyDate, tashkentToday } from '@/lib/format';
import { useCallNextPatient, useDoctorQueue } from '@/lib/queries';
import type { DoctorPanelQueueEntry } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

const STATUS: Record<DoctorPanelQueueEntry['status'], { label: string; tone: 'primary' | 'success' | 'warning' | 'danger' | 'muted' }> = {
  WAITING: { label: 'Kutmoqda', tone: 'muted' },
  NEAR: { label: 'Navbat yaqin', tone: 'warning' },
  CALLED: { label: 'Qabulda', tone: 'success' },
  COMPLETED: { label: 'Yakunlangan', tone: 'primary' },
  CANCELLED: { label: 'Bekor qilingan', tone: 'danger' },
};

export default function DoctorPanelScreen() {
  const user = useAuth((s) => s.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDoctorQueue();
  const callNext = useCallNextPatient();
  const toast = useToast();
  const [exam, setExam] = useState<{ appointmentId: string; patientName: string } | null>(null);

  if (user?.role !== 'doctor') {
    return <EmptyState icon="lock-closed-outline" title="Faqat shifokorlar uchun" description="Bu bo'lim shifokor hisobi bilan ochiladi." />;
  }

  const queue = data?.queue ?? [];
  const waiting = queue.filter((q) => q.status === 'WAITING' || q.status === 'NEAR').length;
  const done = queue.filter((q) => q.status === 'COMPLETED').length;
  const current = queue.find((q) => q.status === 'CALLED');

  const handleNext = async () => {
    try {
      const res = await callNext.mutateAsync();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (res.called) toast({ type: 'success', title: `Chaqirildi: ${res.called.code}`, message: 'Bemorga Web va Telegram orqali xabar yuborildi.' });
      else toast({ type: 'info', title: 'Navbatda kutayotgan bemor qolmadi.' });
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Keyingi bemorni chaqirib bo'lmadi.") });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={queue}
        keyExtractor={(q) => q._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={{ gap: space.lg }}>
            <View style={{ gap: 2 }}>
              <Text style={font.small}>{prettyDate(tashkentToday())}</Text>
              <Text style={font.h1}>Navbat paneli</Text>
            </View>

            <View style={styles.stats}>
              <Stat value={waiting} label="Kutmoqda" color={colors.primary} />
              <Stat value={current ? 1 : 0} label="Qabulda" color={colors.success} />
              <Stat value={done} label="Yakunlangan" color={colors.muted} />
            </View>

            {current && (
              <View style={styles.current}>
                <Text style={styles.currentLabel}>HOZIR QABULDA</Text>
                <View style={styles.row}>
                  <Text style={styles.currentCode}>{current.code}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[font.h3, { color: colors.white }]}>{current.patient?.name}</Text>
                    <Text style={{ color: '#D1FAE5', fontSize: 13 }}>Qabul vaqti: {current.appointment?.time}</Text>
                  </View>
                </View>
                <Button
                  title="Ko'rikni yakunlash"
                  icon="document-text"
                  variant="outline"
                  onPress={() => setExam({ appointmentId: current.appointment._id, patientName: current.patient?.name ?? '' })}
                />
              </View>
            )}

            <Button
              title={waiting > 0 ? 'Keyingi bemorni chaqirish' : 'Kutayotgan bemor yo\'q'}
              icon="megaphone"
              size="lg"
              disabled={waiting === 0}
              loading={callNext.isPending}
              onPress={handleNext}
            />
            <Text style={[font.h3, { marginTop: space.xs }]}>Bugungi navbat</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState icon="people-outline" title="Bugun navbat yo'q" description="Bemorlar navbat olishi bilan bu yerda darhol paydo bo'ladi." />
          )
        }
        renderItem={({ item: q }) => {
          const s = STATUS[q.status];
          // Moved on with "Keyingi bemor" before the exam was written: the
          // visit must still be able to get its record / prescriptions.
          const needsRecord = q.status === 'COMPLETED' && !q.hasRecord && !!q.appointment;
          const faded = (q.status === 'COMPLETED' && !needsRecord) || q.status === 'CANCELLED';
          return (
            <Card
              onPress={needsRecord ? () => setExam({ appointmentId: q.appointment._id, patientName: q.patient?.name ?? '' }) : undefined}
              style={[styles.item, faded && { opacity: 0.6 }, q.status === 'CALLED' && { borderColor: colors.success }, needsRecord && { borderColor: colors.warning }]}
            >
              <View style={styles.codeBox}>
                <Text style={styles.code}>{q.code}</Text>
              </View>
              <Avatar text={initials(q.patient?.name)} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={font.h3} numberOfLines={1}>{q.patient?.name}</Text>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={13} color={colors.muted} />
                  <Text style={font.small}>{q.appointment?.time}</Text>
                </View>
              </View>
              {needsRecord ? <Badge label="Xulosa yozish" tone="warning" icon="create-outline" /> : <Badge label={s.label} tone={s.tone} />}
            </Card>
          );
        }}
      />

      {exam && (
        <CompleteExamSheet visible onClose={() => setExam(null)} appointmentId={exam.appointmentId} patientName={exam.patientName} />
      )}
    </SafeAreaView>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={[font.stat, { color }]}>{value}</Text>
      <Text style={font.tiny}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.lg, paddingBottom: space.xxxl, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, alignItems: 'center', paddingVertical: space.md, gap: 2 },
  current: { backgroundColor: colors.success, borderRadius: radius.xl, padding: space.lg, gap: space.md },
  currentLabel: { color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 1, opacity: 0.9 },
  currentCode: { color: colors.white, fontSize: 34, fontWeight: '800', marginRight: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  codeBox: { minWidth: 52, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center' },
  code: { fontSize: 15, fontWeight: '800', color: colors.primary },
});
