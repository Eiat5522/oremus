import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let notificationHandlerConfigured = false;
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

export async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }

  return notificationsModulePromise;
}

export async function configureNotifications() {
  if (notificationHandlerConfigured) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerConfigured = true;
}
