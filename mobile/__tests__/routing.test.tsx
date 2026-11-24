/// <reference types="jest" />
import { screen } from '@testing-library/react-native';
import { Stack, Tabs } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { AppStack } from '@/components/app-stack';

// Mirrors the real route tree (src/app) with lightweight screens, wrapped by
// the REAL AppStack guard configuration.
function routes(signedIn: boolean) {
  const S = (label: string) => () => <Text>{label}</Text>;
  return {
    _layout: () => <AppStack signedIn={signedIn} />,
    '(auth)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
    '(auth)/login': S('LOGIN_SCREEN'),
    '(auth)/register': S('REGISTER_SCREEN'),
    // SDK 58 Tabs only show declared screens — declare them like the real layout.
    '(tabs)/_layout': () => (
      <Tabs>
        {['index', 'panel', 'doctors', 'appointments', 'ai', 'profile'].map((n) => (
          <Tabs.Screen key={n} name={n} />
        ))}
      </Tabs>
    ),
    '(tabs)/index': S('HOME_SCREEN'),
    '(tabs)/doctors': S('DOCTORS_SCREEN'),
    '(tabs)/appointments': S('APPOINTMENTS_SCREEN'),
    '(tabs)/ai': S('AI_SCREEN'),
    '(tabs)/panel': S('PANEL_SCREEN'),
    '(tabs)/profile': S('PROFILE_SCREEN'),
    'doctor/[id]': S('BOOK_SCREEN'),
    water: S('WATER'),
    sleep: S('SLEEP'),
    workout: S('WORKOUT'),
    medications: S('MEDICATIONS'),
    'medical-history': S('HISTORY'),
    notifications: S('NOTIFICATIONS'),
    statistics: S('STATS'),
    emergency: S('EMERGENCY'),
    clinics: S('CLINICS'),
  };
}

describe('first launch routing', () => {
  it('signed-out user opening the app lands on the login screen (not "page not found")', async () => {
    await renderRouter(routes(false), { initialUrl: '/' });
    expect(screen.getByText('LOGIN_SCREEN')).toBeTruthy();
    expect(screen).toHavePathname('/login');
  });

  it('signed-out user deep-linking to a protected screen is sent to login', async () => {
    await renderRouter(routes(false), { initialUrl: '/medications' });
    expect(screen.getByText('LOGIN_SCREEN')).toBeTruthy();
  });

  it('signed-in user opening the app lands on the dashboard', async () => {
    await renderRouter(routes(true), { initialUrl: '/' });
    expect(screen.getByText('HOME_SCREEN')).toBeTruthy();
    expect(screen).toHavePathname('/');
  });

  it('signed-in user cannot open the login screen', async () => {
    await renderRouter(routes(true), { initialUrl: '/login' });
    expect(screen.getByText('HOME_SCREEN')).toBeTruthy();
  });
});
