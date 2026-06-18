"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryComparisonWorkspace } from "@/components/comparison/RepositoryComparisonWorkspace";

export default function ComparePage() {
  return (
    <AppShell>
      <PageContent>
        <RepositoryComparisonWorkspace />
      </PageContent>
    </AppShell>
  );
}