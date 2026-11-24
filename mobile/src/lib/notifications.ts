import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { AppState, Platform } from 'react-native';

// Phone-level notifications for the moments that matter (queue called /
// near, medication time). Inside the app an in-app banner is shown instead;
// the system notification is for when the app is in the background/closed.

const QUEUE_CHANNEL = 'pulse-queue';
export const MED_CHANNEL = 'pulse-medication';
let ready = false;

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // A scheduled medication reminder firing while the app is open: the
    // live in-app banner (with "Ichdim") already covers it — no duplicate.
    const isMed = notification.request.identifier.startsWith('pulse-med-');
    const foreground = AppState.currentState === 'active';
    const show = !(isMed && foreground);
    return { shouldPlaySound: show, shouldSetBadge: false, shouldShowBanner: show, shouldShowList: true };
  },
});

export async function setupNotifications() {
  if (ready) return;
  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(QUEUE_CHANNEL, {
        name: 'Navbat',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 300, 150, 300],
        lightColor: '#2570F4',
      });
      await Notifications.setNotificationChannelAsync(MED_CHANNEL, {
        name: 'Dori eslatmalari',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
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
      // Immediate delivery; on Android routed through the high-priority channel.
      trigger: Platform.OS === 'android' ? { channelId: QUEUE_CHANNEL } : null,
    });
  } catch {
    /* never let a notification failure break the app */
  }
}
