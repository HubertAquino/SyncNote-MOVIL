import * as Notifications from 'expo-notifications';

export async function scheduleReminder(taskId: string, title: string, body: string, when: Date) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { taskId } },
    // SDK 54: usar DateTriggerInput con enum de tipos
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
