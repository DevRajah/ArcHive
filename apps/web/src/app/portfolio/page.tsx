"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioIntelligenceWorkspace } from "@/components/portfolio/PortfolioIntelligenceWorkspace";

export default function PortfolioPage() {
  return (
    <AppShell>
      <PageContent>
        <PortfolioIntelligenceWorkspace />
      </PageContent>
    </AppShell>
  );
}