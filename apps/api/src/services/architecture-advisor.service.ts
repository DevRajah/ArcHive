import { Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

import type {
  ArchitectureAdvisorAction,
  ArchitectureAdvisorAssessment,
  ArchitectureAdvisorCategory,
  ArchitectureAdvisorEvidenceSummary,
  ArchitectureAdvisorFinding,
  ArchitectureAdvisorFindingKind,
  ArchitectureAdvisorHistoryItem,
  ArchitectureAdvisorScores,
  ArchitectureAdvisorSeverity,
} from "../types/architecture-advisor.types";

type RepositoryAdvisorSource = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  defaultBranch: string;
  isTracked: boolean;
  userId: string | null;
  updatedAt: Date;

  intelligenceSnapshots: Array<{
    id: string;
    primaryRepositoryType: string | null;
    repositoryTypes: Prisma.JsonValue;
    technologies: Prisma.JsonValue;
    architectureDomains: Prisma.JsonValue;
    capabilities: Prisma.JsonValue;
    recommendations: Prisma.JsonValue;
    intelligence: Prisma.JsonValue;

    confidenceScore: number | null;
    maturityScore: number | null;
    architectureScore: number | null;
    capabilityScore: number | null;
    engineeringQualityScore: number | null;
    productionReadinessScore: number | null;

    createdAt: Date;
  }>;

  architectureChanges: Array<{
    id: string;
    changeType: string;
    detectedTechnology: string | null;
    fileAffected: string | null;
    summary: string;
    repositoryTypes: string | null;
    reasoningSignals: string | null;
    architectureDomain: string | null;
    evolutionSummary: string | null;
    createdAt: Date;
  }>;

  engineeringRecommendations: Array<{
    id: string;
    recommendationKey: string;
    title: string;
    description: string;
    status: string;
    evidence: string | null;
    createdAt: Date;
  }>;
};

type AdvisorSignals = {
  snapshotId: string | null;
  snapshotCreatedAt: Date | null;

  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  scores: ArchitectureAdvisorScores;
};

type FindingBuckets = {
  strengths: ArchitectureAdvisorFinding[];
  architectureConcerns: ArchitectureAdvisorFinding[];
  productionRisks: ArchitectureAdvisorFinding[];
  securityObservations: ArchitectureAdvisorFinding[];
  scalabilityConcerns: ArchitectureAdvisorFinding[];
  reliabilityConcerns: ArchitectureAdvisorFinding[];
  maintainabilityConcerns: ArchitectureAdvisorFinding[];
  observabilityConcerns: ArchitectureAdvisorFinding[];
  dataConcerns: ArchitectureAdvisorFinding[];
  deliveryConcerns: ArchitectureAdvisorFinding[];
};

const normalize = (value: string) => {
  return value.trim().toLowerCase();
};

const clampScore = (score: number) => {
  return Math.max(0, Math.min(100, Math.round(score)));
};

const uniqueSorted = (values: string[]) => {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
};

const splitStoredList = (value?: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const readStringArray = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSorted(
    value.filter(
      (item): item is string =>
        typeof item === "string"
    )
  );
};

const readCapabilities = (
  value: Prisma.JsonValue
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const capabilities = value.flatMap((item) => {
    if (typeof item === "string") {
      return [item];
    }

    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item)
    ) {
      return [];
    }

    const record = item as Record<string, unknown>;

    const candidate =
      record.key ??
      record.name ??
      record.label ??
      record.capability ??
      record.title;

    return typeof candidate === "string"
      ? [candidate]
      : [];
  });

  return uniqueSorted(capabilities);
};

const containsAny = (
  values: string[],
  candidates: string[]
) => {
  const normalizedValues = values.map(normalize);

  return candidates.some((candidate) =>
    normalizedValues.some((value) =>
      value.includes(normalize(candidate))
    )
  );
};

const hasTechnology = (
  signals: AdvisorSignals,
  candidates: string[]
) => {
  return containsAny(
    signals.technologies,
    candidates
  );
};

const hasCapability = (
  signals: AdvisorSignals,
  candidates: string[]
) => {
  return containsAny(
    signals.capabilities,
    candidates
  );
};

const hasArchitectureDomain = (
  signals: AdvisorSignals,
  candidates: string[]
) => {
  return containsAny(
    signals.architectureDomains,
    candidates
  );
};

const createFinding = ({
  key,
  category,
  kind,
  severity,
  title,
  description,
  evidence,
  recommendation = null,
}: {
  key: string;
  category: ArchitectureAdvisorCategory;
  /**
 * Finding kind and severity are deliberately separate.
 *
 * A HIGH-priority improvement is not automatically a HIGH confirmed risk.
 */
  kind: ArchitectureAdvisorFindingKind;
  severity: ArchitectureAdvisorSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendation?: string | null;
}): ArchitectureAdvisorFinding => {
  return {
    key,
    category,
    kind,
    severity,
    title,
    description,
    evidence: uniqueSorted(evidence),
    recommendation,
  };
};

const severityWeight: Record<
  ArchitectureAdvisorSeverity,
  number
> = {
  INFO: 0,
  LOW: 8,
  MEDIUM: 18,
  HIGH: 30,
  CRITICAL: 45,
};

const severityPriority: Record<
  ArchitectureAdvisorSeverity,
  number
> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  INFO: 1,
};

