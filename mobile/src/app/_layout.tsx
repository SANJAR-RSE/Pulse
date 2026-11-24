import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackgroundSync } from '@/components/background-sync';
import { ToastProvider } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-store';
import { RealtimeProvider } from '@/lib/realtime';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.card, text: colors.text, border: colors.border },
};

const screen = (title: string) => ({
  title,
  headerShown: true,
  headerBackTitle: 'Orqaga',
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
});

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } })
  );
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  // Keep the splash up until we know whether a saved session is valid.
  if (status === 'loading') return null;
  const signedIn = status === 'authenticated';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <ToastProvider>
          <RealtimeProvider>
            <StatusBar style="dark" />
            {signedIn && <BackgroundSync />}
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={signedIn}>
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
          </RealtimeProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
