import { StyleSheet, Text, View } from 'react-native';
import { Card, ErrorState, IconBox, LoadingState, Progress, Screen, type IconName } from '@/components/ui';
import { useStatistics } from '@/lib/queries';
import { font, space } from '@/theme';

export default function StatisticsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useStatistics();
  return (
    <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
      <Text style={font.small}>Oxirgi 7 kun (bugun bilan) — faqat siz kiritgan haqiqiy ma'lumotlar asosida.</Text>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && (
        <View style={styles.grid}>
          <Stat icon="water" label="Suv" value={`${data.waterLiters} L`} hint="Haftalik jami" />
          <Stat icon="moon" label="Uyqu" value={`${data.sleepHours} soat`} hint="Haftalik jami" />
          <Stat icon="barbell" label="Workout" value={`${data.workoutSessions}`} hint="Mashg'ulotlar" />
          <Stat
            icon="medkit"
            label="Dori qabuli"
            value={data.medicationAdherence === null ? '—' : `${data.medicationAdherence}%`}
            hint={data.medicationAdherence === null ? "Dori belgilanmagan" : 'Belgilangan dozalardan'}
            progress={data.medicationAdherence ?? undefined}
          />
          <Stat icon="calendar" label="Qabullar" value={`${data.appointments}`} hint="Shifokor navbatlari" />
          <Stat
            icon="people"
            label="O'rtacha kutish"
            value={data.queueAverageMinutes === null ? '—' : `${data.queueAverageMinutes} daq`}
            hint="Navbatda"
          />
        </View>
      )}
    </Screen>
  );
}

function Stat({ icon, label, value, hint, progress }: { icon: IconName; label: string; value: string; hint: string; progress?: number }) {
  return (
    <Card style={styles.card}>
      <IconBox name={icon} size={34} />
      <Text style={font.small}>{label}</Text>
      <Text style={font.stat}>{value}</Text>
      {progress !== undefined ? <Progress value={progress} /> : <Text style={font.tiny}>{hint}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  card: { width: '47.8%', gap: 6, padding: space.md },
});