const loadRepository = async (
  repositoryId: string
): Promise<RepositoryAdvisorSource | null> => {
  return prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },

    select: {
      id: true,
      name: true,
      fullName: true,
      description: true,
      language: true,
      defaultBranch: true,
      isTracked: true,
      userId: true,
      updatedAt: true,

      intelligenceSnapshots: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,

        select: {
          id: true,
          primaryRepositoryType: true,
          repositoryTypes: true,
          technologies: true,
          architectureDomains: true,
          capabilities: true,
          recommendations: true,
          intelligence: true,

          confidenceScore: true,
          maturityScore: true,
          architectureScore: true,
          capabilityScore: true,
          engineeringQualityScore: true,
          productionReadinessScore: true,

          createdAt: true,
        },
      },

      architectureChanges: {
        orderBy: {
          createdAt: "desc",
        },
        take: 100,

        select: {
          id: true,
          changeType: true,
          detectedTechnology: true,
          fileAffected: true,
          summary: true,
          repositoryTypes: true,
          reasoningSignals: true,
          architectureDomain: true,
          evolutionSummary: true,
          createdAt: true,
        },
      },

      engineeringRecommendations: {
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          recommendationKey: true,
          title: true,
          description: true,
          status: true,
          evidence: true,
          createdAt: true,
        },
      },
    },
  });
};

const extractSignals = (
  repository: RepositoryAdvisorSource
): AdvisorSignals => {
  const snapshot =
    repository.intelligenceSnapshots[0];

  if (snapshot) {
    return {
      snapshotId: snapshot.id,
      snapshotCreatedAt: snapshot.createdAt,

      technologies: readStringArray(
        snapshot.technologies
      ),

      architectureDomains: readStringArray(
        snapshot.architectureDomains
      ),

      repositoryTypes: uniqueSorted([
        ...readStringArray(
          snapshot.repositoryTypes
        ),

        ...(snapshot.primaryRepositoryType
          ? [snapshot.primaryRepositoryType]
          : []),
      ]),

      capabilities: readCapabilities(
        snapshot.capabilities
      ),

      scores: {
        confidenceScore:
          snapshot.confidenceScore,
        maturityScore: snapshot.maturityScore,
        architectureScore:
          snapshot.architectureScore,
        capabilityScore:
          snapshot.capabilityScore,
        engineeringQualityScore:
          snapshot.engineeringQualityScore,
        productionReadinessScore:
          snapshot.productionReadinessScore,
      },
    };
  }

  /*
   * Architecture changes allow the advisor to provide a limited assessment
   * before the repository has completed its first full intelligence refresh.
   * Confidence is intentionally reduced when this fallback is used.
   */
  return {
    snapshotId: null,
    snapshotCreatedAt: null,

    technologies: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.detectedTechnology)
        .filter(
          (technology): technology is string =>
            Boolean(technology)
        )
    ),

    architectureDomains: uniqueSorted(
      repository.architectureChanges
        .map((change) => change.architectureDomain)
        .filter(
          (domain): domain is string =>
            Boolean(domain)
        )
    ),

    repositoryTypes: uniqueSorted(
      repository.architectureChanges.flatMap(
        (change) =>
          splitStoredList(change.repositoryTypes)
      )
    ),

    capabilities: [],

    scores: {
      confidenceScore: null,
      maturityScore: null,
      architectureScore: null,
      capabilityScore: null,
      engineeringQualityScore: null,
      productionReadinessScore: null,
    },
  };
};

const buildStrengths = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  const strengths: ArchitectureAdvisorFinding[] =
    [];

  if (
    (signals.scores.architectureScore ?? 0) >=
    75
  ) {
    strengths.push(
      createFinding({
        key: "strong-production-readiness",

        // This is positive evidence, not a risk or recommendation.
        kind: "STRENGTH",

        category: "PRODUCTION_READINESS",
        severity: "INFO",
        title:
          "Strong production-readiness signals",
        description:
          "The repository includes several characteristics associated with production-capable systems.",
        evidence: [
          `Production readiness score: ${signals.scores.productionReadinessScore}/100`,
        ],
      })
    );
  }

  if (
    (signals.scores.productionReadinessScore ??
      0) >= 75
  ) {
    strengths.push(
      createFinding({
        key: "strong-architecture-score",

        // This is positive evidence, not a risk or recommendation.
        kind: "STRENGTH",

        category: "ARCHITECTURE",
        severity: "INFO",
        title: "Strong architecture score",
        description:
          "The repository demonstrates a healthy architecture profile based on the available intelligence signals.",
        evidence: [
          `Architecture score: ${signals.scores.architectureScore}/100`,
        ],
      })
    );
  }

  if (
    hasTechnology(signals, [
      "docker",
      "docker compose",
      "container",
    ])
  ) {
    strengths.push(
      createFinding({
        key: "containerization-detected",
        kind: "STRENGTH",
        category: "DELIVERY",
        severity: "INFO",
        title: "Containerization detected",
        description:
          "Containerization can improve environment consistency across development, testing and deployment.",
        evidence: signals.technologies.filter(
          (technology) =>
            normalize(technology).includes(
              "docker"
            ) ||
            normalize(technology).includes(
              "container"
            )
        ),
      })
    );
  }

  if (
    hasTechnology(signals, [
      "redis",
      "bullmq",
      "rabbitmq",
      "kafka",
      "queue",
    ])
  ) {
    strengths.push(
      createFinding({
        key: "asynchronous-processing-detected",
        kind: "STRENGTH",
        category: "SCALABILITY",
        severity: "INFO",
        title:
          "Asynchronous processing capability detected",
        description:
          "Queue or messaging infrastructure can separate slower workloads from synchronous request handling.",
        evidence: signals.technologies.filter(
          (technology) =>
            containsAny([technology], [
              "redis",
              "bullmq",
              "rabbitmq",
              "kafka",
              "queue",
            ])
        ),
      })
    );
  }

  if (
    hasCapability(signals, [
      "authentication",
      "authorization",
      "audit",
      "monitoring",
      "reconciliation",
      "background jobs",
    ])
  ) {
    strengths.push(
      createFinding({
        key: "operational-capabilities-detected",
        kind: "STRENGTH",
        category: "ENGINEERING_QUALITY",
        severity: "INFO",
        title:
          "Operational engineering capabilities detected",
        description:
          "The repository contains capabilities that support real-world operational workflows.",
        evidence: signals.capabilities,
      })
    );
  }

  if (
    repository.architectureChanges.length >= 5
  ) {
    strengths.push(
      createFinding({
        key: "architecture-evolution-visible",
        kind: "STRENGTH",
        category: "MAINTAINABILITY",
        severity: "INFO",
        title:
          "Architecture evolution is visible",
        description:
          "ArcHive has enough historical architecture evidence to reason about how the repository has changed.",
        evidence: [
          `${repository.architectureChanges.length} architecture changes were analysed.`,
        ],
      })
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      createFinding({
        key: "repository-intelligence-baseline",
        kind: "STRENGTH",
        category: "ENGINEERING_QUALITY",
        severity: "INFO",
        title:
          "Repository intelligence baseline established",
        description:
          "ArcHive has collected enough repository information to begin producing an evidence-based architecture assessment.",
        evidence: [
          `${signals.technologies.length} technologies detected.`,
          `${signals.architectureDomains.length} architecture domains detected.`,
        ],
      })
    );
  }

  return strengths;
};

const buildArchitectureConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const architectureScore =
    signals.scores.architectureScore;

  if (
    architectureScore !== null &&
    architectureScore < 45
  ) {
    findings.push(
      createFinding({
        key: "low-architecture-score",
        kind: "IMPROVEMENT",
        category: "ARCHITECTURE",
        severity: "HIGH",
        title:
          "Architecture quality requires attention",
        description:
          "The current architecture score indicates significant structural or design weaknesses.",
        evidence: [
          `Architecture score: ${architectureScore}/100`,
        ],
        recommendation:
          "Review module boundaries, responsibility separation, dependency direction and infrastructure coupling.",
      })
    );
  } else if (
    architectureScore !== null &&
    architectureScore < 65
  ) {
    findings.push(
      createFinding({
        key: "moderate-architecture-score",
        kind: "IMPROVEMENT",
        category: "ARCHITECTURE",
        severity: "MEDIUM",
        title:
          "Architecture profile is only moderately strong",
        description:
          "The repository has a workable architecture baseline, but some structural improvements may still be needed.",
        evidence: [
          `Architecture score: ${architectureScore}/100`,
        ],
        recommendation:
          "Prioritise the active architecture recommendations and review areas with repeated architecture changes.",
      })
    );
  }

  if (
    signals.architectureDomains.length >= 7
  ) {
    findings.push(
      createFinding({
        key: "broad-architecture-surface",
        kind: "IMPROVEMENT",
        category: "ARCHITECTURE",
        severity: "MEDIUM",
        title:
          "Repository spans many architecture domains",
        description:
          "A broad architecture surface can increase coupling and make ownership boundaries harder to maintain.",
        evidence: signals.architectureDomains,
        recommendation:
          "Confirm that each architecture domain has a clear module boundary and a well-defined responsibility.",
      })
    );
  }

  if (
    signals.repositoryTypes.length >= 4
  ) {
    findings.push(
      createFinding({
        key: "multiple-repository-identities",
        kind: "IMPROVEMENT",
        category: "ARCHITECTURE",
        severity: "MEDIUM",
        title:
          "Repository has several architectural identities",
        description:
          "The repository appears to perform several distinct platform or application roles.",
        evidence: signals.repositoryTypes,
        recommendation:
          "Review whether the repository is becoming too broad and whether some responsibilities should become separate bounded contexts.",
      })
    );
  }

  return findings;
};

const buildProductionRisks = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const readinessScore =
    signals.scores.productionReadinessScore;

  if (
    readinessScore !== null &&
    readinessScore < 40
  ) {
    findings.push(
      createFinding({
        key: "low-production-readiness",
        kind: "IMPROVEMENT",
        category: "PRODUCTION_READINESS",
        severity: "CRITICAL",
        title:
          "Production readiness is critically low",
        description:
          "The repository does not currently demonstrate enough production-readiness signals for high-confidence deployment.",
        evidence: [
          `Production readiness score: ${readinessScore}/100`,
        ],
        recommendation:
          "Address reliability, observability, deployment safety, security and operational recovery before treating this repository as production-ready.",
      })
    );
  } else if (
    readinessScore !== null &&
    readinessScore < 65
  ) {
    findings.push(
      createFinding({
        key: "moderate-production-readiness",
        kind: "IMPROVEMENT",
        category: "PRODUCTION_READINESS",
        severity: "HIGH",
        title:
          "Production readiness needs improvement",
        description:
          "The repository has some production characteristics, but material operational gaps remain.",
        evidence: [
          `Production readiness score: ${readinessScore}/100`,
        ],
        recommendation:
          "Prioritise health checks, graceful shutdown, observability, failure recovery and deployment validation.",
      })
    );
  }

  if (!repository.isTracked) {
    findings.push(
      createFinding({
        key: "repository-not-tracked",
        kind: "UNVERIFIED",
        category: "PRODUCTION_READINESS",
        severity: "MEDIUM",
        title:
          "Continuous repository tracking is disabled",
        description:
          "ArcHive cannot continuously detect new engineering changes while repository tracking is disabled.",
        evidence: [
          "Repository tracking status: disabled",
        ],
        recommendation:
          "Enable tracking so architecture advice remains aligned with the latest repository changes.",
      })
    );
  }

  if (
    !hasTechnology(signals, [
      "docker",
      "container",
      "kubernetes",
    ])
  ) {
    findings.push(
      createFinding({
        key: "deployment-packaging-not-detected",
        kind: "UNVERIFIED",
        category: "DELIVERY",
        severity: "LOW",
        title:
          "Deployment packaging was not detected",
        description:
          "The current intelligence does not show container or orchestration technology.",
        evidence: [
          "No Docker, container or Kubernetes signal was found.",
        ],
        recommendation:
          "Confirm that deployment packaging is documented and reproducible. Containerization is one option, not a mandatory requirement.",
      })
    );
  }

  return findings;
};

