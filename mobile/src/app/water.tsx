import { useState } from 'react';
import { Text, View } from 'react-native';
import { AddWaterSheet } from '@/components/health/sheets';
import { Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Progress, Screen } from '@/components/ui';
import { clockTime } from '@/lib/format';
import { useDashboard, useWaterLogs } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function WaterScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useWaterLogs();
  const goal = useDashboard().data?.water.goalMl ?? 2500;
  const [open, setOpen] = useState(false);
  const total = data?.totalMl ?? 0;

  return (
    <>
      <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBox name="water" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={font.small}>Bugun ichilgan</Text>
              <Text style={font.stat}>
                {(total / 1000).toFixed(1)} L <Text style={font.small}>/ {(goal / 1000).toFixed(1)} L</Text>
              </Text>
            </View>
            <Text style={[font.h2, { color: colors.primary }]}>{Math.min(100, Math.round((total / goal) * 100))}%</Text>
          </View>
          <Progress value={(total / goal) * 100} />
          <Button title="Suv qo'shish" icon="add-circle" onPress={() => setOpen(true)} />
        </Card>

        <Text style={font.h3}>Bugungi tarix</Text>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.logs.length === 0 && (
          <EmptyState icon="water-outline" description="Bugun hali suv qo'shmadingiz." actionLabel="Suv qo'shish" onAction={() => setOpen(true)} />
        )}
        {data?.logs.map((l) => (
          <Card key={l._id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
            <IconBox name="water-outline" size={34} />
            <Text style={[font.h3, { flex: 1 }]}>{l.amountMl} ml</Text>
            <Text style={font.small}>{clockTime(l.createdAt)}</Text>
          </Card>
        ))}
      </Screen>
      <AddWaterSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
