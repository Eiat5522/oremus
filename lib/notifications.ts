import * as Notifications from 'expo-notifications';

let notificationHandlerConfigured = false;

export function configureNotifications() {
  if (notificationHandlerConfigured) {
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
