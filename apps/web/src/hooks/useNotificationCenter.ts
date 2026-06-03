"use client";

import { create } from "zustand";
import { LiveNotification } from "@/types/live-event.types";

interface NotificationCenterState {
  notifications: LiveNotification[];
  unreadCount: number;
  addNotification: (notification: LiveNotification) => void;
  dismissNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationCenter = create<NotificationCenterState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    set((state) => {
      const withoutDuplicate = state.notifications.filter(
        (item) => item.id !== notification.id
      );

      return {
        notifications: [notification, ...withoutDuplicate].slice(0, 20),
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      ),
    }));
  },

  markAllAsRead: () => {
    set({
      unreadCount: 0,
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));