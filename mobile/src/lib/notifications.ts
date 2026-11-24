import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { AppState, Platform } from 'react-native';

// Phone-level notifications for the moments that matter (queue called /
// near). Inside the app an in-app banner is shown instead; the system
// notification is used only while the app is in the background.

const CHANNEL = 'pulse-queue';
let ready = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications() {
  if (ready) return;
  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Navbat va eslatmalar',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 300, 150, 300],
        lightColor: '#2570F4',
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();
    ready = true;
  } catch {
    // Notifications are a bonus; the app works fully without them.
  }
}

export async function notifyDevice(title: string, body: string, urgent = false) {
  try {
    if (urgent) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (AppState.currentState === 'active') return; // in-app banner covers it
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      // Immediate delivery; on Android routed through our high-priority channel.
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
    });
  } catch {
    /* never let a notification failure break the app */
  }
}
