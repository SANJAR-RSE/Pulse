import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-store';
import { GoogleCancelled, googleClientId, signInWithGoogleBrowser } from '@/lib/google-auth';
import { colors, font, radius, space } from '@/theme';

// "Google bilan kirish" for the phone app. Hidden in the web preview build
// (the real website has its own Google button) and when the server has no
// Google client configured.
export function GoogleButton({ label, onSignedIn, disabled }: { label: string; onSignedIn: () => void; disabled?: boolean }) {
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const toast = useToast();
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    // A cold server answers late — keep the button until it says "not configured".
    googleClientId()
      .then((id) => alive && setEnabled(!!id))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (Platform.OS === 'web' || !enabled) return null;

  const press = async () => {
    setBusy(true);
    try {
      const { credential, nonce } = await signInWithGoogleBrowser();
      await loginWithGoogle(credential, nonce);
      onSignedIn();
    } catch (err) {
      if (!(err instanceof GoogleCancelled)) toast({ type: 'error', title: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={font.tiny}>YOKI</Text>
        <View style={styles.line} />
      </View>
      <Pressable
        onPress={press}
        disabled={busy || disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.bg }, (busy || disabled) && { opacity: 0.6 }]}
      >
        {busy ? <ActivityIndicator color={colors.text} /> : <Image source={require('../../assets/images/google-g.png')} style={styles.logo} contentFit="contain" />}
        <Text style={styles.text}>{busy ? 'Google kutilmoqda…' : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  button: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  logo: { width: 20, height: 20 },
  text: { fontSize: 16, fontWeight: '600', color: colors.text },
});
