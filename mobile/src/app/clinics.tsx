import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, IconBox, LoadingState, Screen } from '@/components/ui';
import { useClinics } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function ClinicsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useClinics();
  return (
    <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.clinics.length === 0 && <EmptyState icon="business-outline" />}
      {data?.clinics.map((c) => (
        <Card key={c._id} style={{ gap: space.sm }}>
          <View style={styles.row}>
            <IconBox name="business" />
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>{c.name}</Text>
              {!!c.description && <Text style={font.small}>{c.description}</Text>}
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={{ fontWeight: '700', color: colors.text }}>{c.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Info icon="location-outline" text={c.address} />
          <Info icon="time-outline" text={c.workingHours} />
          <Button title={c.phone} icon="call" variant="soft" size="sm" style={{ alignSelf: 'flex-start' }} onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)} />
        </Card>
      ))}
    </Screen>
  );
}

function Info({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={15} color={colors.muted} />
      <Text style={[font.small, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