const buildSecurityObservations = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const authenticationDetected =
    hasCapability(signals, [
      "authentication",
      "authorization",
      "rbac",
      "access control",
    ]) ||
    hasTechnology(signals, [
      "jwt",
      "oauth",
      "passport",
      "auth",
    ]);

  if (!authenticationDetected) {
    findings.push(
      createFinding({
        key: "authentication-not-detected",
        kind: "UNVERIFIED",
        category: "SECURITY",
        severity: "MEDIUM",
        title:
          "Authentication controls were not detected",
        description:
          "ArcHive could not confirm an authentication or authorization capability from the current repository intelligence.",
        evidence: [
          "No authentication, authorization, OAuth, JWT or RBAC signal was found.",
        ],
        recommendation:
          "Confirm whether the repository exposes protected functionality. Add authentication and authorization where access control is required.",
      })
    );
  }

  const auditDetected = hasCapability(
    signals,
    ["audit", "audit logging", "audit trail"]
  );

  if (!auditDetected) {
    findings.push(
      createFinding({
        key: "audit-capability-not-detected",
        kind: "UNVERIFIED",
        category: "SECURITY",
        severity: "LOW",
        title:
          "Audit capability was not detected",
        description:
          "The repository intelligence does not currently show a dedicated audit trail capability.",
        evidence: [
          "No audit capability signal was found.",
        ],
        recommendation:
          "For sensitive or administrative operations, record who performed the action, what changed and when it occurred.",
      })
    );
  }

  return findings;
};

const buildScalabilityConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const hasQueue = hasTechnology(signals, [
    "bullmq",
    "rabbitmq",
    "kafka",
    "queue",
    "message broker",
  ]);

  const hasCache = hasTechnology(signals, [
    "redis",
    "cache",
  ]);

  const broadCapabilitySurface =
    signals.capabilities.length >= 8;

  if (broadCapabilitySurface && !hasQueue) {
    findings.push(
      createFinding({
        key: "broad-capability-without-queue",
        kind: "IMPROVEMENT",
        category: "SCALABILITY",
        severity: "MEDIUM",
        title:
          "Broad capability surface without asynchronous processing evidence",
        description:
          "The repository supports many capabilities, but ArcHive did not detect queue or messaging infrastructure.",
        evidence: [
          `${signals.capabilities.length} capabilities detected.`,
          "No queue or message-broker signal was found.",
        ],
        recommendation:
          "Review slow, retryable or resource-intensive workloads and consider moving suitable operations to asynchronous workers.",
      })
    );
  }

  if (
    signals.architectureDomains.length >= 5 &&
    !hasCache
  ) {
    findings.push(
      createFinding({
        key: "broad-domain-without-cache",
        kind: "IMPROVEMENT",
        category: "SCALABILITY",
        severity: "LOW",
        title:
          "Caching strategy was not detected",
        description:
          "The repository spans several architecture domains, but no caching technology was identified.",
        evidence: [
          `${signals.architectureDomains.length} architecture domains detected.`,
        ],
        recommendation:
          "Review repeated read-heavy operations before introducing caching. Add caching only where measurements justify it.",
      })
    );
  }

  return findings;
};

const buildReliabilityConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const hasQueue = hasTechnology(signals, [
    "bullmq",
    "rabbitmq",
    "kafka",
    "queue",
  ]);

  const hasRedis = hasTechnology(signals, [
    "redis",
  ]);

  if (hasQueue && hasRedis) {
    findings.push(
      createFinding({
        key: "queue-redis-resilience-review",
        kind: "UNVERIFIED",
        category: "RELIABILITY",
        severity: "MEDIUM",
        title:
          "Queue infrastructure resilience should be verified",
        description:
          "Redis and queue-processing signals appear together. This creates an important operational dependency that requires failure and recovery planning.",
        evidence: signals.technologies.filter(
          (technology) =>
            containsAny([technology], [
              "redis",
              "bullmq",
              "queue",
            ])
        ),
        recommendation:
          "Verify retry limits, dead-letter handling, job idempotency, Redis persistence, connection recovery and worker shutdown behaviour.",
      })
    );
  }

  const productionScore =
    signals.scores.productionReadinessScore;

  if (
    productionScore !== null &&
    productionScore < 70
  ) {
    findings.push(
      createFinding({
        key: "failure-recovery-review",
        kind: "UNVERIFIED",
        category: "RELIABILITY",
        severity: "MEDIUM",
        title:
          "Failure recovery requires explicit review",
        description:
          "The production-readiness score suggests that some operational recovery controls may be incomplete.",
        evidence: [
          `Production readiness score: ${productionScore}/100`,
        ],
        recommendation:
          "Confirm retry behaviour, timeout handling, graceful shutdown, health checks and recovery procedures.",
      })
    );
  }

  return findings;
};

