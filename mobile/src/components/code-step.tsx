import { Ionicons } from '@expo/vector-icons';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth, type CodeChallenge } from '@/lib/auth-store';
import { colors, font, radius, space } from '@/theme';

// "Emailingizga kod yubordik" — 6 digits, auto-submits when complete.
export function CodeStep({ challenge, onVerified, onBack }: { challenge: CodeChallenge; onVerified: () => void; onBack: () => void }) {
  const verifyCode = useAuth((s) => s.verifyCode);
  const resendCode = useAuth((s) => s.resendCode);
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendLeft, setResendLeft] = useState(challenge.resendIn);
  const tried = useRef<string | null>(null);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendLeft]);

  const submit = async (value: string) => {
    if (busy || value.length !== 6) return;
    tried.current = value;
    setBusy(true);
    setError(null);
    try {
      await verifyCode(challenge.challengeId, value);
      onVerified();
    } catch (err) {
      setError((err as Error).message);
      setCode('');
      input.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (code.length === 6 && tried.current !== code) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    try {
      await resendCode(challenge.challengeId);
      setResendLeft(challenge.resendIn);
      setError(null);
      toast({ type: 'success', title: 'Yangi kod emailingizga yuborildi.' });
    } catch (err) {
      toast({ type: 'error', title: (err as Error).message });
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.note}>
        <Ionicons name="mail-open-outline" size={20} color={colors.primary} />
        <Text style={[font.body, { flex: 1 }]}>
          <Text style={{ fontWeight: '700' }}>{challenge.email}</Text> manziliga 6 xonali kod yubordik. Kod 10 daqiqa amal qiladi.
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={styles.label}>Tasdiqlash kodi</Text>
        <TextInput
          ref={input}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="••••••"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Tasdiqlash kodi"
          style={[styles.code, error && { borderColor: colors.danger }]}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <Button title="Tasdiqlash" size="lg" loading={busy} disabled={busy || code.length !== 6} onPress={() => { tried.current = null; void submit(code); }} />

      <View style={styles.row}>
        <Pressable onPress={onBack} accessibilityRole="button" style={styles.link}>
          <Ionicons name="arrow-back" size={16} color={colors.muted} />
          <Text style={font.small}>Orqaga</Text>
        </Pressable>
        {resendLeft > 0 ? (
          <Text style={font.small}>Qayta yuborish: {resendLeft} s</Text>
        ) : (
          <Pressable onPress={resend} accessibilityRole="button">
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Kodni qayta yuborish</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  code: {
    height: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: '700',
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
