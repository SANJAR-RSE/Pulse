import { useState } from 'react';
import { Text, View } from 'react-native';
import { AddSleepSheet } from '@/components/health/sheets';
import { Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Screen } from '@/components/ui';
import { minutesLabel, prettyDate } from '@/lib/format';
import { useSleepLogs } from '@/lib/queries';
import { font, space } from '@/theme';

export default function SleepScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useSleepLogs();
  const [open, setOpen] = useState(false);
  const logs = data?.logs ?? [];
  const avg = logs.length ? Math.round(logs.reduce((s, l) => s + l.durationMinutes, 0) / logs.length) : 0;

  return (
    <>
      <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBox name="moon" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={font.small}>O'rtacha uyqu ({logs.length} kun)</Text>
              <Text style={font.stat}>{logs.length ? minutesLabel(avg) : '—'}</Text>
            </View>
          </View>
          <Button title="Uyquni qayd etish" icon="add-circle" onPress={() => setOpen(true)} />
        </Card>

        <Text style={font.h3}>Uyqu tarixi</Text>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && logs.length === 0 && (
          <EmptyState icon="moon-outline" description="Hali uyqu qayd etilmagan." actionLabel="Uyquni qayd etish" onAction={() => setOpen(true)} />
        )}
        {logs.map((l) => (
          <Card key={l._id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
            <IconBox name="bed-outline" size={34} />
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>{minutesLabel(l.durationMinutes)}</Text>
              <Text style={font.small}>{l.sleepTime} — {l.wakeTime}</Text>
            </View>
            <Text style={font.small}>{prettyDate(l.date)}</Text>
          </Card>
        ))}
      </Screen>
      <AddSleepSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
