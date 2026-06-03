"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { CommandSearch } from "@/components/search/CommandSearch";

export function Topbar() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const displayName = session?.username || "User";

  function handleLogout() {
    logout();
    router.replace("/connect-github");
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMacShortcut = event.metaKey && event.key.toLowerCase() === "k";
      const isWindowsShortcut =
        event.ctrlKey && event.key.toLowerCase() === "k";

      if (isMacShortcut || isWindowsShortcut) {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />

            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden w-[320px] items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search workspace...
              </span>

              <span className="rounded border border-border px-1.5 py-0.5 text-[10px]">
                Ctrl K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
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

              <div className="hidden sm:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Engineering Workspace
                </p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <CommandSearch open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  );
}