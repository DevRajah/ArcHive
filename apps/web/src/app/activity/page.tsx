"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { UserActivityWorkspace } from "@/components/activity/UserActivityWorkspace";

export default function ActivityPage() {
  return (
    <AppShell>
      <PageContent>
        <UserActivityWorkspace />
      </PageContent>
    </AppShell>
  );
}