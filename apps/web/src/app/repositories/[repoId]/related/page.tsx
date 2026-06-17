"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Network } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RelatedEngineeringRepositories } from "@/components/repositories/RelatedEngineeringRepositories";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRelatedRepositories } from "@/hooks/useRepositories";

export default function RelatedRepositoriesPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const { data, isLoading, isError, error } = useRelatedRepositories(repoId);

  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Network className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Related Engineering Repositories
              </h1>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Explore repositories with similar engineering signals,
                technologies, architecture domains, and repository types.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {isLoading && <Skeleton className="h-80 rounded-xl" />}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load related repositories
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Please check backend."}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <RelatedEngineeringRepositories
            data={data}
            isLoading={isLoading}
          />
        )}
      </div>
    </AppShell>
  );
}