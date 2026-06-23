"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Brain, FileSearch, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { InsightList } from "@/components/intelligence-v2/InsightList";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryIntelligenceReport } from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";
import {
  getPrimaryRepositoryType,
  getPurposeDescription,
  getPurposeTitle,
} from "@/lib/repository-purpose";

type RepositoryPurposeReport = {
  repository?: {
    id?: string;
    name?: string;
    fullName?: string;
  };

  repositoryIntelligence?: {
    identity?: {
      primaryRepositoryType?: string | null;
      repositoryTypes?: string[];
      repositoryPersona?: string;
      repositoryDNA?: {
        engineeringProfile?: string;
        strongestCapabilities?: string[];
        dominantTechnologies?: string[];
        dominantArchitecture?: string[];
      };
    };

    signals?: {
      technologies?: string[];
      architectureDomains?: string[];
      engineeringSignals?: string[];
      reasoningSignals?: string[];
    };
  };
};

export default function RepositoryPurposePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const { data, isLoading, isError, error } =
    useRepositoryIntelligenceReport(repoId);

  const report = data as RepositoryPurposeReport | undefined;

  const repository = report?.repository;
  const identity = report?.repositoryIntelligence?.identity;
  const signals = report?.repositoryIntelligence?.signals;

  const primaryRepositoryType = getPrimaryRepositoryType(identity);
  const repositoryTypes = identity?.repositoryTypes || [];
  const reasoningSignals = signals?.reasoningSignals || [];

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    console.log(identity?.primaryRepositoryType);
    console.log(identity?.repositoryTypes);
    console.log(signals?.reasoningSignals);
  }, [
    identity?.primaryRepositoryType,
    identity?.repositoryTypes,
    signals?.reasoningSignals,
  ]);

  return (
    <AppShell>
      <PageContent>
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/repositories/${repoId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to repository overview
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Repository Purpose
                </h1>

                {repository?.fullName && (
                  <Badge variant="secondary">{repository.fullName}</Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                ArcHive explains what this repository fundamentally is using the
                backend canonical repository intelligence classification.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load repository purpose
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Primary Repository Purpose
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {getPurposeTitle(primaryRepositoryType)}
                  </h2>

                  <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
                    {getPurposeDescription(primaryRepositoryType)}
                  </p>

                  {primaryRepositoryType && (
                    <Badge className="mt-4">
                      {formatFilterLabel(primaryRepositoryType)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <IntelligenceSection
              title="Repository Types"
              description="Ordered by backend importance. The first type is treated as the strongest purpose signal when primaryRepositoryType is unavailable."
            >
              {repositoryTypes.length > 0 ? (
                <BadgeGroup items={repositoryTypes} />
              ) : (
                <Badge variant="outline">General Software Repository</Badge>
              )}
            </IntelligenceSection>

            <IntelligenceSection
              title="Repository Identity"
              description="Persona and DNA signals attached to the backend repository intelligence wrapper."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Repository Persona
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {identity?.repositoryPersona ||
                          "Repository persona pending"}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {identity?.repositoryDNA?.engineeringProfile ||
                          "ArcHive has not generated a detailed engineering profile for this repository yet."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Strongest Capabilities
                  </p>

                  <BadgeGroup
                    items={identity?.repositoryDNA?.strongestCapabilities}
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Why ArcHive Classified It This Way"
              description="These reasoning signals come directly from repositoryIntelligence.signals.reasoningSignals."
            >
              <InsightList
                items={reasoningSignals}
                empty="No reasoning signals available yet."
                limit={20}
              />
            </IntelligenceSection>

            <IntelligenceSection
              title="Supporting Signals"
              description="Secondary evidence only. These do not override the primary repository purpose."
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">Technologies</p>
                  <BadgeGroup
                    items={signals?.technologies}
                    variant="outline"
                    humanize={false}
                  />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Architecture Domains
                  </p>
                  <BadgeGroup items={signals?.architectureDomains} />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Engineering Signals
                  </p>
                  <BadgeGroup items={signals?.engineeringSignals} />
                </div>
              </div>
            </IntelligenceSection>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}