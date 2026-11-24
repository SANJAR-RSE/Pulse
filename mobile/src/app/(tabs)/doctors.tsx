import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Card, Chip, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { initials } from '@/lib/format';
import { useDepartments, useDoctors } from '@/lib/queries';
import { colors, font, space } from '@/theme';

export default function DoctorsScreen() {
  // PULSE AI can deep-link here with ?department=<id>
  const params = useLocalSearchParams<{ department?: string }>();
  const [picked, setPicked] = useState<string | undefined>(undefined);
  const department = picked ?? params.department;
  const departments = useDepartments();
  const doctors = useDoctors(department || undefined);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.head}>
        <Text style={font.h1}>Shifokorlar</Text>
        <Text style={font.small}>Bo'lim bo'yicha toping va navbat oling.</Text>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Barchasi" active={!department} onPress={() => setPicked('')} />
          {departments.data?.departments.map((d) => (
            <Chip key={d._id} label={d.name} active={department === d._id} onPress={() => setPicked(d._id)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={doctors.data?.doctors ?? []}
        keyExtractor={(d) => d._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={doctors.isRefetching} onRefresh={() => { void doctors.refetch(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          doctors.isLoading ? (
            <LoadingState label="Shifokorlar yuklanmoqda..." />
          ) : doctors.isError ? (
            <ErrorState onRetry={() => doctors.refetch()} />
          ) : (
            <EmptyState icon="medkit-outline" description="Bu bo'lim bo'yicha shifokor topilmadi. Boshqa bo'limni tanlang." />
          )
        }
        renderItem={({ item: doc }) => (
          <Card onPress={() => router.push(`/doctor/${doc._id}`)}>
            <View style={styles.row}>
              <Avatar text={initials(`${doc.firstName} ${doc.lastName}`)} size={52} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={font.h3}>Dr. {doc.firstName} {doc.lastName}</Text>
                <Text style={font.small}>{doc.specialty}</Text>
                <View style={styles.meta}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.metaText}>{doc.rating.toFixed(1)}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{doc.experienceYears} yil tajriba</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
            <View style={[styles.row, { marginTop: space.md, gap: space.sm }]}>
              <Badge label={doc.department?.name ?? ''} />
              <View style={styles.meta}>
                <Ionicons name="business-outline" size={13} color={colors.muted} />
                <Text style={styles.metaText} numberOfLines={1}>{doc.clinic?.name}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: 2 },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { fontSize: 13, color: colors.muted },
  metaDot: { color: colors.muted },
});
