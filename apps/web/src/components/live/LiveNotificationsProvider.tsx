"use client";

import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { LiveNotificationStack } from "./LiveNotificationStack";

export function LiveNotificationsProvider() {
  const { notifications, dismissNotification } = useLiveNotifications();

  return (
    <LiveNotificationStack
      notifications={notifications}
      onDismiss={dismissNotification}
    />
  );
}