"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { LiveNotification } from "@/types/live-event.types";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function createNotification(
  type: LiveNotification["type"],
  payload: Record<string, unknown>
): LiveNotification {
  const repositoryFullName = getStringValue(payload.repositoryFullName);
  const summary = getStringValue(payload.summary);

  return {
    id:
      getStringValue(payload.eventId) ||
      getStringValue(payload.architectureChangeId) ||
      getStringValue(payload.jobId) ||
      crypto.randomUUID(),

    type,
    title: getStringValue(payload.title) || "Engineering Activity",
    description: summary || repositoryFullName,
    repositoryId: getStringValue(payload.repositoryId),
    repositoryFullName,
    createdAt: getStringValue(payload.createdAt) || new Date().toISOString(),
  };
}

export function useLiveNotifications() {
  const [toastNotifications, setToastNotifications] = useState<
    LiveNotification[]
  >([]);

  const addToNotificationCenter = useNotificationCenter(
    (state) => state.addNotification
  );

  const dismissNotification = useCallback((id: string) => {
    setToastNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (notification: LiveNotification) => {
      addToNotificationCenter(notification);

      setToastNotifications((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.id !== notification.id
        );

        return [notification, ...withoutDuplicate].slice(0, 5);
      });

      setTimeout(() => {
        dismissNotification(notification.id);
      }, 5000);
    },
    [addToNotificationCenter, dismissNotification]
  );

  useEffect(() => {
    function handleEngineeringEvent(payload: Record<string, unknown>) {
      addNotification(
        createNotification("engineering-event:processed", payload)
      );
    }

    function handleArchitectureChange(payload: Record<string, unknown>) {
      addNotification(
        createNotification("architecture-change:detected", payload)
      );
    }

    function handleQueueJob(payload: Record<string, unknown>) {
      addNotification(createNotification("queue-job:completed", payload));
    }

    function handleRepositoryUpdate(payload: Record<string, unknown>) {
      addNotification(createNotification("repository:updated", payload));
    }

    socket.on("engineering-event:processed", handleEngineeringEvent);
    socket.on("architecture-change:detected", handleArchitectureChange);
    socket.on("queue-job:completed", handleQueueJob);
    socket.on("repository:updated", handleRepositoryUpdate);

    return () => {
      socket.off("engineering-event:processed", handleEngineeringEvent);
      socket.off("architecture-change:detected", handleArchitectureChange);
      socket.off("queue-job:completed", handleQueueJob);
      socket.off("repository:updated", handleRepositoryUpdate);
    };
  }, [addNotification]);

  return {
    notifications: toastNotifications,
    dismissNotification,
  };
}