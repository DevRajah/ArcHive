"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  const { session } = useAuth();

  const displayName = session?.username || "Michael";

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex w-[320px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            placeholder="Search repositories..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session?.avatarUrl} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                Engineering Workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}