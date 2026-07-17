"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { UserActivityWorkspace } from "@/components/activity/UserActivityWorkspace";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

export default function PortfolioTimelinePage() {
  return (
    <AppShell>
      <PageContent>
        <PortfolioNavigation />

        <UserActivityWorkspace
          title="Portfolio Timeline"
          description="A chronological view of engineering events, timeline entries, architecture changes, and recommendations across your portfolio."
        />
      </PageContent>
    </AppShell>
  );
}