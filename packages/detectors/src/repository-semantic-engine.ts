export type RepositorySemanticCapability = {
  key: string;
  confidence?: number;
};

export type RepositorySemanticInput = {
  repositoryName: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  reasoningSignals: string[];

  /**
   * Canonical capability intelligence is optional because some older
   * semantic-profile consumers still operate from domain-level evidence.
   *
   * Future me:
   * When a caller has access to RepositoryIntelligenceSnapshot capability
   * data, pass it here. Semantic signals should prefer the complete current
   * intelligence model rather than assuming architecture domains are the
   * only evidence for an engineering capability.
   */
  capabilities?: RepositorySemanticCapability[];
};

export const generateRepositorySemanticProfile = ({
  repositoryName,
  fullName,
  description,
  language,
  repositoryTypes,
  domains,
  technologies,
  reasoningSignals,
  capabilities = [],
}: RepositorySemanticInput) => {
  const context = [
    repositoryName,
    fullName,
    description,
    language,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let semanticCategory =
    "GENERAL_SOFTWARE";

  let semanticLabel =
    "General Software Repository";

  let semanticDescription =
    "A general software repository with limited domain-specific signals.";

  if (
    repositoryTypes.includes(
      "FINTECH_PLATFORM",
    ) ||
    context.includes("ledger") ||
    context.includes("payment") ||
    context.includes("reconciliation")
  ) {
    semanticCategory =
      "FINTECH_INFRASTRUCTURE";

    semanticLabel =
      "Financial Infrastructure";

    semanticDescription =
      "A repository focused on payments, ledgers, reconciliation, audit workflows, or financial processing infrastructure.";
  } else if (
    repositoryTypes.includes(
      "DEVTOOL_PLATFORM",
    ) ||
    context.includes("forge") ||
    context.includes("scaffold") ||
    context.includes("cli") ||
    context.includes("generator")
  ) {
    semanticCategory =
      "DEVELOPER_TOOLING";

    semanticLabel =
      "Developer Tooling";

    semanticDescription =
      "A repository focused on developer automation, CLI tooling, scaffolding, templates, code generation, or backend project generation.";
  } else if (
    repositoryTypes.includes(
      "OBSERVABILITY_PLATFORM",
    ) ||
    context.includes("monitoring") ||
    context.includes("observability") ||
    context.includes("metrics")
  ) {
    semanticCategory =
      "OBSERVABILITY";

    semanticLabel =
      "Observability Platform";

    semanticDescription =
      "A repository focused on monitoring, queue visibility, telemetry, operational dashboards, or system health intelligence.";
  } else if (
    repositoryTypes.includes(
      "SECURITY_PLATFORM",
    ) ||
    context.includes("fraud") ||
    context.includes("security") ||
    context.includes("risk")
  ) {
    semanticCategory =
      "SECURITY_INTELLIGENCE";

    semanticLabel =
      "Security Intelligence";

    semanticDescription =
      "A repository focused on fraud detection, security monitoring, anomaly detection, risk scoring, or threat intelligence.";
  } else if (
    repositoryTypes.includes(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
    ) ||
    context.includes(
      "architecture intelligence",
    ) ||
    context.includes(
      "repository intelligence",
    )
  ) {
    semanticCategory =
      "ENGINEERING_INTELLIGENCE";

    semanticLabel =
      "Engineering Intelligence Platform";

    semanticDescription =
      "A repository focused on analyzing engineering systems, repository evolution, architecture patterns, and software intelligence.";
  }

  const confidenceScore =
    Math.min(
      100,
      repositoryTypes.length * 25 +
        domains.length * 8 +
        technologies.length * 5 +
        reasoningSignals.length * 10,
    );

  const confidenceLevel =
    confidenceScore >= 70
      ? "HIGH"
      : confidenceScore >= 40
        ? "MEDIUM"
        : "LOW";

  /**
   * Capability intelligence and architecture domains describe different
   * dimensions of the repository.
   *
   * A repository can expose an API capability without API_LAYER being one
   * of its dominant architecture domains. The same applies to realtime,
   * queues and databases.
   *
   * Future me:
   * Do not require a capability to also exist as an architecture domain.
   * Either source is sufficient evidence for these semantic booleans.
   */
  const hasCapability = (
    capabilityKey: string,
  ) =>
    capabilities.some(
      (capability) =>
        capability.key ===
        capabilityKey,
    );

  const hasRealtimeSystems =
    domains.includes(
      "REALTIME_SYSTEMS",
    ) ||
    hasCapability(
      "REALTIME_SYSTEMS",
    );

  const hasQueueInfrastructure =
    domains.includes(
      "QUEUE_INFRASTRUCTURE",
    ) ||
    hasCapability(
      "QUEUE_INFRASTRUCTURE",
    );

  const hasApiLayer =
    domains.includes(
      "API_LAYER",
    ) ||
    domains.includes(
      "BACKEND_SYSTEMS",
    ) ||
    hasCapability(
      "API_LAYER",
    );

  const hasDatabaseLayer =
    domains.includes(
      "DATABASE_LAYER",
    ) ||
    hasCapability(
      "DATABASE_LAYER",
    );

  /**
   * Architecture intelligence is slightly different from the operational
   * capabilities above because repository purpose itself is strong evidence
   * that architecture intelligence is part of the repository's semantics.
   */
  const hasArchitectureIntelligence =
    repositoryTypes.includes(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
    ) ||
    domains.includes(
      "ENGINEERING_INTELLIGENCE",
    ) ||
    domains.includes(
      "ARCHITECTURE_INTELLIGENCE",
    ) ||
    hasCapability(
      "ARCHITECTURE_INTELLIGENCE",
    );

  return {
    semanticCategory,
    semanticLabel,
    semanticDescription,

    confidence: {
      confidenceScore,
      confidenceLevel,
    },

    intelligenceProfile: {
      repositoryTypes,
      domains,
      technologies,
      reasoningSignals,
    },

    semanticSignals: {
      hasRealtimeSystems,
      hasQueueInfrastructure,
      hasApiLayer,
      hasDatabaseLayer,
      hasArchitectureIntelligence,
    },
  };
};