const buildMaintainabilityConcerns = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const qualityScore =
    signals.scores.engineeringQualityScore;

  if (
    qualityScore !== null &&
    qualityScore < 50
  ) {
    findings.push(
      createFinding({
        key: "low-engineering-quality",
        kind: "IMPROVEMENT",
        category: "MAINTAINABILITY",
        severity: "HIGH",
        title:
          "Engineering quality score is low",
        description:
          "The repository intelligence indicates weaknesses that may increase maintenance cost or defect risk.",
        evidence: [
          `Engineering quality score: ${qualityScore}/100`,
        ],
        recommendation:
          "Review testing coverage, module cohesion, error handling, type safety, documentation and repeated implementation patterns.",
      })
    );
  }

  if (
    repository.architectureChanges.length >= 40
  ) {
    findings.push(
      createFinding({
        key: "high-architecture-change-volume",
        kind: "IMPROVEMENT",
        category: "MAINTAINABILITY",
        severity: "MEDIUM",
        title:
          "High architecture change volume detected",
        description:
          "The repository has accumulated a large number of architecture changes in the analysed history.",
        evidence: [
          `${repository.architectureChanges.length} recent architecture changes were analysed.`,
        ],
        recommendation:
          "Review whether repeated changes indicate healthy evolution or unstable ownership and module boundaries.",
      })
    );
  }

  return findings;
};

const buildObservabilityConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const observabilityDetected =
    hasCapability(signals, [
      "monitoring",
      "metrics",
      "logging",
      "tracing",
      "observability",
      "health check",
    ]) ||
    hasTechnology(signals, [
      "prometheus",
      "grafana",
      "opentelemetry",
      "sentry",
      "datadog",
    ]);

  if (!observabilityDetected) {
    findings.push(
      createFinding({
        key: "observability-not-detected",
        kind: "UNVERIFIED",
        category: "OBSERVABILITY",
        severity: "HIGH",
        title:
          "Observability capability was not detected",
        description:
          "ArcHive could not confirm structured logging, metrics, tracing or monitoring from the available intelligence.",
        evidence: [
          "No monitoring, metrics, tracing or observability signal was found.",
        ],
        recommendation:
          "Add structured logs, health indicators and operational metrics. Introduce distributed tracing where requests cross service or worker boundaries.",
      })
    );
  }

  return findings;
};

const buildDataConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const hasDatabase = hasTechnology(signals, [
    "postgres",
    "mysql",
    "mongodb",
    "prisma",
    "sequelize",
    "typeorm",
    "database",
  ]);

  if (
    hasDatabase &&
    !hasCapability(signals, [
      "migration",
      "backup",
      "reconciliation",
      "audit",
    ])
  ) {
    findings.push(
      createFinding({
        key: "database-governance-review",
        kind: "UNVERIFIED",
        category: "DATA",
        severity: "MEDIUM",
        title:
          "Database governance controls should be verified",
        description:
          "A persistence technology was detected, but ArcHive did not identify migration, backup, reconciliation or audit capabilities.",
        evidence: signals.technologies.filter(
          (technology) =>
            containsAny([technology], [
              "postgres",
              "mysql",
              "mongodb",
              "prisma",
              "sequelize",
              "typeorm",
              "database",
            ])
        ),
        recommendation:
          "Confirm schema migration discipline, backup strategy, restore testing and sensitive-data handling.",
      })
    );
  }

  return findings;
};

const buildDeliveryConcerns = ({
  signals,
}: {
  signals: AdvisorSignals;
}) => {
  const findings: ArchitectureAdvisorFinding[] =
    [];

  const deliveryDetected =
    hasCapability(signals, [
      "ci",
      "continuous integration",
      "continuous delivery",
      "deployment",
    ]) ||
    hasTechnology(signals, [
      "github actions",
      "jenkins",
      "circleci",
      "gitlab ci",
    ]);

  if (!deliveryDetected) {
    findings.push(
      createFinding({
        key: "delivery-automation-not-detected",
        kind: "UNVERIFIED",
        category: "DELIVERY",
        severity: "MEDIUM",
        title:
          "Delivery automation was not detected",
        description:
          "The repository intelligence does not currently show a continuous integration or delivery workflow.",
        evidence: [
          "No CI or delivery automation signal was found.",
        ],
        recommendation:
          "Automate build validation, tests and deployment checks before changes are released.",
      })
    );
  }

  return findings;
};

const convertActiveRecommendations = (
  repository: RepositoryAdvisorSource
) => {
  return repository.engineeringRecommendations.map(
    (recommendation) =>
      createFinding({
        key: `existing-${recommendation.recommendationKey}`,
        kind: "IMPROVEMENT",
        category: "ENGINEERING_QUALITY",
        severity: "MEDIUM",
        title: recommendation.title,
        description: recommendation.description,
        evidence: recommendation.evidence
          ? [recommendation.evidence]
          : [
            "Existing ArcHive engineering recommendation.",
          ],
        recommendation:
          recommendation.description,
      })
  );
};

const buildFindingBuckets = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}): FindingBuckets => {
  const maintainabilityConcerns = [
    ...buildMaintainabilityConcerns({
      repository,
      signals,
    }),

    ...convertActiveRecommendations(repository),
  ];

  return {
    strengths: buildStrengths({
      repository,
      signals,
    }),

    architectureConcerns:
      buildArchitectureConcerns({
        signals,
      }),

    productionRisks: buildProductionRisks({
      repository,
      signals,
    }),

    securityObservations:
      buildSecurityObservations({
        signals,
      }),

    scalabilityConcerns:
      buildScalabilityConcerns({
        signals,
      }),

    reliabilityConcerns:
      buildReliabilityConcerns({
        signals,
      }),

    maintainabilityConcerns,

    observabilityConcerns:
      buildObservabilityConcerns({
        signals,
      }),

    dataConcerns: buildDataConcerns({
      signals,
    }),

    deliveryConcerns:
      buildDeliveryConcerns({
        signals,
      }),
  };
};

const getAllConcerns = (
  buckets: FindingBuckets
) => {
  return [
    ...buckets.architectureConcerns,
    ...buckets.productionRisks,
    ...buckets.securityObservations,
    ...buckets.scalabilityConcerns,
    ...buckets.reliabilityConcerns,
    ...buckets.maintainabilityConcerns,
    ...buckets.observabilityConcerns,
    ...buckets.dataConcerns,
    ...buckets.deliveryConcerns,
  ];
};

