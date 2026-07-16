"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { PortfolioIntelligenceWorkspace } from "@/components/portfolio/PortfolioIntelligenceWorkspace";
import { PortfolioNavigation } from "@/components/portfolio/PortfolioNavigation";

export default function PortfolioPage() {
  return (
    <AppShell>
      <PageContent>
        <PortfolioNavigation />
        <PortfolioIntelligenceWorkspace />
      </PageContent>
    </AppShell>
  );
}