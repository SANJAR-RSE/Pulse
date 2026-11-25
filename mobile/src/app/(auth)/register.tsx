import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { CodeStep } from '@/components/code-step';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth, type CodeChallenge } from '@/lib/auth-store';
import { colors, font } from '@/theme';

export default function RegisterScreen() {
  const register = useAuth((s) => s.register);
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);

  const submit = async () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Ism kamida 2 belgidan iborat bo'lsin.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Email noto'g'ri formatda.";
    if (password.length < 6) next.password = "Parol kamida 6 belgidan iborat bo'lsin.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const code = await register(name, email, password);
      if (code) setChallenge(code); // account is created only after the emailed code
      else toast({ type: 'success', title: "Ro'yxatdan muvaffaqiyatli o'tdingiz!" });
    } catch (err) {
      toast({ type: 'error', title: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (challenge) {
    return (
      <AuthShell title="Emailni tasdiqlang" subtitle="Hisob emailingizga kelgan kod tasdiqlangach yaratiladi.">
        <CodeStep challenge={challenge} onBack={() => setChallenge(null)} onVerified={() => toast({ type: 'success', title: "Ro'yxatdan muvaffaqiyatli o'tdingiz!" })} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Ro'yxatdan o'tish"
      subtitle="Yangi hisob yarating — bir necha soniyada."
      footer={
        <Text style={[font.small, { textAlign: 'center' }]}>
          Hisobingiz bormi?{' '}
          <Link href="/login" style={{ color: colors.primary, fontWeight: '700' }}>
            Tizimga kirish
          </Link>
        </Text>
      }
    >
      <Input label="Ism" value={name} onChangeText={setName} placeholder="Sanjar Aliyev" autoComplete="name" error={errors.name} />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="siz@gmail.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
      <Input label="Parol" value={password} onChangeText={setPassword} placeholder="Kamida 6 belgi" secureTextEntry autoComplete="new-password" error={errors.password} onSubmitEditing={submit} />
      <Button title="Hisob yaratish" size="lg" onPress={submit} loading={loading} />
    </AuthShell>
  );
}
