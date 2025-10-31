import * as Notifications from 'expo-notifications';

export async function scheduleReminder(taskId: string, title: string, body: string, when: Date) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { taskId } },
    trigger: when,
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
