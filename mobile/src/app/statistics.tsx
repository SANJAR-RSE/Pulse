import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card, ErrorState, IconBox, LoadingState, Progress, Screen, type IconName } from '@/components/ui';
import { useStatistics } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function StatisticsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useStatistics();
  const t = data?.thisWeek;
  const l = data?.lastWeek;
  const g = data?.weeklyGoals;
  return (
    <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
      <Text style={font.small}>
        Oxirgi 7 kun — o'tgan hafta bilan solishtirish{g?.setBy ? ` va ${g.setBy} belgilagan me'yor bilan.` : " va haftalik me'yor bilan."}
      </Text>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {t && l && g && (
        <View style={styles.grid}>
          <Stat icon="water" label="Suv" now={t.waterLiters} prev={l.waterLiters} unit=" L" goal={g.waterLiters} />
          <Stat icon="moon" label="Uyqu" now={t.sleepHours} prev={l.sleepHours} unit=" soat" goal={g.sleepHours} />
          <Stat icon="barbell" label="Workout" now={t.workoutMinutes} prev={l.workoutMinutes} unit=" daq" goal={g.workoutMinutes} />
          <Stat icon="medkit" label="Dori qabuli" now={t.medicationAdherence} prev={l.medicationAdherence} unit="%" goal={100} />
          <Stat icon="calendar" label="Qabullar" now={t.appointments} prev={l.appointments} unit="" />
          <Stat icon="people" label="Navbat kutish" now={t.queueAverageMinutes} prev={l.queueAverageMinutes} unit=" daq" higherIsBetter={false} />
        </View>
      )}
    </Screen>
  );
}

function Stat({ icon, label, now, prev, unit, goal, higherIsBetter = true }: { icon: IconName; label: string; now: number | null; prev: number | null; unit: string; goal?: number; higherIsBetter?: boolean }) {
  let delta: React.ReactNode = <Text style={font.tiny}>O'tgan hafta: {prev === null ? '—' : `${prev}${unit}`}</Text>;
  if (now !== null && prev !== null) {
    const diff = +(now - prev).toFixed(1);
    if (diff !== 0) {
      const good = diff > 0 === higherIsBetter;
      delta = (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Ionicons name={diff > 0 ? 'arrow-up' : 'arrow-down'} size={12} color={good ? colors.success : colors.danger} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: good ? colors.success : colors.danger }}>
            {diff > 0 ? '+' : ''}
            {diff}
            {unit}
          </Text>
          <Text style={font.tiny}> o'tgan haftaga</Text>
        </View>
      );
    } else {
      delta = <Text style={font.tiny}>O'tgan hafta bilan bir xil</Text>;
    }
  }
  return (
    <Card style={styles.card}>
      <IconBox name={icon} size={34} />
      <Text style={font.small}>{label}</Text>
      <Text style={font.stat}>
        {now === null ? '—' : `${now}${unit}`}
        {goal !== undefined && <Text style={font.small}> / {goal}{unit}</Text>}
      </Text>
      {goal !== undefined && now !== null && <Progress value={(now / goal) * 100} />}
      {delta}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  card: { width: '47.8%', gap: 6, padding: space.md },
});