/**
 * Determines whether ArcHive has enough current repository intelligence
 * to make a meaningful Architecture Advisor judgement.
 *
 * Future me:
 * Missing evidence must never be treated as negative evidence.
 * A repository can be newly imported, partially analysed, or waiting for
 * its first intelligence snapshot. In those cases we should lower our
 * confidence instead of pretending the repository is risky.
 */
const hasSufficientAdvisorEvidence = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  const availableScores = [
    signals.scores.maturityScore,
    signals.scores.architectureScore,
    signals.scores.capabilityScore,
    signals.scores.engineeringQualityScore,
    signals.scores.productionReadinessScore,
  ].filter(
    (score): score is number =>
      score !== null
  );

  const hasStructuredSnapshot =
    Boolean(signals.snapshotId);

  const hasMeaningfulCurrentSignals =
    signals.technologies.length >= 3 &&
    (
      signals.architectureDomains.length > 0 ||
      signals.repositoryTypes.length > 0 ||
      signals.capabilities.length > 0
    );

  const hasScoredEvidence =
    availableScores.length >= 2;

  /*
   * A historical ArchitectureChange by itself is not enough.
   * Advisor evaluates current repository state, so current structured
   * intelligence must be available before we publish a numeric judgement.
   */
  return (
    hasStructuredSnapshot &&
    (
      hasMeaningfulCurrentSignals ||
      hasScoredEvidence
    )
  );
};

const calculateOverallRiskScore = (
  findings: ArchitectureAdvisorFinding[],
  scores: ArchitectureAdvisorScores
) => {
  /**
   * Only confirmed adverse conditions are allowed to contribute
   * direct finding-risk points.
   *
   * Future me:
   * - STRENGTH describes positive evidence.
   * - IMPROVEMENT describes an opportunity or derived assessment.
   * - UNVERIFIED means ArcHive could not confirm something.
   *
   * None of those should inflate repository risk.
   *
   * CONFIRMED_RISK requires affirmative evidence of a problematic
   * engineering condition.
   */
  const findingRisk =
    findings
      .filter(
        (finding) =>
          finding.kind === "CONFIRMED_RISK",
      )
      .reduce(
        (total, finding) =>
          total +
          severityWeight[finding.severity],
        0,
      );

  const normalizedFindingRisk = Math.min(
    65,
    findingRisk
  );

  /**
   * Future me:
   * null means "ArcHive does not know yet".
   *
   * It must not mean:
   * "therefore add risk".
   *
   * Missing evidence should reduce confidence, not increase risk.
   */
  const readinessPenalty =
    scores.productionReadinessScore === null
      ? 0
      : (100 -
        scores.productionReadinessScore) *
      0.2;

  const architecturePenalty =
    scores.architectureScore === null
      ? 0
      : (100 -
        scores.architectureScore) *
      0.15;

  return clampScore(
    normalizedFindingRisk +
    readinessPenalty +
    architecturePenalty
  );
};



const calculateConfidenceScore = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  let confidence = 20;

  if (signals.snapshotId) {
    confidence += 35;
  }

  if (
    signals.scores.confidenceScore !== null
  ) {
    confidence +=
      signals.scores.confidenceScore * 0.25;
  }

  confidence += Math.min(
    repository.architectureChanges.length * 2,
    15
  );

  confidence += Math.min(
    signals.technologies.length,
    10
  );

  return clampScore(confidence);
};

const getMaturityLabel = (
  scores: ArchitectureAdvisorScores,
  evidenceIsSufficient: boolean
) => {
  if (!evidenceIsSufficient) {
    return "INSUFFICIENT_EVIDENCE";
  }
  const availableScores = [
    scores.maturityScore,
    scores.architectureScore,
    scores.capabilityScore,
    scores.engineeringQualityScore,
    scores.productionReadinessScore,
  ].filter(
    (score): score is number =>
      score !== null
  );

  if (availableScores.length === 0) {
    return "EMERGING";
  }

  const average =
    availableScores.reduce(
      (total, score) => total + score,
      0
    ) / availableScores.length;

  if (average >= 85) {
    return "ADVANCED";
  }

  if (average >= 70) {
    return "MATURE";
  }

  if (average >= 50) {
    return "DEVELOPING";
  }

  return "EMERGING";
};


const buildOverallAssessment = ({
  repository,
  riskScore,
  maturityLabel,
  concernCount,
  criticalCount,
  highCount,
  evidenceIsSufficient,
}: {
  repository: RepositoryAdvisorSource;
  riskScore: number;
  maturityLabel: string;
  concernCount: number;
  criticalCount: number;
  highCount: number;
  evidenceIsSufficient: boolean;
}) => {
  if (!evidenceIsSufficient) {
    return `${repository.name} does not yet have enough repository intelligence for a reliable architecture risk assessment. Process the repository or allow additional engineering evidence to accumulate before treating Advisor findings as authoritative.`;
  }

  if (criticalCount > 0) {
    return `${repository.name} has a ${maturityLabel.toLowerCase()} engineering profile, but ArcHive detected ${criticalCount} critical architecture or production concern${criticalCount === 1 ? "" : "s"
      }. These issues should be addressed before the repository is treated as operationally resilient.`;
  }

  if (highCount > 0) {
    return `${repository.name} has a ${maturityLabel.toLowerCase()} engineering profile with ${highCount} high-priority concern${highCount === 1 ? "" : "s"
      }. The repository has a workable foundation, but targeted improvements are required to reduce engineering and operational risk.`;
  }

  if (concernCount > 0) {
    return `${repository.name} has a ${maturityLabel.toLowerCase()} engineering profile. ArcHive identified ${concernCount} improvement area${concernCount === 1 ? "" : "s"
      }, with an overall risk score of ${riskScore}/100.`;
  }

  return `${repository.name} has a ${maturityLabel.toLowerCase()} engineering profile with no major architecture risks detected from the currently available evidence.`;
};

