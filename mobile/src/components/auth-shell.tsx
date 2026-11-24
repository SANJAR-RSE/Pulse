import { Image } from 'expo-image';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, space } from '@/theme';

// Shared frame for login/register: logo, title, card, footer.
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require('../../assets/images/logo-round.png')} style={styles.logo} contentFit="contain" accessibilityLabel="PULSE logotipi" />
            <Text style={styles.wordmark}>PULSE</Text>
            <Text style={[font.small, { textAlign: 'center' }]}>Your health. One pulse.</Text>
          </View>
          <View style={styles.card}>
            <Text style={font.h2}>{title}</Text>
            <Text style={[font.small, { marginTop: 2, marginBottom: space.lg }]}>{subtitle}</Text>
            <View style={{ gap: space.lg }}>{children}</View>
          </View>
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: space.xl, gap: space.xl },
  brand: { alignItems: 'center', gap: space.xs },
  logo: { width: 76, height: 76, marginBottom: space.sm },
  wordmark: { fontSize: 28, fontWeight: '800', letterSpacing: 2, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: space.xl, borderWidth: 1, borderColor: colors.border, ...shadow },
});
