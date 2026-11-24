import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, tashkentToday } from './format';
import { MED_CHANNEL } from './notifications';
import type { Medication } from './types';

// On-device medication reminders: scheduled on the phone itself, so they
// fire even when the app is closed or offline. The server also sends a
// reminder (Telegram + live) at the exact minute; this is the phone's own
// copy for the lock screen.
export const MED_PREFIX = 'pulse-med-';
const DAYS_AHEAD = 7;

let lastSignature = '';

export async function syncMedicationReminders(meds: Medication[]) {
  const today = tashkentToday();
  // Skip work when nothing relevant changed (called on every refetch).
  const signature = today + '|' + meds.map((m) => `${m._id}:${m.time}:${m.active}:${m.takenToday}`).sort().join(',');
  if (signature === lastSignature) return;
  lastSignature = signature;

  try {
    await cancelMedicationReminders();
    const now = Date.now();
    for (const med of meds) {
      if (!med.active) continue;
      for (let i = 0; i < DAYS_AHEAD; i++) {
        const date = addDays(today, i);
        if (i === 0 && med.takenToday) continue; // already taken today
        // Absolute instant for HH:mm in Tashkent, whatever the phone's zone.
        const when = new Date(`${date}T${med.time}:00+05:00`);
        if (when.getTime() <= now) continue;
        await Notifications.scheduleNotificationAsync({
          identifier: `${MED_PREFIX}${med._id}-${date}`,
          content: {
            title: '💊 Dori ichish vaqti',
            body: `${med.name} ichish vaqti keldi (${med.time}).`,
            sound: true,
            data: { route: '/medications', medicationId: med._id },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: when,
            ...(Platform.OS === 'android' ? { channelId: MED_CHANNEL } : {}),
          },
        });
      }
    }
  } catch {
    lastSignature = ''; // retry on the next sync
  }
}

export async function cancelMedicationReminders() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all.filter((n) => n.identifier.startsWith(MED_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch {
    /* nothing scheduled / not permitted */
  }
}

export function resetMedicationReminderCache() {
  lastSignature = '';
}
