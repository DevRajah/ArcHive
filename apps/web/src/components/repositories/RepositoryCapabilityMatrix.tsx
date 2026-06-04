"use client";

import {
  Boxes,
  CheckCircle2,
  CircleOff,
  Code2,
  Database,
  GitBranch,
  Layers,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RepositoryCapabilitiesResponse } from "@/types/repository-capabilities.types";
import { formatFilterLabel } from "@/lib/filters";

interface RepositoryCapabilityMatrixProps {
  data?: RepositoryCapabilitiesResponse;
  isLoading?: boolean;
}

const capabilityLabels: Array<{
  key: keyof RepositoryCapabilitiesResponse["capabilities"];
  label: string;
  description: string;
}> = [
  {
    key: "frontendArchitecture",
    label: "Frontend Architecture",
    description: "Client-side structure, pages, and UI composition",
  },
  {
    key: "apiLayer",
    label: "API Layer",
    description: "Backend routes, controllers, and service endpoints",
  },
  {
    key: "authentication",
    label: "Authentication",
    description: "Login, OAuth, session, or access control logic",
  },
  {
    key: "realtimeSystems",
    label: "Realtime Systems",
    description: "Socket.IO, websocket, or live event handling",
  },
  {
    key: "queueInfrastructure",
    label: "Queue Infrastructure",
    description: "BullMQ, workers, async jobs, or background processing",
  },
  {
    key: "databaseLayer",
    label: "Database Layer",
    description: "Schemas, models, migrations, or persistence logic",
  },
  {
    key: "cachingLayer",
    label: "Caching Layer",
    description: "Redis/cache-backed performance infrastructure",
  },
  {
    key: "devopsInfrastructure",
    label: "DevOps Infrastructure",
    description: "Deployment, Docker, CI/CD, or environment setup",
  },
  {
    key: "dependencyManagement",
    label: "Dependency Management",
    description: "Package, dependency, or build tooling changes",
  },
  {
    key: "typeContracts",
    label: "Type Contracts",
    description: "Shared types, interfaces, schemas, and contracts",
  },
  {
    key: "stateManagement",
    label: "State Management",
    description: "Client/server state, hooks, stores, or cache state",
  },
  {
    key: "architectureIntelligence",
    label: "Architecture Intelligence",
    description: "Repository analysis, classifiers, and system insights",
  },
];

function getCapabilityIcon(key: string) {
  if (key.includes("frontend")) return Code2;
  if (key.includes("api")) return Workflow;
  if (key.includes("auth")) return ShieldCheck;
  if (key.includes("realtime")) return Network;
  if (key.includes("queue")) return Boxes;
  if (key.includes("database")) return Database;
  if (key.includes("state")) return GitBranch;
  return Layers;
}

export function RepositoryCapabilityMatrix({
  data,
  isLoading,
}: RepositoryCapabilityMatrixProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading repository capabilities...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Repository Capability Matrix</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Capability intelligence is not available for this repository yet.
        </p>
      </div>
    );
  }

  const enabledCount = capabilityLabels.filter(
    (item) => data.capabilities?.[item.key]
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="text-lg font-semibold">
              Repository Capability Matrix
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Architecture capabilities detected from repository structure,
              technologies, and engineering activity.
            </p>
          </div>

          <Badge variant="secondary">
            {enabledCount}/{capabilityLabels.length} capabilities detected
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilityLabels.map((item) => {
            const enabled = Boolean(data.capabilities?.[item.key]);
            const Icon = getCapabilityIcon(item.key);

            return (
              <div
                key={item.key}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <CircleOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <Badge
                  variant={enabled ? "default" : "secondary"}
                  className="mt-4"
                >
                  {enabled ? "Detected" : "Not detected"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Architecture Maturity Score
          </p>
          <h3 className="mt-4 text-3xl font-bold">
            {data.scores.architectureMaturityScore}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Structural maturity based on detected architecture capabilities.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Engineering Complexity Score
          </p>
          <h3 className="mt-4 text-3xl font-bold">
            {data.scores.engineeringComplexityScore}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Complexity based on domains, infrastructure, and system depth.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Infrastructure Depth</p>
          <h3 className="mt-4 text-3xl font-bold">
            {formatFilterLabel(data.scores.infrastructureDepth)}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Depth of backend, realtime, queue, database, and platform systems.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Detected Architecture Domains</h3>

          {data.detectedDomains.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No architecture domains detected yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.detectedDomains.map((domain) => (
                <Badge key={domain} variant="secondary">
                  {formatFilterLabel(domain)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Detected Technologies</h3>

          {data.detectedTechnologies.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No technologies detected yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.detectedTechnologies.map((technology) => (
                <Badge key={technology} variant="outline">
                  {technology}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Architecture Styles</h3>

          {!data.architectureStyles || data.architectureStyles.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No architecture styles detected yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.architectureStyles.map((style) => (
                <Badge key={style} variant="secondary">
                  {formatFilterLabel(style)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}