const buildActions = (
  findings: ArchitectureAdvisorFinding[]
) => {
  const actionableFindings = findings.filter(
    (finding) => finding.recommendation
  );

  return actionableFindings
    .sort((a, b) => {
      const severityDifference =
        severityPriority[b.severity] -
        severityPriority[a.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return a.title.localeCompare(b.title);
    })
    .map(
      (
        finding,
        index
      ): ArchitectureAdvisorAction => ({
        key: `action-${finding.key}`,
        priority: index + 1,
        severity: finding.severity,
        category: finding.category,
        title: finding.title,
        description:
          finding.recommendation ||
          finding.description,
        rationale: finding.description,
      })
    );
};

const buildEvidenceSummary = ({
  repository,
  signals,

}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}): ArchitectureAdvisorEvidenceSummary => {
  return {
    evidenceSufficient:
      hasSufficientAdvisorEvidence({
        repository,
        signals,
      }),

    intelligenceSnapshotAvailable:
      Boolean(signals.snapshotId),

    intelligenceSnapshotCreatedAt:
      signals.snapshotCreatedAt,

    architectureChangeCount:
      repository.architectureChanges.length,

    activeRecommendationCount:
      repository.engineeringRecommendations
        .length,

    technologyCount:
      signals.technologies.length,

    architectureDomainCount:
      signals.architectureDomains.length,

    repositoryTypeCount:
      signals.repositoryTypes.length,

    capabilityCount:
      signals.capabilities.length,
  };
};

const parseJsonArray = <T>(
  value: Prisma.JsonValue
): T[] => {
  return Array.isArray(value)
    ? (value as T[])
    : [];
};

const buildAssessmentResponse = ({
  snapshot,
  repository,
  signals,
}: {
  snapshot: {
    id: string;
    overallAssessment: string;
    maturityLabel: string;
    strengths: Prisma.JsonValue;
    architectureConcerns: Prisma.JsonValue;
    productionRisks: Prisma.JsonValue;
    securityObservations: Prisma.JsonValue;
    scalabilityConcerns: Prisma.JsonValue;
    reliabilityConcerns: Prisma.JsonValue;
    maintainabilityConcerns: Prisma.JsonValue;
    observabilityConcerns: Prisma.JsonValue;
    dataConcerns: Prisma.JsonValue;
    deliveryConcerns: Prisma.JsonValue;
    priorityActions: Prisma.JsonValue;
    recommendedNextSteps: Prisma.JsonValue;
    evidenceSummary: Prisma.JsonValue;
    overallRiskScore: number;
    confidenceScore: number;
    sourceIntelligenceSnapshotId:
    | string
    | null;
    generatedAt: Date;
  };

  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}): ArchitectureAdvisorAssessment => {
  return {
    id: snapshot.id,

    repository: {
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
      description: repository.description,
      language: repository.language,
      defaultBranch:
        repository.defaultBranch,
      isTracked: repository.isTracked,
      updatedAt: repository.updatedAt,
    },

    overallAssessment:
      snapshot.overallAssessment,

    maturityLabel: snapshot.maturityLabel,

    overallRiskScore:
      snapshot.overallRiskScore,

    confidenceScore:
      snapshot.confidenceScore,

    scores: signals.scores,

    technologies: signals.technologies,

    architectureDomains:
      signals.architectureDomains,

    repositoryTypes:
      signals.repositoryTypes,

    capabilities: signals.capabilities,

    strengths: parseJsonArray(
      snapshot.strengths
    ),

    architectureConcerns: parseJsonArray(
      snapshot.architectureConcerns
    ),

    productionRisks: parseJsonArray(
      snapshot.productionRisks
    ),

    securityObservations: parseJsonArray(
      snapshot.securityObservations
    ),

    scalabilityConcerns: parseJsonArray(
      snapshot.scalabilityConcerns
    ),

    reliabilityConcerns: parseJsonArray(
      snapshot.reliabilityConcerns
    ),

    maintainabilityConcerns: parseJsonArray(
      snapshot.maintainabilityConcerns
    ),

    observabilityConcerns: parseJsonArray(
      snapshot.observabilityConcerns
    ),

    dataConcerns: parseJsonArray(
      snapshot.dataConcerns
    ),

    deliveryConcerns: parseJsonArray(
      snapshot.deliveryConcerns
    ),

    priorityActions: parseJsonArray(
      snapshot.priorityActions
    ),

    recommendedNextSteps: parseJsonArray(
      snapshot.recommendedNextSteps
    ),

    evidenceSummary:
      snapshot.evidenceSummary as unknown as ArchitectureAdvisorEvidenceSummary,

    sourceIntelligenceSnapshotId:
      snapshot.sourceIntelligenceSnapshotId,

    generatedAt: snapshot.generatedAt,
  };
};

/**
 * Builds Advisor findings only when the current repository intelligence is
 * strong enough to make absence meaningful.
 *
 * Future me:
 * "Not detected" is not the same thing as "confirmed absent".
 */
const buildEvidenceAwareFindingBuckets = ({
  repository,
  signals,
}: {
  repository: RepositoryAdvisorSource;
  signals: AdvisorSignals;
}) => {
  const evidenceIsSufficient =
    hasSufficientAdvisorEvidence({
      repository,
      signals,
    });

  if (!evidenceIsSufficient) {
    return {
      evidenceIsSufficient,

      buckets: {
        strengths: [],
        architectureConcerns: [],
        productionRisks: [],
        securityObservations: [],
        scalabilityConcerns: [],
        reliabilityConcerns: [],
        maintainabilityConcerns: [],
        observabilityConcerns: [],
        dataConcerns: [],
        deliveryConcerns: [],
      } satisfies FindingBuckets,
    };
  }

  return {
    evidenceIsSufficient,

    buckets: buildFindingBuckets({
      repository,
      signals,
    }),
  };
};

