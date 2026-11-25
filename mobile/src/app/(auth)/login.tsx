import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { CodeStep } from '@/components/code-step';
import { GoogleButton } from '@/components/google-button';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth, type CodeChallenge } from '@/lib/auth-store';
import { colors, font, radius, space } from '@/theme';

// Seeded demo accounts (backend/scripts/seedDatabase.js) — one tap for the jury demo.
const DEMO = [
  { label: 'Bemor', icon: '🧑', email: 'patient@pulse.demo' },
  { label: 'Shifokor', icon: '🩺', email: 'doctor@pulse.demo' },
];
const DEMO_PASSWORD = 'password123';

export default function LoginScreen() {
  const login = useAuth((s) => s.login);
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);

  const signIn = async (e: string, p: string, key: string) => {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(e.trim())) next.email = "Email noto'g'ri formatda.";
    if (!p) next.password = 'Parolni kiriting.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(key);
    try {
      const code = await login(e, p);
      if (code) setChallenge(code); // step 2: code from the email
      else toast({ type: 'success', title: 'Xush kelibsiz!' });
    } catch (err) {
      toast({ type: 'error', title: (err as Error).message });
    } finally {
      setLoading(null);
    }
  };

  if (challenge) {
    return (
      <AuthShell title="Emailni tasdiqlang" subtitle="Xavfsizlik uchun emailingizga kelgan kodni kiriting.">
        <CodeStep challenge={challenge} onBack={() => setChallenge(null)} onVerified={() => toast({ type: 'success', title: 'Xush kelibsiz!' })} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Kirish"
      subtitle="Hisobingizga kiring va sog'lig'ingizni kuzating."
      footer={
        <Text style={[font.small, { textAlign: 'center' }]}>
          Hisobingiz yo'qmi?{' '}
          <Link href="/register" style={{ color: colors.primary, fontWeight: '700' }}>
            Ro'yxatdan o'tish
          </Link>
        </Text>
      }
    >
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="siz@gmail.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" error={errors.email} />
      <Input label="Parol" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoComplete="password" error={errors.password} onSubmitEditing={() => signIn(email, password, 'form')} />
      <Button title="Tizimga kirish" size="lg" loading={loading === 'form'} disabled={!!loading} onPress={() => signIn(email, password, 'form')} />
      <GoogleButton label="Google bilan kirish" disabled={!!loading} onSignedIn={() => toast({ type: 'success', title: 'Xush kelibsiz!' })} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={font.tiny}>DEMO HISOBLAR (KODSIZ)</Text>
        <View style={styles.line} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {DEMO.map((d) => (
          <Pressable
            key={d.email}
            disabled={!!loading}
            onPress={() => signIn(d.email, DEMO_PASSWORD, d.email)}
            style={({ pressed }) => [styles.demo, pressed && { backgroundColor: colors.primarySoft }]}
            accessibilityRole="button"
            accessibilityLabel={`${d.label} sifatida kirish`}
          >
            <Text style={{ fontSize: 22 }}>{d.icon}</Text>
            <Text style={styles.demoTitle}>{loading === d.email ? 'Kirilmoqda…' : `${d.label} sifatida`}</Text>
            <Text style={font.tiny}>{d.email}</Text>
          </Pressable>
        ))}
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  demo: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  demoTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
});
