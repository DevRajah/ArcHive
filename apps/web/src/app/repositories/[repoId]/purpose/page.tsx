"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Brain,
  FileSearch,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";
import { RepositoryIntelligenceNav } from "@/components/repositories/RepositoryIntelligenceNav";
import { BadgeGroup } from "@/components/intelligence-v2/BadgeGroup";
import { IntelligenceSection } from "@/components/intelligence-v2/IntelligenceSection";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositoryIntelligenceReport } from "@/hooks/useRepositories";

import {
  getPrimaryRepositoryType,
  getPurposeDetails,
  normalizeReasoningSignals,
} from "@/lib/repository-purpose";

import {
  formatIntelligenceLabel,
} from "@/lib/intelligence-labels";

type RepositoryPurposeReport = {
  repository?: {
    id?: string;
    name?: string;
    fullName?: string;
  };

  /*
   * Retained for compatibility with older reports.
   *
   * It must not override canonical repository intelligence.
   */
  summary?: {
    primaryRepositoryType?:
      | string
      | null;
  };

  repositoryIntelligence?: {
    identity?: {
      primaryRepositoryType?:
        | string
        | null;

      repositoryTypes?: string[];

      repositoryPersona?: string;

      repositoryDNA?: {
        engineeringProfile?: string;

        strongestCapabilities?:
          unknown[];
      };
    };

    signals?: {
      technologies?: string[];
      architectureDomains?: string[];
      engineeringSignals?: string[];
      reasoningSignals?: unknown;
    };
  };

  /*
   * Legacy intelligence exists only for backwards compatibility.
   */
  legacy?: {
    repositoryTypes?: string[];
  };
};