const createAdvisorAssessment = async (
  repository: RepositoryAdvisorSource
) => {
  const signals = extractSignals(
    repository
  );

  const {
    evidenceIsSufficient,
    buckets,
  } = buildEvidenceAwareFindingBuckets({
    repository,
    signals,
  });

  const concerns = getAllConcerns(
    buckets
  );

  const overallRiskScore =
    evidenceIsSufficient
      ? calculateOverallRiskScore(
        concerns,
        signals.scores
      )
      : 0;

  const confidenceScore =
    calculateConfidenceScore({
      repository,
      signals,
    });

  const maturityLabel =
    getMaturityLabel(
      signals.scores,
      evidenceIsSufficient
    );

  const criticalCount = concerns.filter(
    (finding) =>
      finding.severity === "CRITICAL"
  ).length;

  const highCount = concerns.filter(
    (finding) => finding.severity === "HIGH"
  ).length;

  const priorityActions = buildActions(
    concerns
  );

  const recommendedNextSteps =
    priorityActions.slice(0, 10);

  const evidenceSummary =
    buildEvidenceSummary({
      repository,
      signals,
    });

  const overallAssessment =
    buildOverallAssessment({
      repository,
      riskScore: overallRiskScore,
      maturityLabel,
      concernCount: concerns.length,
      criticalCount,
      highCount,
      evidenceIsSufficient,
    });

  const snapshot =
    await prisma.architectureAdvisorSnapshot.create(
      {
        data: {
          repositoryId: repository.id,

          overallAssessment,
          maturityLabel,

          strengths:
            buckets.strengths as unknown as Prisma.InputJsonValue,

          architectureConcerns:
            buckets.architectureConcerns as unknown as Prisma.InputJsonValue,

          productionRisks:
            buckets.productionRisks as unknown as Prisma.InputJsonValue,

          securityObservations:
            buckets.securityObservations as unknown as Prisma.InputJsonValue,

          scalabilityConcerns:
            buckets.scalabilityConcerns as unknown as Prisma.InputJsonValue,

          reliabilityConcerns:
            buckets.reliabilityConcerns as unknown as Prisma.InputJsonValue,

          maintainabilityConcerns:
            buckets.maintainabilityConcerns as unknown as Prisma.InputJsonValue,

          observabilityConcerns:
            buckets.observabilityConcerns as unknown as Prisma.InputJsonValue,

          dataConcerns:
            buckets.dataConcerns as unknown as Prisma.InputJsonValue,

          deliveryConcerns:
            buckets.deliveryConcerns as unknown as Prisma.InputJsonValue,

          priorityActions:
            priorityActions as unknown as Prisma.InputJsonValue,

          recommendedNextSteps:
            recommendedNextSteps as unknown as Prisma.InputJsonValue,

          evidenceSummary:
            evidenceSummary as unknown as Prisma.InputJsonValue,

          overallRiskScore,
          confidenceScore,

          sourceIntelligenceSnapshotId:
            signals.snapshotId,
        },
      }
    );

  return buildAssessmentResponse({
    snapshot,
    repository,
    signals,
  });
};

export const architectureAdvisorService = {
  async getLatestAssessment(
    repositoryId: string
  ): Promise<ArchitectureAdvisorAssessment | null> {
    const repository =
      await loadRepository(repositoryId);

    if (!repository) {
      return null;
    }

    const signals = extractSignals(repository);

    const snapshot =
      await prisma.architectureAdvisorSnapshot.findFirst(
        {
          where: {
            repositoryId,
          },

          orderBy: {
            generatedAt: "desc",
          },
        }
      );

    /*
     * The first read creates a baseline automatically. This means the
     * frontend can open the advisor page without requiring a separate setup
     * action, while later refreshes remain explicit and auditable.
     */
    if (!snapshot) {
      return createAdvisorAssessment(
        repository
      );
    }

    return buildAssessmentResponse({
      snapshot,
      repository,
      signals,
    });
  },

  async refreshAssessment(
    repositoryId: string
  ): Promise<ArchitectureAdvisorAssessment | null> {
    const repository =
      await loadRepository(repositoryId);

    if (!repository) {
      return null;
    }

    return createAdvisorAssessment(repository);
  },

  async getAssessmentHistory(
    repositoryId: string
  ): Promise<
    ArchitectureAdvisorHistoryItem[] | null
  > {
    const repositoryExists =
      await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },

        select: {
          id: true,
        },
      });

    if (!repositoryExists) {
      return null;
    }

    return prisma.architectureAdvisorSnapshot.findMany(
      {
        where: {
          repositoryId,
        },

        orderBy: {
          generatedAt: "desc",
        },

        take: 50,

        select: {
          id: true,
          repositoryId: true,
          overallAssessment: true,
          maturityLabel: true,
          overallRiskScore: true,
          confidenceScore: true,
          generatedAt: true,
        },
      }
    );
  },

  async getRepositoryOwnerId(
    repositoryId: string
  ) {
    const repository =
      await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },

        select: {
          userId: true,
        },
      });

    return repository?.userId ?? null;
  },
};

/**
 * Internal regression-test surface.
 *
 * Future me:
 * These functions are exported only so the Advisor's scoring semantics can
 * be regression-tested without involving Prisma or the HTTP layer.
 *
 * Do not use this object from application code.
 */
export const __architectureAdvisorTestUtils = {
  hasSufficientAdvisorEvidence,
  buildEvidenceAwareFindingBuckets,
  calculateOverallRiskScore,
  getMaturityLabel,
};