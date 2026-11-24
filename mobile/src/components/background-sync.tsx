import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { syncMedicationReminders } from '@/lib/med-reminders';
import { setupNotifications } from '@/lib/notifications';
import { useMedications } from '@/lib/queries';

// Invisible helper mounted while signed in:
//  - keeps the phone's scheduled medication reminders in sync with the
//    medication list (added on Web, Telegram or here; taken today or not)
//  - opens the right screen when a notification is tapped
export function BackgroundSync() {
  const meds = useMedications();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!meds.data) return;
    const list = meds.data.medications;
    void setupNotifications().then(() => syncMedicationReminders(list));
  }, [meds.data]);

  useEffect(() => {
    if (!lastResponse || lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const route = lastResponse.notification.request.content.data?.route;
    if (typeof route === 'string' && route.startsWith('/')) {
      router.push(route as never);
      void Notifications.clearLastNotificationResponseAsync();
    }
  }, [lastResponse]);

  return null;
}