export default function RepositoryPurposePage() {
  const params =
    useParams<{
      repoId: string;
    }>();

  const repoId =
    params.repoId;

  const {
    data,
    isLoading,
    isError,
    error,
  } =
    useRepositoryIntelligenceReport(
      repoId,
    );

  const report =
    data as
      | RepositoryPurposeReport
      | undefined;

  const repository =
    report?.repository;

  const identity =
    report
      ?.repositoryIntelligence
      ?.identity;

  const signals =
    report
      ?.repositoryIntelligence
      ?.signals;

  /*
   * The helper prioritises:
   *
   * repositoryIntelligence.identity.primaryRepositoryType
   *
   * This is the backend's canonical repository purpose.
   */
  const primaryRepositoryType =
    getPrimaryRepositoryType(
      report,
    );

  const purpose =
    getPurposeDetails(
      primaryRepositoryType,
    );

  /*
   * Repository Types must come directly from canonical identity.
   *
   * Legacy types are used only when the canonical array genuinely
   * does not exist or is empty.
   */
  const canonicalRepositoryTypes =
    identity?.repositoryTypes;

  const repositoryTypes =
    Array.isArray(
      canonicalRepositoryTypes,
    ) &&
    canonicalRepositoryTypes.length > 0
      ? canonicalRepositoryTypes
      : Array.isArray(
            report?.legacy
              ?.repositoryTypes,
          )
        ? report!.legacy!
            .repositoryTypes!
        : [];

  const reasoningSignals =
    normalizeReasoningSignals(
      signals?.reasoningSignals,
    );

  /*
   * Development-only diagnostics.
   *
   * Useful when verifying that the frontend is using the same canonical
   * values returned by the repository intelligence endpoint.
   */
  useEffect(() => {
    if (
      process.env.NODE_ENV !==
      "development"
    ) {
      return;
    }

    console.log(
      "RAW_INTELLIGENCE_RESPONSE",
      data,
    );

    console.log(
      "CANONICAL_PRIMARY_REPOSITORY_TYPE",
      identity
        ?.primaryRepositoryType,
    );

    console.log(
      "CANONICAL_REPOSITORY_TYPES",
      identity?.repositoryTypes,
    );

    console.log(
      "SUMMARY_PRIMARY_REPOSITORY_TYPE_COMPATIBILITY_ONLY",
      report?.summary
        ?.primaryRepositoryType,
    );

    console.log(
      "LEGACY_REPOSITORY_TYPES_COMPATIBILITY_ONLY",
      report?.legacy
        ?.repositoryTypes,
    );

    console.log(
      "FRONTEND_SELECTED_PRIMARY_TYPE",
      primaryRepositoryType,
    );
  }, [
    data,
    identity?.primaryRepositoryType,
    identity?.repositoryTypes,
    report?.summary
      ?.primaryRepositoryType,
    report?.legacy
      ?.repositoryTypes,
    primaryRepositoryType,
  ]);

  return (
    <AppShell>
      <PageContent>
        <Button
          asChild
          variant="ghost"
          className="px-0"
        >
          <Link
            href={`/repositories/${repoId}`}
          >
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

                {repository?.fullName ? (
                  <Badge variant="secondary">
                    {repository.fullName}
                  </Badge>
                ) : null}
              </div>

              <p className="mt-2 max-w-3xl text-muted-foreground">
                ArcHive explains what this repository fundamentally
                is using backend-ranked repository intelligence.
              </p>
            </div>
          </div>
        </div>

        <RepositoryIntelligenceNav
          repositoryId={repoId}
        />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : null}

        {isError ? (
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
        ) : null}

        {!isLoading &&
        !isError ? (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    Primary Repository Purpose
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {purpose.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>
                      {purpose.category}
                    </Badge>

                    {primaryRepositoryType ? (
                      <Badge variant="secondary">
                        {formatIntelligenceLabel(
                          primaryRepositoryType,
                        )}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
                    {purpose.description}
                  </p>
                </div>
              </div>
            </div>

            <IntelligenceSection
              title="Repository Types"
              description="Rendered directly from repositoryIntelligence.identity.repositoryTypes. Backend order is preserved."
            >
              {repositoryTypes.length >
              0 ? (
                <BadgeGroup
                  items={
                    repositoryTypes
                  }
                />
              ) : (
                <Badge variant="outline">
                  No canonical repository types available
                </Badge>
              )}
            </IntelligenceSection>

            <IntelligenceSection
              title="Repository Identity"
              description="Persona and DNA signals from the canonical repository intelligence wrapper."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Repository Persona
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {formatIntelligenceLabel(
                          identity
                            ?.repositoryPersona,
                        ) ||
                          "Repository persona pending"}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {formatIntelligenceLabel(
                          identity
                            ?.repositoryDNA
                            ?.engineeringProfile,
                        ) ||
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
                    items={
                      identity
                        ?.repositoryDNA
                        ?.strongestCapabilities
                    }
                  />
                </div>
              </div>
            </IntelligenceSection>

            <IntelligenceSection
              title="Why ArcHive Classified It This Way"
              description="Each signal is normalized and rendered separately from repositoryIntelligence.signals.reasoningSignals."
            >
              {reasoningSignals.length >
              0 ? (
                <ul className="space-y-2">
                  {reasoningSignals.map(
                    (
                      signal,
                      index,
                    ) => (
                      <li
                        key={`${signal}-${index}`}
                        className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted-foreground"
                      >
                        {signal}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reasoning signals
                  available yet.
                </p>
              )}
            </IntelligenceSection>

            <IntelligenceSection
              title="Supporting Signals"
              description="Technologies and architecture domains are supporting evidence only. They do not override the backend primary repository purpose."
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="min-w-0 rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Technologies
                  </p>

                  <BadgeGroup
                    items={
                      signals?.technologies
                    }
                    variant="outline"
                    humanize={false}
                  />
                </div>

                <div className="min-w-0 rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Architecture Domains
                  </p>

                  <BadgeGroup
                    items={
                      signals
                        ?.architectureDomains
                    }
                  />
                </div>

                <div className="min-w-0 rounded-xl border border-border bg-background p-5">
                  <p className="mb-3 text-sm font-medium">
                    Engineering Signals
                  </p>

                  <BadgeGroup
                    items={
                      signals
                        ?.engineeringSignals
                    }
                  />
                </div>
              </div>
            </IntelligenceSection>
          </>
        ) : null}
      </PageContent>
    </AppShell>
  );
}