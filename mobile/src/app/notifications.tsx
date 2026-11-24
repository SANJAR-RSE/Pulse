import { Text, View } from 'react-native';
import { Card, EmptyState, ErrorState, IconBox, LoadingState, Screen, type IconName } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { useMarkNotificationRead, useNotifications } from '@/lib/queries';
import { colors, font, space } from '@/theme';

const ICON: Record<string, IconName> = {
  appointment_confirmed: 'calendar',
  appointment_cancelled: 'close-circle',
  queue_near: 'time',
  queue_called: 'megaphone',
  medication_reminder: 'medkit',
  prescription: 'document-text',
  water_reminder: 'water',
  sleep_reminder: 'moon',
  workout_reminder: 'barbell',
  health_summary: 'document-text',
};

export default function NotificationsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();
  const list = data?.notifications ?? [];

  return (
    <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && list.length === 0 && <EmptyState icon="notifications-outline" description="Navbat va eslatmalar haqidagi xabarlar shu yerda chiqadi." />}
      {list.map((n) => {
        const called = n.type === 'queue_called';
        return (
          <Card
            key={n._id}
            onPress={() => !n.read && markRead.mutate(n._id)}
            style={[
              { flexDirection: 'row', gap: space.md, padding: space.md },
              !n.read && { borderColor: called ? colors.success : '#BFD3FD', backgroundColor: called ? colors.successSoft : '#F7FAFF' },
            ]}
          >
            <IconBox
              name={ICON[n.type] ?? 'notifications'}
              size={38}
              color={called ? colors.success : n.read ? colors.muted : colors.primary}
              bg={called ? '#D1FAE5' : n.read ? '#F1F5F9' : colors.primarySoft}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[font.h3, { flex: 1 }]}>{n.title}</Text>
                {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
              </View>
              <Text style={font.body}>{n.message}</Text>
              <Text style={font.tiny}>{timeAgo(n.createdAt)}</Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
