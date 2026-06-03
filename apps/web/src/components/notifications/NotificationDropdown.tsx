"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";

function formatTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString();
}

export function NotificationDropdown() {
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
  } = useNotificationCenter();

  function handleOpenRepository(repositoryId?: string) {
    if (!repositoryId) return;

    markAllAsRead();
    router.push(`/repositories/${repositoryId}`);
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllAsRead()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold">Engineering Notifications</h3>
            <p className="text-xs text-muted-foreground">
              Recent realtime ArcHive activity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={clearAll}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {notifications.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live engineering events will appear here.
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleOpenRepository(notification.repositoryId)}
                className="block w-full border-b border-border p-4 text-left last:border-0 hover:bg-accent"
              >
                <p className="text-sm font-medium">{notification.title}</p>

                {notification.repositoryFullName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {notification.repositoryFullName}
                  </p>
                )}

                {notification.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatTime(notification.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}