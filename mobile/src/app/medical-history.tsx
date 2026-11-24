import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { prettyDate } from '@/lib/format';
import { useMedicalRecords } from '@/lib/queries';
import { colors, font, radius, space } from '@/theme';

// Timeline of the patient's own examinations (scoped server-side to the user).
export default function MedicalHistoryScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMedicalRecords();
  const records = data?.records ?? [];

  return (
    <Screen onRefresh={() => refetch()} refreshing={isRefetching}>
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && records.length === 0 && (
        <EmptyState
          icon="document-text-outline"
          description="Shifokor ko'rigi yakunlangach, tibbiy yozuvlaringiz shu yerda paydo bo'ladi."
          actionLabel="Shifokorni tanlash"
          onAction={() => router.push('/doctors')}
        />
      )}
      {records.map((r, i) => (
        <View key={r._id} style={styles.item}>
          <View style={styles.rail}>
            <View style={styles.dot} />
            {i < records.length - 1 && <View style={styles.line} />}
          </View>
          <Card style={{ flex: 1, gap: space.md }}>
            <View style={styles.head}>
              <Text style={font.h3}>{prettyDate(r.date)}</Text>
              <Text style={styles.dept}>{r.department?.name}</Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="person-outline" size={14} color={colors.muted} />
              <Text style={font.small}>Dr. {r.doctor?.firstName} {r.doctor?.lastName}</Text>
              <Ionicons name="business-outline" size={14} color={colors.muted} style={{ marginLeft: 6 }} />
              <Text style={font.small} numberOfLines={1}>{r.clinic?.name}</Text>
            </View>
            {!!r.examination && <Block title="Ko'rik xulosasi" text={r.examination} />}
            {!!r.recommendation && <Block title="Tavsiya" text={r.recommendation} />}
            {r.labResults.length > 0 && (
              <View style={{ gap: 6 }}>
                <Text style={styles.blockTitle}>Laboratoriya natijalari</Text>
                <View style={styles.table}>
                  {r.labResults.map((l, idx) => (
                    <View key={idx} style={[styles.tr, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <Text style={[styles.td, { flex: 1.3, fontWeight: '600' }]}>{l.name}</Text>
                      <Text style={[styles.td, { flex: 1 }]}>{l.value} {l.unit}</Text>
                      <Text style={[styles.td, { flex: 1, color: colors.muted }]}>{l.normalRange || '—'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={font.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: space.md },
  rail: { width: 14, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 20, borderWidth: 2, borderColor: colors.primarySoft },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4, marginBottom: -space.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dept: { fontSize: 12, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  blockTitle: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  tr: { flexDirection: 'row', paddingHorizontal: space.md, paddingVertical: 8 },
  td: { fontSize: 13, color: colors.text },
});
