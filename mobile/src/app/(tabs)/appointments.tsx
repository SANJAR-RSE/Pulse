import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { prettyDate, tashkentToday } from '@/lib/format';
import { useAppointments, useCancelAppointment, useQueueStatus } from '@/lib/queries';
import type { Appointment } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

const STATUS: Record<Appointment['status'], { label: string; tone: 'primary' | 'success' | 'warning' | 'danger' | 'muted' }> = {
  pending: { label: 'Kutilmoqda', tone: 'warning' },
  confirmed: { label: 'Tasdiqlangan', tone: 'primary' },
  completed: { label: 'Yakunlangan', tone: 'success' },
  cancelled: { label: 'Bekor qilingan', tone: 'muted' },
};

export default function AppointmentsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useAppointments();
  const cancel = useCancelAppointment();
  const toast = useToast();
  const today = tashkentToday();

  // Upcoming first (soonest on top), then history (newest on top).
  const list = [...(data?.appointments ?? [])].sort((a, b) => {
    const ua = isUpcoming(a, today), ub = isUpcoming(b, today);
    if (ua !== ub) return ua ? -1 : 1;
    const ka = `${a.date} ${a.time}`, kb = `${b.date} ${b.time}`;
    return ua ? ka.localeCompare(kb) : kb.localeCompare(ka);
  });

  const askCancel = (a: Appointment) =>
    confirmAction(
      'Navbatni bekor qilish',
      `${prettyDate(a.date)} · ${a.time} — Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}. Bekor qilasizmi?`,
      'Bekor qilish',
      async () => {
        try {
          await cancel.mutateAsync(a._id);
          toast({ type: 'success', title: 'Navbat bekor qilindi' });
        } catch (e) {
          toast({ type: 'error', title: errorMessage(e, "Navbatni bekor qilib bo'lmadi.") });
        }
      }
    );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={list}
        keyExtractor={(a) => a._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={{ gap: 2, marginBottom: space.sm }}>
            <Text style={font.h1}>Navbatlarim</Text>
            <Text style={font.small}>Navbat holati real vaqtda yangilanadi.</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <EmptyState icon="calendar-outline" description="Hali navbat olmadingiz. Shifokorni tanlab, navbat oling." actionLabel="Shifokorni tanlash" onAction={() => router.push('/doctors')} />
          )
        }
        renderItem={({ item: a }) => {
          const s = STATUS[a.status];
          const active = isUpcoming(a, today);
          return (
            <Card style={!active && { opacity: 0.75 }}>
              <View style={styles.top}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={font.h3}>{prettyDate(a.date)} · {a.time}</Text>
                  <Text style={font.small}>Dr. {a.doctor?.firstName} {a.doctor?.lastName} — {a.department?.name}</Text>
                  <View style={styles.meta}>
                    <Ionicons name="business-outline" size={13} color={colors.muted} />
                    <Text style={font.small}>{a.clinic?.name}</Text>
                  </View>
                </View>
                <Badge label={s.label} tone={s.tone} />
              </View>
              {active && <LiveQueue appointmentId={a._id} />}
              {active && (
                <Button title="Navbatni bekor qilish" icon="close-circle-outline" variant="danger" size="sm" style={{ marginTop: space.md }} onPress={() => askCancel(a)} />
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

function isUpcoming(a: Appointment, today: string) {
  return (a.status === 'confirmed' || a.status === 'pending') && a.date >= today;
}

// Live position in the doctor's queue (pushed over the socket).
function LiveQueue({ appointmentId }: { appointmentId: string }) {
  const { data } = useQueueStatus(appointmentId);
  if (!data) return null;
  const called = data.status === 'CALLED';
  const near = data.status === 'NEAR';
  const bg = called ? colors.successSoft : near ? colors.warningSoft : colors.primarySoft;
  const fg = called ? colors.success : near ? colors.warning : colors.primary;
  return (
    <View style={[styles.queue, { backgroundColor: bg }]}>
      <Text style={[styles.queueCode, { color: fg }]}>{data.code}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.queueText, { color: fg }]}>
          {called ? 'Navbatingiz keldi! Shifokor xonasiga boring.' : near ? 'Navbatingiz yaqin — tayyor turing.' : `Oldingizda ${data.aheadCount} kishi`}
        </Text>
        {!called && <Text style={font.tiny}>Taxminiy kutish: {data.estimatedWaitMinutes} daqiqa</Text>}
      </View>
      <Ionicons name={called ? 'walk' : 'people'} size={22} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.lg, paddingBottom: space.xxxl, gap: space.md },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  queue: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md, padding: space.md, borderRadius: radius.md },
  queueCode: { fontSize: 22, fontWeight: '800' },
  queueText: { fontSize: 14, fontWeight: '600' },
});
