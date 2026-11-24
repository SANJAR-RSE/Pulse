import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppStack } from '@/components/app-stack';
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
            <AppStack signedIn={signedIn} />
          </RealtimeProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
