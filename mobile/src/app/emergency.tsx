import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useEmergencyContacts } from '@/lib/queries';
import { colors, font, radius, space } from '@/theme';

const call = (phone: string) => Linking.openURL(`tel:${phone}`);

export default function EmergencyScreen() {
  const { data, isLoading, isError, refetch } = useEmergencyContacts();
  return (
    <Screen>
      {/* The one action that must be reachable in a single tap. */}
      <Pressable onPress={() => call('103')} style={({ pressed }) => [styles.sos, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]} accessibilityRole="button" accessibilityLabel="103 ga qo'ng'iroq qilish">
        <Ionicons name="call" size={30} color={colors.white} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sosTitle}>103 — Tez tibbiy yordam</Text>
          <Text style={styles.sosText}>Bosing va darhol qo'ng'iroq qiling</Text>
        </View>
      </Pressable>

      <Card style={{ backgroundColor: colors.warningSoft, borderColor: '#FDE68A' }}>
        <Text style={[font.body, { color: colors.text }]}>
          PULSE favqulodda holatda tashxis qo'ymaydi. Hayot uchun xavfli belgilar bo'lsa (ko'krak og'rig'i, nafas qisishi, hushdan ketish), darhol professional yordam chaqiring.
        </Text>
      </Card>

      <Text style={font.h3}>Favqulodda kontaktlar</Text>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.contacts.length === 0 && <EmptyState icon="call-outline" />}
      {data?.contacts.map((c) => (
        <Card key={`${c.name}-${c.phone}`} onPress={() => call(c.phone)} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={font.h3}>{c.name}</Text>
            <Text style={font.small}>{c.description}</Text>
          </View>
          <View style={styles.phone}>
            <Ionicons name="call" size={16} color={colors.white} />
            <Text style={styles.phoneText}>{c.phone}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sos: { flexDirection: 'row', alignItems: 'center', gap: space.lg, backgroundColor: colors.danger, borderRadius: radius.xl, padding: space.xl },
  sosTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  sosText: { color: '#FEE2E2', fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  phoneText: { color: colors.white, fontWeight: '700' },
});
