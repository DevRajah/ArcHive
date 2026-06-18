"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";

import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { InsightList } from "@/components/intelligence-v2/InsightList";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { ScoreCard } from "@/components/intelligence-v2/ScoreCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useRepositoryCapabilities,
  useRepositoryIntelligenceReport,
} from "@/hooks/useRepositories";
import { formatFilterLabel } from "@/lib/filters";

type CapabilityReport = {
  repository?: {
    id?: string;
    name?: string;
    fullName?: string;
  };

  capabilities?: Record<string, boolean>;

  scores?: {
    architectureMaturityScore?: number;
    engineeringComplexityScore?: number;
    infrastructureDepth?: string;
  };

  detectedDomains?: string[];
  detectedTechnologies?: string[];
  detectedRepositoryTypes?: string[];
  repositoryTypes?: string[];

  repositoryPurpose?: {
    purposeType?: string;
    label?: string;
    description?: string;
  } | null;

  reasoningSignals?: string[];
};

type CanonicalIntelligenceReport = {
  repository?: {
    id?: string;
    name?: string;
    fullName?: string;
  };

  summary?: {
    primaryRepositoryType?: string;
    persona?: string;
    healthStatus?: string;
    healthScore?: number;
    maturityLevel?: string;
    maturityScore?: number;
    productionReadinessLevel?: string;
    productionReadinessScore?: number;
    engineeringQualityScore?: number;
  };

  repositoryIntelligence?: {
    identity?: {
      repositoryTypes?: string[];
      repositoryPersona?: string;
      repositoryDNA?: {
        engineeringProfile?: string;
        maturityScore?: number;
        complexityScore?: number;
        confidenceScore?: number;
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
      capabilities?: Record<string, boolean>;
      evidenceResults?: string[];
    };

    assessment?: {
      engineeringQuality?: {
        score?: number;
        level?: string;
        summary?: string;
      };

      repositoryHealth?: {
        score?: number;
        status?: string;
        summary?: string;
      };

      productionReadiness?: {
        score?: number;
        level?: string;
        summary?: string;
      };

      repositoryMaturity?: {
        score?: number;
        level?: string;
        summary?: string;
      };
    };
  };
};

function getCapabilityEntries(capabilities?: Record<string, boolean>) {
  if (!capabilities) return [];

  return Object.entries(capabilities).map(([name, enabled]) => ({
    name,
    enabled,
  }));
}

function getCapabilityScore(capabilities?: Record<string, boolean>) {
  const entries = getCapabilityEntries(capabilities);

  if (entries.length === 0) return null;

  const enabledCount = entries.filter((item) => item.enabled).length;

  return Math.round((enabledCount / entries.length) * 100);
}

export default function RepositoryCapabilitiesPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const {
    data: capabilityData,
    isLoading: isCapabilityLoading,
    isError: isCapabilityError,
    error: capabilityError,
  } = useRepositoryCapabilities(repoId);

  const {
    data: intelligenceData,
    isLoading: isIntelligenceLoading,
  } = useRepositoryIntelligenceReport(repoId);

  const capabilityReport = capabilityData as CapabilityReport | undefined;
  const intelligenceReport = intelligenceData as
    | CanonicalIntelligenceReport
    | undefined;

  const repository =
    intelligenceReport?.repository || capabilityReport?.repository;

  const intelligence = intelligenceReport?.repositoryIntelligence;
  const identity = intelligence?.identity;
  const dna = identity?.repositoryDNA;
  const signals = intelligence?.signals;
  const assessment = intelligence?.assessment;

  const capabilities =
    signals?.capabilities || capabilityReport?.capabilities || {};

  const capabilityEntries = useMemo(
    () => getCapabilityEntries(capabilities),
    [capabilities]
  );

  const enabledCapabilities = capabilityEntries
    .filter((item) => item.enabled)
    .map((item) => item.name);

  const missingCapabilities = capabilityEntries
    .filter((item) => !item.enabled)
    .map((item) => item.name);

  const capabilityScore = getCapabilityScore(capabilities);

  const technologies =
    signals?.technologies || capabilityReport?.detectedTechnologies || [];

  const architectureDomains =
    signals?.architectureDomains || capabilityReport?.detectedDomains || [];

  const repositoryTypes =
    identity?.repositoryTypes ||
    capabilityReport?.detectedRepositoryTypes ||
    capabilityReport?.repositoryTypes ||
    [];

  const reasoningSignals =
    signals?.reasoningSignals || capabilityReport?.reasoningSignals || [];

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
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Capability Intelligence
                </h1>

                {repository?.fullName && (
                  <Badge variant="secondary">{repository.fullName}</Badge>
                )}

                {intelligenceReport?.summary?.primaryRepositoryType && (
                  <Badge>
                    {formatFilterLabel(
                      intelligenceReport.summary.primaryRepositoryType
                    )}
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Engineering capability scorecard showing enabled capabilities,
                missing signals, architecture domains, technologies, and
                repository maturity context.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {(isCapabilityLoading || isIntelligenceLoading) && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>

            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {isCapabilityError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load capability intelligence
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {capabilityError instanceof Error
                ? capabilityError.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isCapabilityLoading && !isCapabilityError && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ScoreCard
                label="Capability Coverage"
                score={capabilityScore}
                description="Share of known engineering capabilities detected in this repository."
              />

              <ScoreCard
                label="Architecture Maturity"
                score={
                  capabilityReport?.scores?.architectureMaturityScore ||
                  intelligenceReport?.summary?.maturityScore
                }
                level={intelligenceReport?.summary?.maturityLevel}
                description="Architecture maturity based on detected repository intelligence."
              />

              <ScoreCard
                label="Engineering Quality"
                score={intelligenceReport?.summary?.engineeringQualityScore}
                level={assessment?.engineeringQuality?.level}
                description="Quality score from the canonical repository intelligence assessment."
              />

              <ScoreCard
                label="Production Readiness"
                score={intelligenceReport?.summary?.productionReadinessScore}
                level={intelligenceReport?.summary?.productionReadinessLevel}
                description="How production-ready this repository appears from engineering signals."
              />
            </div>

            <IntelligenceSection
              title="Repository Capability Identity"
              description="What ArcHive understands this repository is capable of, based on technologies, architecture domains, and engineering signals."
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

                      <h2 className="mt-2 text-2xl font-bold">
                        {identity?.repositoryPersona ||
                          intelligenceReport?.summary?.persona ||
                          capabilityReport?.repositoryPurpose?.label ||
                          "Repository capability profile pending"}
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {dna?.engineeringProfile ||
                          capabilityReport?.repositoryPurpose?.description ||
                          "ArcHive has not generated a detailed capability identity for this repository yet."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-medium">
                      Repository Types
                    </p>
                    <BadgeGroup items={repositoryTypes} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <ScoreCard
                    label="DNA Maturity"
                    score={dna?.maturityScore}
                    description="Maturity detected from repository DNA."
                  />

                  <ScoreCard
                    label="Complexity"
                    score={
                      dna?.complexityScore ||
                      capabilityReport?.scores?.engineeringComplexityScore
                    }
                    level={capabilityReport?.scores?.infrastructureDepth}
                    description="Engineering complexity and infrastructure depth."
                  />

                  <ScoreCard
                    label="Confidence"
                    score={dna?.confidenceScore}
                    description="Confidence in the detected capability identity."
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Capability Matrix"
              description="Enabled and missing capability signals. Missing does not always mean bad; it means ArcHive has not detected that capability yet."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Enabled Capabilities</h3>
                    <Badge variant="secondary">
                      {enabledCapabilities.length}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <BadgeGroup items={enabledCapabilities} />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Missing / Not Detected</h3>
                    <Badge variant="outline">
                      {missingCapabilities.length}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <BadgeGroup
                      items={missingCapabilities}
                      variant="outline"
                    />
                  </div>
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Technology and Architecture Signals"
              description="Detected technologies and architecture domains that support the capability score."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">Technologies</p>
                  <BadgeGroup
                    items={technologies}
                    variant="outline"
                    humanize={false}
                  />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Architecture Domains
                  </p>
                  <BadgeGroup items={architectureDomains} />
                </div>

                <div className="rounded-xl border border-border bg-background p-5 lg:col-span-2">
                  <p className="mb-3 text-sm font-medium">
                    Strongest Capabilities
                  </p>
                  <BadgeGroup
                    items={dna?.strongestCapabilities || enabledCapabilities}
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Capability Reasoning"
              description="Signals and evidence ArcHive used to decide which capabilities are present."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Reasoning Signals
                  </p>
                  <InsightList
                    items={reasoningSignals}
                    empty="No reasoning signals detected yet."
                    limit={6}
                  />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Evidence Results
                  </p>
                  <InsightList
                    items={signals?.evidenceResults}
                    empty="No evidence results detected yet."
                    limit={6}
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Assessment Context"
              description="How capability intelligence connects to the broader repository assessment."
            >
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="font-medium">Repository Health</p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {assessment?.repositoryHealth?.summary ||
                      "No repository health summary available yet."}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-primary" />
                    <p className="font-medium">Repository Maturity</p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {assessment?.repositoryMaturity?.summary ||
                      "No maturity summary available yet."}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <p className="font-medium">Engineering Quality</p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {assessment?.engineeringQuality?.summary ||
                      "No engineering quality summary available yet."}
                  </p>
                </div>
              </div>
            </IntelligenceSection>
          </>
        )}
      </PageContent>
    </AppShell>
  );
}