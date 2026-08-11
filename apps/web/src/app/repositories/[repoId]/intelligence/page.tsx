"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  GitBranch,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { RepositoryLiveStatus } from "@/components/repositories/RepositoryLiveStatus";
import { RepositoryMarkdownReport } from "@/components/repositories/RepositoryMarkdownReport";

import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { InsightList } from "@/components/intelligence-v2/InsightList";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";
import { ScoreCard } from "@/components/intelligence-v2/ScoreCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useReprocessRepository,
  useRepositoryIntelligenceReport,
  useRepositoryMarkdownReport,
} from "@/hooks/useRepositories";
import { useRepositoryLiveStatus } from "@/hooks/useRepositoryLiveStatus";
import { formatFilterLabel } from "@/lib/filters";

type CanonicalIntelligenceReport = {
  repository?: {
    id?: string;
    name?: string;
    fullName?: string;
    description?: string | null;
    language?: string | null;
    stars?: number;
    forks?: number;
    createdAt?: string;
    updatedAt?: string;
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
        overallScore?: number;
        overallGrade?: string;

        summary?: string;

        scores?: Array<{
          area: string;
          score: number;
          grade?: string;
          level?: string;
          reasons?: string[];
        }>;
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
        assessments?: Array<{
          area?: string;
          score?: number;
          level?: string;
          strengths?: string[];
          weaknesses?: string[];
          recommendations?: string[];
        }>;
      };

      repositoryHealth?: {
        score?: number;
        status?: string;
        summary?: string;
      };

      technicalDebt?: {
        debtScore?: number;
        level?: string;
        summary?: string;
        severity?: string;
      };

      architectureDrift?: {
        driftScore?: number;
        severity?: string;
        summary?: string;
        items?: Array<{
          severity?: string;
          title?: string;
          description?: string;
          evidence?: string[];
        }>;
      };

      evolutionInsights?: {
        direction?: string;
        summary?: string;
        complexityTrend?: string;
        maturityTrend?: string;
        platformTrend?: string;
        confidence?: number;
        timelineEvidence?: string[];
        insights?: string[];
      };
    };

    advisor?: {
      strengthReport?: {
        strengths?: string[];
      };

      weaknessReport?: {
        weaknesses?: string[];
      };

      recommendationReport?: {
        recommendations?: Array<{
          priority?: "HIGH" | "MEDIUM" | "LOW" | string;
          category?: string;
          title?: string;
          reason?: string;
          action?: string;
        }>;
      };
    };
  };

  legacy?: {
    repositoryTypes?: string[];
    technologies?: string[];
    architectureDomains?: string[];
    engineeringSignals?: string[];
    reasoningSignals?: string[];
  };
};

function getScore(value?: number | null) {
  return typeof value === "number" ? value : null;
}

function formatScore(value?: number | null) {
  const score = getScore(value);

  return score === null ? "—" : `${score}%`;
}

function getEnabledCapabilities(capabilities?: Record<string, boolean>) {
  if (!capabilities) return [];

  return Object.entries(capabilities)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);
}

function groupRecommendations(
  recommendations?: Array<{
    priority?: string;
    category?: string;
    title?: string;
    reason?: string;
    action?: string;
  }>
) {
  const safeRecommendations = recommendations || [];

  return {
    high: safeRecommendations.filter(
      (item) => item.priority?.toUpperCase() === "HIGH"
    ),
    medium: safeRecommendations.filter(
      (item) => item.priority?.toUpperCase() === "MEDIUM"
    ),
    low: safeRecommendations.filter(
      (item) => item.priority?.toUpperCase() === "LOW"
    ),
  };
}

