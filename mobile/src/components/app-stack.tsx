import { Stack } from 'expo-router';
import { colors } from '@/theme';

const screen = (title: string) => ({
  title,
  headerShown: true,
  headerBackTitle: 'Orqaga',
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
});

// The app's route guard. Explicit `redirectTo` on both guards is required:
// without it a signed-out user is "redirected" to the pathless (auth) group
// itself, which has no index route -> "page not found" on first launch.
export function AppStack({ signedIn }: { signedIn: boolean }) {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="doctor/[id]" options={screen('Navbat olish')} />
        <Stack.Screen name="water" options={screen('Suv')} />
        <Stack.Screen name="sleep" options={screen('Uyqu')} />
        <Stack.Screen name="workout" options={screen('Workout')} />
        <Stack.Screen name="medications" options={screen('Dorilar')} />
        <Stack.Screen name="medical-history" options={screen('Tibbiy tarix')} />
        <Stack.Screen name="notifications" options={screen('Bildirishnomalar')} />
        <Stack.Screen name="statistics" options={screen('Statistika')} />
        <Stack.Screen name="emergency" options={screen('Favqulodda yordam')} />
        <Stack.Screen name="clinics" options={screen('Klinikalar')} />
      </Stack.Protected>
    </Stack>
  );
}
