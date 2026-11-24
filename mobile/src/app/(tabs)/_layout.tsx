import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useAuth } from '@/lib/auth-store';
import { useDashboard } from '@/lib/queries';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName, active: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : name} size={24} color={color as string} />;
  };

export default function TabsLayout() {
  const isDoctor = useAuth((s) => s.user?.role === 'doctor');
  // A "!" on Navbatlarim the moment the patient is called (pushed live).
  const { data } = useDashboard();
  const called = data?.queue?.status === 'CALLED';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.card },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* index first: it is the initial tab for everyone; doctors are sent
          to the panel once on sign-in (see index.tsx). */}
      <Tabs.Screen name="index" options={{ title: 'Bosh sahifa', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen
        name="panel"
        options={{ title: 'Navbat paneli', tabBarIcon: icon('clipboard-outline', 'clipboard'), href: isDoctor ? undefined : null }}
      />
      <Tabs.Screen
        name="doctors"
        options={{ title: 'Shifokorlar', tabBarIcon: icon('medkit-outline', 'medkit'), href: isDoctor ? null : undefined }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Navbatlarim',
          tabBarIcon: icon('calendar-outline', 'calendar'),
          href: isDoctor ? null : undefined,
          tabBarBadge: called ? '!' : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.success },
        }}
      />
      <Tabs.Screen name="ai" options={{ title: 'PULSE AI', tabBarIcon: icon('sparkles-outline', 'sparkles') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}
