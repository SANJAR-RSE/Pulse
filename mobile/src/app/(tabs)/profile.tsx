import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, Card, Row, Screen } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { initials } from '@/lib/format';
import { useMe, useTelegramLinkCode } from '@/lib/queries';
import { colors, font, space } from '@/theme';

const ROLE: Record<string, string> = { patient: 'Bemor', doctor: 'Shifokor', admin: 'Administrator' };

export default function ProfileScreen() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const me = useMe(); // keeps "Telegram ulangan" fresh (also pushed live)
  const link = useTelegramLinkCode();
  const toast = useToast();
  const linked = me.data?.telegramLinked ?? user?.telegramLinked;

  const connectTelegram = async () => {
    try {
      const { deepLink } = await link.mutateAsync();
      await Linking.openURL(deepLink);
      toast({ type: 'info', title: 'Telegramda "Start" ni bosing', message: "Ulangach, bu yerda o'zi yangilanadi." });
    } catch (e) {
      toast({ type: 'error', title: errorMessage(e, "Telegram havolasini olib bo'lmadi.") });
    }
  };

  const confirmLogout = () => confirmAction('Hisobdan chiqish', 'Rostdan ham chiqmoqchimisiz?', 'Chiqish', () => void logout());

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen onRefresh={() => me.refetch()} refreshing={me.isRefetching}>
        <Text style={font.h1}>Profil</Text>

        <Card style={styles.userCard}>
          <Avatar text={initials(user?.name)} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={font.h2}>{user?.name}</Text>
            <Text style={font.small}>{user?.email}</Text>
            <Badge label={ROLE[user?.role ?? 'patient']} icon="shield-checkmark" />
          </View>
        </Card>

        <Card>
          <View style={styles.tgHead}>
            <View style={styles.tgIcon}>
              <Ionicons name="paper-plane" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>Telegram bot</Text>
              <Text style={font.small}>Navbat, dori va eslatmalarni Telegramda ham oling.</Text>
            </View>
          </View>
          {linked ? (
            <View style={styles.linked}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={{ color: colors.success, fontWeight: '600' }}>Telegram ulangan</Text>
            </View>
          ) : (
            <Button title="Telegramni ulash" icon="paper-plane" variant="soft" style={{ marginTop: space.md }} loading={link.isPending} onPress={connectTelegram} />
          )}
        </Card>

        <Card style={{ paddingVertical: space.xs }}>
          {user?.role === 'doctor' && <Row icon="clipboard" title="Navbat paneli" onPress={() => router.navigate('/panel')} />}
          <Row icon="document-text" title="Tibbiy tarix" subtitle="Ko'riklar va tahlillar" onPress={() => router.push('/medical-history')} />
          <Row icon="notifications" title="Bildirishnomalar" onPress={() => router.push('/notifications')} />
          <Row icon="stats-chart" title="Statistika" subtitle="Oxirgi 7 kun" onPress={() => router.push('/statistics')} />
          <Row icon="medkit" title="Dorilar" onPress={() => router.push('/medications')} />
          <Row icon="business" title="Klinikalar" onPress={() => router.push('/clinics')} />
          <Row icon="alert-circle" title="Favqulodda yordam" danger onPress={() => router.push('/emergency')} />
        </Card>

        <Card style={{ paddingVertical: space.xs }}>
          <Row icon="log-out-outline" title="Hisobdan chiqish" danger onPress={confirmLogout} />
        </Card>

        <Text style={[font.tiny, { textAlign: 'center' }]}>PULSE v{Constants.expoConfig?.version ?? '1.0.0'} · Your health. One pulse.</Text>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userCard: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  tgHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tgIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#229ED9', alignItems: 'center', justifyContent: 'center' },
  linked: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
});