export default function RepositoryIntelligencePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params.repoId;

  const liveStatus = useRepositoryLiveStatus(repoId);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchIntelligenceReport,
  } = useRepositoryIntelligenceReport(repoId);

  const {
    data: markdownReport,
    isLoading: isMarkdownReportLoading,
  } = useRepositoryMarkdownReport(repoId);

  const reprocessMutation = useReprocessRepository();

  const report = data as CanonicalIntelligenceReport | undefined;

  const repository = report?.repository;
  const summary = report?.summary;
  const intelligence = report?.repositoryIntelligence;

  const identity = intelligence?.identity;
  const dna = identity?.repositoryDNA;
  const signals = intelligence?.signals;
  const assessment = intelligence?.assessment;
  const advisor = intelligence?.advisor;

  const enabledCapabilities = getEnabledCapabilities(signals?.capabilities);

  const legacyRepositoryTypes = report?.legacy?.repositoryTypes || [];
  const legacyTechnologies = report?.legacy?.technologies || [];
  const legacyDomains = report?.legacy?.architectureDomains || [];
  const legacyReasoningSignals = report?.legacy?.reasoningSignals || [];

  const repositoryTypes =
    identity?.repositoryTypes?.length
      ? identity.repositoryTypes
      : legacyRepositoryTypes;

  const technologies =
    signals?.technologies?.length ? signals.technologies : legacyTechnologies;

  const architectureDomains =
    signals?.architectureDomains?.length
      ? signals.architectureDomains
      : legacyDomains;

  const reasoningSignals =
    signals?.reasoningSignals?.length
      ? signals.reasoningSignals
      : legacyReasoningSignals;

  const recommendations = useMemo(
    () =>
      groupRecommendations(
        advisor?.recommendationReport?.recommendations
      ),
    [advisor?.recommendationReport?.recommendations]
  );

  const repositoryName =
    repository?.fullName || repository?.name || "repository";

  function handleRefreshIntelligence() {
    reprocessMutation.mutate(repoId, {
      onSuccess: async () => {
        setFeedback({
          type: "success",
          message:
            "Repository intelligence refresh queued successfully. ArcHive will update this report after processing.",
        });

        await refetchIntelligenceReport();
      },

      onError: (error) => {
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to refresh repository intelligence.",
        });
      },
    });
  }

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [feedback]);

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
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-3xl font-bold tracking-tight">
                  Repository Intelligence Report
                </h1>

                {repository?.fullName && (
                  <Badge variant="secondary">{repository.fullName}</Badge>
                )}

                {summary?.primaryRepositoryType && (
                  <Badge>{formatFilterLabel(summary.primaryRepositoryType)}</Badge>
                )}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                Engineering scorecard for repository identity, health, maturity,
                production readiness, architecture drift, evolution, signals,
                evidence, and advisor recommendations.
              </p>

              <div className="mt-4">
                <RepositoryLiveStatus
                  isConnected={liveStatus.isConnected}
                  lastUpdatedAt={liveStatus.lastUpdatedAt}
                />
              </div>
            </div>

            <Button
              onClick={handleRefreshIntelligence}
              disabled={reprocessMutation.isPending}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${reprocessMutation.isPending ? "animate-spin" : ""
                  }`}
              />
              {reprocessMutation.isPending
                ? "Refreshing..."
                : "Refresh Intelligence"}
            </Button>
          </div>
        </div>

        <RepositoryIntelligenceNav repositoryId={repoId} />

        {feedback && (
          <div
            className={`rounded-xl border p-4 ${feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-destructive/30 bg-destructive/10"
              }`}
          >
            <p
              className={`text-sm font-medium ${feedback.type === "success"
                ? "text-emerald-500"
                : "text-destructive"
                }`}
            >
              {feedback.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-56 rounded-xl" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load intelligence report
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please check backend connection."}
            </p>
          </div>
        )}

        {!isLoading && !isError && report && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ScoreCard
                label="Repository Health"
                score={summary?.healthScore}
                level={summary?.healthStatus}
                description="Overall repository health based on detected engineering signals."
              />

              <ScoreCard
                label="Engineering Quality"
                score={summary?.engineeringQualityScore}
                level={assessment?.engineeringQuality?.overallGrade}
                description="Architecture, maintainability, testing, observability, security, and devops quality."
              />

              <ScoreCard
                label="Repository Maturity"
                score={summary?.maturityScore}
                level={summary?.maturityLevel}
                description="How mature this repository appears from its structure and engineering evidence."
              />

              <ScoreCard
                label="Production Readiness"
                score={summary?.productionReadinessScore}
                level={summary?.productionReadinessLevel}
                description="How close this repository appears to production-grade readiness."
              />
            </div>

            <IntelligenceSection
              title="Repository Identity"
              description="ArcHive's semantic understanding of what this repository fundamentally is."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Repository Persona
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {identity?.repositoryPersona ||
                          summary?.persona ||
                          "Repository persona not available yet"}
                      </h2>

                      {dna?.engineeringProfile && (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {dna.engineeringProfile}
                        </p>
                      )}
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
                    label="DNA Structural Maturity"
                    score={dna?.maturityScore}
                    description="Structural maturity inferred from repository DNA signals. This is separate from the broader Repository Maturity assessment."
                  />

                  <ScoreCard
                    label="Complexity"
                    score={dna?.complexityScore}
                    description="Engineering complexity detected by ArcHive."
                  />

                  <ScoreCard
                    label="Confidence"
                    score={dna?.confidenceScore}
                    description="Confidence in this repository identity."
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-3 text-sm font-medium">
                    Strongest Capabilities
                  </p>
                  <BadgeGroup items={dna?.strongestCapabilities} />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">
                    Dominant Technologies
                  </p>
                  <BadgeGroup
                    items={dna?.dominantTechnologies || technologies}
                    variant="outline"
                    humanize={false}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">
                    Dominant Architecture
                  </p>
                  <BadgeGroup
                    items={dna?.dominantArchitecture || architectureDomains}
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Engineering Assessment"
              description="Repository-level engineering quality, readiness, maturity, health, and technical debt."
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                <ScoreCard
                  label="Engineering Quality"
                  score={
                    assessment?.engineeringQuality?.overallScore ??
                    summary?.engineeringQualityScore
                  }
                  level={
                    assessment?.engineeringQuality?.overallGrade
                  }
                />

                <ScoreCard
                  label="Repository Health"
                  score={
                    assessment?.repositoryHealth?.score ||
                    summary?.healthScore
                  }
                  level={
                    assessment?.repositoryHealth?.status ||
                    summary?.healthStatus
                  }
                />

                <ScoreCard
                  label="Production Readiness"
                  score={
                    assessment?.productionReadiness?.score ||
                    summary?.productionReadinessScore
                  }
                  level={
                    assessment?.productionReadiness?.level ||
                    summary?.productionReadinessLevel
                  }
                />

                <ScoreCard
                  label="Repository Maturity"
                  score={
                    assessment?.repositoryMaturity?.score ||
                    summary?.maturityScore
                  }
                  level={
                    assessment?.repositoryMaturity?.level ||
                    summary?.maturityLevel
                  }
                />

                <ScoreCard
                  label="Technical Debt"
                  score={assessment?.technicalDebt?.debtScore}
                  level={assessment?.technicalDebt?.severity}
                  lowerIsBetter
                />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {assessment?.engineeringQuality?.summary && (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-sm font-medium">Quality Summary</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {assessment.engineeringQuality.summary}
                    </p>
                  </div>
                )}

                {assessment?.technicalDebt?.summary && (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-sm font-medium">Technical Debt Summary</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {assessment.technicalDebt.summary}
                    </p>
                  </div>
                )}
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Quality Breakdown"
              description="Detailed engineering quality areas scored by ArcHive."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {!assessment?.engineeringQuality?.scores?.length ? (
                  <p className="text-sm text-muted-foreground">
                    No quality breakdown available yet.
                  </p>
                ) : (
                  assessment.engineeringQuality.scores.map(
                    (quality, index) => (
                      <div
                        key={`${quality.area}-${index}`}
                        className="rounded-xl border border-border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {formatFilterLabel(quality.area)}
                            </p>

                            <p className="mt-2 text-2xl font-bold">
                              {formatScore(quality.score)}
                            </p>
                          </div>

                          <Badge variant="secondary">
                            {quality.grade ||
                              quality.level ||
                              "N/A"}
                          </Badge>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${quality.score ?? 0}%`,
                            }}
                          />
                        </div>

                        {(quality.reasons?.length ?? 0) > 0 && (
                          <div className="mt-4">
                            <InsightList
                              items={quality.reasons ?? []}
                              limit={2}
                              empty="No reasons available."
                            />
                          </div>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Maturity Breakdown"
              description="Engineering maturity areas with strengths, weaknesses, and next-step recommendations."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {!assessment?.repositoryMaturity?.assessments ||
                  assessment.repositoryMaturity.assessments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No maturity breakdown available yet.
                  </p>
                ) : (
                  assessment.repositoryMaturity.assessments.map(
                    (item, index) => (
                      <div
                        key={`${item.area}-${index}`}
                        className="rounded-xl border border-border bg-background p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Maturity Area
                            </p>
                            <h3 className="mt-1 font-semibold">
                              {item.area
                                ? formatFilterLabel(item.area)
                                : "Unknown area"}
                            </h3>
                          </div>

                          <Badge variant="secondary">
                            {item.level || "Unknown"}
                          </Badge>
                        </div>

                        <div className="mt-4">
                          <ScoreCard
                            label="Area Score"
                            score={item.score}
                          />
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="mb-2 text-sm font-medium">
                              Strengths
                            </p>
                            <InsightList
                              items={item.strengths}
                              tone="success"
                              limit={2}
                            />
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-medium">
                              Weaknesses
                            </p>
                            <InsightList
                              items={item.weaknesses}
                              tone="warning"
                              limit={2}
                            />
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-medium">
                              Recommendations
                            </p>
                            <InsightList
                              items={item.recommendations}
                              limit={2}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Architecture Drift"
              description="Signals showing whether architecture is stable, drifting, or becoming inconsistent."
            >
              <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
                <ScoreCard
                  label="Drift Score"
                  score={assessment?.architectureDrift?.driftScore}
                  level={assessment?.architectureDrift?.severity}
                  description="Lower drift usually means architecture is more stable."
                  lowerIsBetter
                />

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="text-sm font-medium">Drift Summary</p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {assessment?.architectureDrift?.summary ||
                      "No architecture drift summary available yet."}
                  </p>

                  <div className="mt-5 space-y-3">
                    {assessment?.architectureDrift?.items?.slice(0, 4).map(
                      (item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {item.severity || "Unknown"}
                            </Badge>

                            <p className="text-sm font-medium">
                              {item.title || "Architecture drift item"}
                            </p>
                          </div>

                          {item.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}

                          {item.evidence && item.evidence.length > 0 && (
                            <div className="mt-3">
                              <BadgeGroup
                                items={item.evidence}
                                variant="outline"
                                humanize={false}
                                limit={4}
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Repository Evolution"
              description="How ArcHive thinks this repository is changing over time."
            >
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Evolution Direction
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {assessment?.evolutionInsights?.direction ||
                          "Direction unknown"}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {assessment?.evolutionInsights?.summary ||
                      "No evolution summary available yet."}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <Badge variant="secondary">
                      Complexity:{" "}
                      {assessment?.evolutionInsights?.complexityTrend ||
                        "Unknown"}
                    </Badge>

                    <Badge variant="secondary">
                      Maturity:{" "}
                      {assessment?.evolutionInsights?.maturityTrend ||
                        "Unknown"}
                    </Badge>

                    <Badge variant="secondary">
                      Platform:{" "}
                      {assessment?.evolutionInsights?.platformTrend ||
                        "Unknown"}
                    </Badge>

                    <Badge>
                      Confidence:{" "}
                      {formatScore(assessment?.evolutionInsights?.confidence)}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="mb-3 text-sm font-medium">
                      Timeline Evidence
                    </p>
                    <InsightList
                      items={assessment?.evolutionInsights?.timelineEvidence}
                      limit={4}
                    />
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="mb-3 text-sm font-medium">
                      Evolution Insights
                    </p>
                    <InsightList
                      items={assessment?.evolutionInsights?.insights}
                      limit={4}
                    />
                  </div>
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Signals and Capabilities"
              description="Technologies, domains, capabilities, evidence, and reasoning signals behind the report."
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

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Enabled Capabilities
                  </p>
                  <BadgeGroup items={enabledCapabilities} />
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Engineering Signals
                  </p>
                  <BadgeGroup items={signals?.engineeringSignals} />
                </div>

                <div className="rounded-xl border border-border bg-background p-5 lg:col-span-2">
                  <p className="mb-3 text-sm font-medium">Reasoning Signals</p>
                  <InsightList
                    items={reasoningSignals}
                    limit={6}
                    empty="No reasoning signals available yet."
                  />
                </div>

                <div className="rounded-xl border border-border bg-background p-5 lg:col-span-2">
                  <p className="mb-3 text-sm font-medium">Evidence Results</p>
                  <InsightList
                    items={signals?.evidenceResults}
                    limit={6}
                    empty="No evidence results available yet."
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Engineering Advisor"
              description="Strengths, weaknesses, and prioritised recommendations generated from repository intelligence."
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <p className="mb-3 text-sm font-medium">Strengths</p>
                  <InsightList
                    items={advisor?.strengthReport?.strengths}
                    tone="success"
                    limit={5}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Weaknesses</p>
                  <InsightList
                    items={advisor?.weaknessReport?.weaknesses}
                    tone="warning"
                    limit={5}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Recommendations</p>
                  <div className="space-y-4">
                    {["HIGH", "MEDIUM", "LOW"].map((priority) => {
                      const items =
                        priority === "HIGH"
                          ? recommendations.high
                          : priority === "MEDIUM"
                            ? recommendations.medium
                            : recommendations.low;

                      if (items.length === 0) return null;

                      return (
                        <div
                          key={priority}
                          className="rounded-xl border border-border bg-background p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium">
                              {priority} Priority
                            </p>
                            <Badge variant="secondary">{items.length}</Badge>
                          </div>

                          <div className="space-y-3">
                            {items.slice(0, 3).map((item, index) => (
                              <div
                                key={`${item.title}-${index}`}
                                className="rounded-lg border border-border bg-card p-3"
                              >
                                <p className="text-sm font-medium">
                                  {item.title || "Recommendation"}
                                </p>

                                {item.reason && (
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {item.reason}
                                  </p>
                                )}

                                {item.action && (
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    Action: {item.action}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {advisor?.recommendationReport?.recommendations?.length ===
                      0 && (
                        <p className="text-sm text-muted-foreground">
                          No recommendations available yet.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </IntelligenceSection>

            <RepositoryMarkdownReport
              data={markdownReport}
              isLoading={isMarkdownReportLoading}
              repositoryName={repositoryName}
            />
          </>
        )}
      </PageContent>
    </AppShell>
  );
}