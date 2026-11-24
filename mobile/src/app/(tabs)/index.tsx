import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddMedicationSheet, AddSleepSheet, AddWaterSheet, AddWorkoutSheet } from '@/components/health/sheets';
import { Button, Card, ErrorState, IconBox, Progress, Screen, SectionTitle, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth-store';
import { minutesLabel, prettyDate } from '@/lib/format';
import { useDashboard, useNotifications } from '@/lib/queries';
import type { DashboardData } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

type SheetKind = 'water' | 'sleep' | 'workout' | 'med' | null;

// Doctors land on their queue panel once per app session.
let doctorRedirected = false;

export default function DashboardScreen() {
  const user = useAuth((s) => s.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();
  const notifications = useNotifications();
  const unread = notifications.data?.notifications.filter((n) => !n.read).length ?? 0;
  const [sheet, setSheet] = useState<SheetKind>(null);

  useEffect(() => {
    if (user?.role === 'doctor' && !doctorRedirected) {
      doctorRedirected = true;
      router.navigate('/panel');
    }
  }, [user?.role]);

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen onRefresh={() => { void refetch(); void notifications.refetch(); }} refreshing={isRefetching}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={font.small}>Bugungi holat</Text>
            <Text style={font.h1}>Salom, {firstName || 'do\'stim'} 👋</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} style={styles.bell} hitSlop={6} accessibilityLabel={`Bildirishnomalar, ${unread} ta o'qilmagan`}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unread > 0 && (
              <View style={styles.dot}>
                <Text style={styles.dotText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {isError && <ErrorState onRetry={() => refetch()} />}
        {isLoading && <MetricSkeleton />}

        {data && (
          <>
            {/* Live queue status first: it's what matters most when it changes. */}
            {data.queue && data.nextAppointment && (
              <QueueCard
                code={data.queue.code}
                status={data.queue.status}
                ahead={data.queue.aheadCount}
                wait={data.queue.estimatedWaitMinutes}
                when={`${prettyDate(data.nextAppointment.date)} · ${data.nextAppointment.time}`}
                who={`${data.nextAppointment.departmentName} — Dr. ${data.nextAppointment.doctorName}`}
              />
            )}

            <View style={styles.grid}>
              <Metric
                icon="water"
                label="Suv"
                value={`${(data.water.consumedMl / 1000).toFixed(1)} L`}
                hint={`Maqsad ${(data.water.goalMl / 1000).toFixed(1)} L`}
                progress={(data.water.consumedMl / data.water.goalMl) * 100}
                onPress={() => router.push('/water')}
                onAdd={() => setSheet('water')}
              />
              <Metric
                icon="moon"
                label="Uyqu"
                value={data.sleep ? minutesLabel(data.sleep.durationMinutes) : '—'}
                hint={data.sleep ? 'Bugun qayd etilgan' : 'Hali qayd etilmagan'}
                onPress={() => router.push('/sleep')}
                onAdd={() => setSheet('sleep')}
              />
              <Metric
                icon="barbell"
                label="Workout"
                value={minutesLabel(data.workout.totalMinutes)}
                hint={data.workout.totalMinutes > 0 ? "Bugungi mashg'ulot" : "Hali mashg'ulot yo'q"}
                onPress={() => router.push('/workout')}
                onAdd={() => setSheet('workout')}
              />
              <Metric
                icon="medkit"
                label="Dorilar"
                value={`${data.medication.taken} / ${data.medication.total}`}
                hint={data.medication.total === 0 ? 'Dori belgilanmagan' : 'Bugun qabul qilingan'}
                progress={data.medication.total ? (data.medication.taken / data.medication.total) * 100 : undefined}
                onPress={() => router.push('/medications')}
                onAdd={() => setSheet('med')}
              />
            </View>

            <GoalsCard data={data} />

            {!data.queue && (
              <Card>
                <View style={styles.rowCenter}>
                  <IconBox name="calendar" />
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3}>Keyingi navbat</Text>
                    <Text style={font.small}>
                      {data.nextAppointment
                        ? `${prettyDate(data.nextAppointment.date)} · ${data.nextAppointment.time} — ${data.nextAppointment.departmentName}`
                        : "Hozircha navbatingiz yo'q."}
                    </Text>
                  </View>
                </View>
                {!data.nextAppointment && user?.role !== 'doctor' && (
                  <Button title="Shifokorni tanlash" icon="medkit" style={{ marginTop: space.md }} onPress={() => router.push('/doctors')} />
                )}
              </Card>
            )}

            <Card>
              <View style={styles.rowCenter}>
                <IconBox name="pulse" />
                <View style={{ flex: 1 }}>
                  <Text style={font.h3}>Health Score</Text>
                  <Text style={font.tiny}>Bu tashxis emas — kundalik faoliyatingiz asosidagi progress.</Text>
                </View>
                <Text style={[font.stat, { color: colors.primary }]}>{data.healthScore}%</Text>
              </View>
              <View style={{ marginTop: space.md }}>
                <Progress value={data.healthScore} />
              </View>
            </Card>

            <Pressable onPress={() => router.push('/ai')} style={({ pressed }) => [styles.ai, pressed && { opacity: 0.9 }]}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[font.h3, { color: colors.white }]}>PULSE AI</Text>
                <Text style={{ color: '#DCE7FF', fontSize: 13 }}>"Boshim og'riyapti", "Navbatim qachon?"</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </Pressable>

            <SectionTitle title="Bo'limlar" />
            <View style={styles.links}>
              <QuickLink icon="document-text" label="Tibbiy tarix" onPress={() => router.push('/medical-history')} />
              <QuickLink icon="stats-chart" label="Statistika" onPress={() => router.push('/statistics')} />
              <QuickLink icon="business" label="Klinikalar" onPress={() => router.push('/clinics')} />
              <QuickLink icon="alert-circle" label="Favqulodda" danger onPress={() => router.push('/emergency')} />
            </View>
          </>
        )}
      </Screen>

      <AddWaterSheet visible={sheet === 'water'} onClose={() => setSheet(null)} />
      <AddSleepSheet visible={sheet === 'sleep'} onClose={() => setSheet(null)} />
      <AddWorkoutSheet visible={sheet === 'workout'} onClose={() => setSheet(null)} />
      <AddMedicationSheet visible={sheet === 'med'} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

function QueueCard({ code, status, ahead, wait, when, who }: { code: string; status: string; ahead: number; wait: number; when: string; who: string }) {
  const called = status === 'CALLED';
  const near = status === 'NEAR';
  const bg = called ? colors.success : near ? colors.warning : colors.primary;
  return (
    <Pressable onPress={() => router.push('/appointments')} style={[styles.queue, { backgroundColor: bg }]}>
      <View style={styles.rowCenter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.queueLabel}>{called ? 'NAVBATINGIZ KELDI!' : near ? 'NAVBATINGIZ YAQIN' : 'SIZNING NAVBATINGIZ'}</Text>
          <Text style={styles.queueCode}>{code}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {called ? (
            <Ionicons name="walk" size={40} color={colors.white} />
          ) : (
            <>
              <Text style={styles.queueBig}>{ahead}</Text>
              <Text style={styles.queueSmall}>kishi oldingizda</Text>
            </>
          )}
        </View>
      </View>
      <Text style={styles.queueSmall}>
        {called ? 'Iltimos, shifokor xonasiga boring.' : `Taxminiy kutish: ${wait} daqiqa`}
      </Text>
      <Text style={[styles.queueSmall, { opacity: 0.85 }]}>
        {when} · {who}
      </Text>
    </Pressable>
  );
}

function Metric({ icon, label, value, hint, progress, onPress, onAdd }: { icon: IconName; label: string; value: string; hint: string; progress?: number; onPress: () => void; onAdd: () => void }) {
  return (
    <Card onPress={onPress} style={styles.metric}>
      <View style={styles.metricHead}>
        <IconBox name={icon} size={34} />
        <Pressable onPress={onAdd} hitSlop={10} style={styles.add} accessibilityLabel={`${label} qo'shish`}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>
      <Text style={font.small}>{label}</Text>
      <Text style={font.stat} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {progress !== undefined ? <Progress value={progress} /> : <Text style={font.tiny}>{hint}</Text>}
    </Card>
  );
}

// Today vs the daily targets (doctor-set when available).
function GoalsCard({ data }: { data: DashboardData }) {
  const g = data.goals;
  if (!g) return null;
  const sleepMin = data.sleep?.durationMinutes ?? 0;
  const rows: { icon: IconName; label: string; value: string; pct: number }[] = [
    { icon: 'water', label: 'Suv', value: `${(data.water.consumedMl / 1000).toFixed(1)} / ${(g.waterMl / 1000).toFixed(1)} L`, pct: (data.water.consumedMl / g.waterMl) * 100 },
    { icon: 'moon', label: 'Uyqu', value: `${(sleepMin / 60).toFixed(1)} / ${g.sleepHours} soat`, pct: (sleepMin / (g.sleepHours * 60)) * 100 },
    { icon: 'barbell', label: 'Workout', value: `${data.workout.totalMinutes} / ${g.workoutMinutes} daq`, pct: g.workoutMinutes ? (data.workout.totalMinutes / g.workoutMinutes) * 100 : 100 },
  ];
  return (
    <Card style={[{ gap: space.md }, g.setBy ? { borderColor: '#BFD3FD', backgroundColor: '#F7FAFF' } : null]}>
      <View style={styles.rowCenter}>
        <IconBox name="flag" size={34} />
        <View style={{ flex: 1 }}>
          <Text style={font.h3}>{g.setBy ? 'Shifokoringiz tavsiyasi' : "Kunlik me'yor"}</Text>
          {!!g.setBy && <Text style={font.tiny}>{g.setBy}</Text>}
        </View>
      </View>
      {!!g.note && <Text style={font.small}>📝 {g.note}</Text>}
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 6 }}>
          <View style={[styles.rowCenter, { justifyContent: 'space-between' }]}>
            <Text style={font.small}>{r.label}</Text>
            <Text style={{ fontWeight: '700', color: colors.text }}>
              {r.value} {r.pct >= 100 ? '✅' : ''}
            </Text>
          </View>
          <Progress value={r.pct} color={r.pct >= 100 ? colors.success : colors.primary} />
        </View>
      ))}
    </Card>
  );
}

function QuickLink({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.link, pressed && { opacity: 0.8 }]}>
      <IconBox name={icon} color={danger ? colors.danger : colors.primary} bg={danger ? colors.dangerSoft : colors.primarySoft} />
      <Text style={styles.linkText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetricSkeleton() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.metric, styles.skeleton]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dot: { position: 'absolute', top: 4, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  dotText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  metric: { width: '47.8%', gap: 6, padding: space.md },
  metricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  add: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  skeleton: { height: 132, backgroundColor: '#E9EDF3', borderRadius: radius.lg },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  queue: { borderRadius: radius.xl, padding: space.xl, gap: 6 },
  queueLabel: { color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 1, opacity: 0.9 },
  queueCode: { color: colors.white, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  queueBig: { color: colors.white, fontSize: 34, fontWeight: '800' },
  queueSmall: { color: colors.white, fontSize: 13 },
  ai: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.primary, borderRadius: radius.xl, padding: space.lg },
  aiIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { width: '23%', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 12, fontWeight: '600', color: colors.textSoft },
});
