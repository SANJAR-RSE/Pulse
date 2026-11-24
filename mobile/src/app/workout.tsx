import { useState } from 'react';
import { Text, View } from 'react-native';
import { AddWorkoutSheet } from '@/components/health/sheets';
import { Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Screen } from '@/components/ui';
import { prettyDate } from '@/lib/format';
import { useWorkouts } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function WorkoutScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useWorkouts();
  const [open, setOpen] = useState(false);
  const list = data?.workouts ?? [];
  const totalMin = list.reduce((s, w) => s + w.durationMinutes, 0);

  return (
    <>
      <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBox name="barbell" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Jami mashg'ulotlar</Text>
              <Text style={font.stat}>
                {list.length} <Text style={font.small}>· {totalMin} daqiqa</Text>
              </Text>
            </View>
          </View>
          <Button title="Workout qo'shish" icon="add-circle" onPress={() => setOpen(true)} />
        </Card>

        <Text style={font.h3}>Mashg'ulotlar tarixi</Text>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && list.length === 0 && (
          <EmptyState icon="barbell-outline" description="Hali workout qayd etilmagan." actionLabel="Workout qo'shish" onAction={() => setOpen(true)} />
        )}
        {list.map((w) => (
          <Card key={w._id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
            <IconBox name="fitness-outline" size={34} />
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>{w.type}</Text>
              <Text style={font.small}>
                {w.durationMinutes} daqiqa{w.calories ? ` · ${w.calories} kkal` : ''}
              </Text>
            </View>
            <Text style={[font.small, { color: colors.muted }]}>{prettyDate(w.date)}</Text>
          </Card>
        ))}
      </Screen>
      <AddWorkoutSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
