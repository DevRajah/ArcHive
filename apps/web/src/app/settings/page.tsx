"use client";

import {
  GitBranch,
  LogOut,
  PlugZap,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTrackedRepositories } from "@/hooks/useRepositories";
import { getApiBaseUrl } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { session, logout } = useAuth();

  const { data: repositories, isLoading } = useTrackedRepositories();

  const apiUrl = getApiBaseUrl();

  const username = session?.username || "Unknown user";
  const avatarUrl = session?.avatarUrl;
  const trackedRepositoryCount = repositories?.length ?? 0;

  function handleReconnectGithub() {
    window.location.href = `${apiUrl}/github/oauth/login`;
  }

  function handleLogout() {
    logout();
    router.replace("/connect-github");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your ArcHive workspace, GitHub connection, and account session."
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{username}</h2>
                  <Badge variant="secondary">GitHub Connected</Badge>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  ArcHive uses GitHub OAuth as the primary identity and
                  repository access provider.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">GitHub Account</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      @{username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">Authentication</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      OAuth session active
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <PlugZap className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">Tracked Repositories</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isLoading
                        ? "Loading..."
                        : `${trackedRepositoryCount} repositories connected`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <RefreshCcw className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">Connection Health</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready for repository intelligence sync
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleReconnectGithub}>
                <GitBranch className="mr-2 h-4 w-4" />
                Reconnect GitHub
              </Button>

              <Button variant="outline" onClick={() => router.push("/repositories")}>
                Manage Repositories
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Session Management</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Logging out clears the local ArcHive session from this browser.
              Your GitHub authorization remains managed by GitHub and can be
              reconnected at any time.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Current session</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as @{username}
              </p>
            </div>

            <Button variant="destructive" className="mt-6" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Engineering Workspace</h2>

          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            ArcHive continuously turns GitHub repository activity into
            engineering memory, architecture history, timeline intelligence,
            and realtime operational visibility.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Repository Intelligence</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Track repository activity and engineering changes.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Architecture Memory</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Detect architecture-level evolution across time.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Realtime Monitoring</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor webhook ingestion, queue processing, and live updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}