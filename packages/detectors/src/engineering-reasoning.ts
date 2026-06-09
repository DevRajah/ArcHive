export type EngineeringRecommendationOutput = {
  key: string;
  title: string;
  description: string;
  resolvesWhenDomainAppears?: string;
};

export type EngineeringReasoningInput = {
  capabilities: Record<string, boolean>;
  domains: string[];
  technologies: string[];
  repositoryTypes: string[];
  architectureStyles: string[];
};

export const generateEngineeringReasoning = ({
  capabilities,
  domains,
  technologies,
  repositoryTypes,
  architectureStyles,
}: EngineeringReasoningInput) => {
  const observations: string[] = [];
  const risks: string[] = [];
  const recommendations: EngineeringRecommendationOutput[] = [];
  const strengths: string[] = [];

  if (capabilities.realtimeSystems) {
    strengths.push("Realtime communication infrastructure is present.");
    observations.push(
      "The repository shows signals of live event-driven user or system updates."
    );
  }

  if (capabilities.queueInfrastructure) {
    strengths.push("Queue-backed background processing is present.");
    observations.push(
      "The repository appears to separate long-running work from request-response flows."
    );
  }

  if (capabilities.databaseLayer) {
    strengths.push(
      "Persistent data storage or database schema evolution is visible."
    );
  }

  if (capabilities.architectureIntelligence) {
    strengths.push(
      "Repository intelligence and architecture analysis systems are present."
    );
  }

  if (capabilities.realtimeSystems && !capabilities.cachingLayer) {
    risks.push(
      "Realtime systems are present, but caching/session infrastructure is not strongly visible."
    );

    recommendations.push({
      key: "ADD_REALTIME_CACHING",
      title: "Improve realtime scaling support",
      description:
        "Consider adding or documenting Redis/session/caching infrastructure for realtime scaling.",
      resolvesWhenDomainAppears: "CACHING_LAYER",
    });
  }

  if (
    capabilities.queueInfrastructure &&
    !domains.includes("OBSERVABILITY_SYSTEMS")
  ) {
    risks.push(
      "Queue infrastructure is present, but observability signals are weak."
    );

    recommendations.push({
      key: "ADD_QUEUE_OBSERVABILITY",
      title: "Improve queue observability",
      description:
        "Add queue metrics, worker health, failed job visibility, or operational monitoring.",
      resolvesWhenDomainAppears: "OBSERVABILITY_SYSTEMS",
    });
  }

  if (capabilities.apiLayer && !capabilities.authentication) {
    risks.push(
      "API infrastructure is present, but authentication or authorization signals are weak."
    );

    recommendations.push({
      key: "DOCUMENT_API_AUTH_BOUNDARIES",
      title: "Strengthen API authentication visibility",
      description:
        "Document or implement authentication boundaries if the API is exposed to users or services.",
      resolvesWhenDomainAppears: "AUTHENTICATION",
    });
  }

  if (
    repositoryTypes.includes("FINTECH_PLATFORM") &&
    !domains.includes("SECURITY_SYSTEMS")
  ) {
    risks.push(
      "Financial infrastructure signals are present, but security/risk controls are not strongly detected."
    );

    recommendations.push({
      key: "ADD_FINTECH_SECURITY_CONTROLS",
      title: "Strengthen financial infrastructure safety",
      description:
        "Add audit controls, fraud checks, idempotency, access control, and reconciliation safety documentation.",
      resolvesWhenDomainAppears: "SECURITY_SYSTEMS",
    });
  }

  if (
    repositoryTypes.includes("OBSERVABILITY_PLATFORM") &&
    !capabilities.realtimeSystems
  ) {
    recommendations.push({
      key: "ADD_OBSERVABILITY_REALTIME_UPDATES",
      title: "Add realtime operational updates",
      description:
        "For observability platforms, realtime streaming or live dashboard updates may improve operational usefulness.",
      resolvesWhenDomainAppears: "REALTIME_SYSTEMS",
    });
  }

  if (
    repositoryTypes.includes("DEVTOOL_PLATFORM") &&
    !technologies.some((tech) => tech.toLowerCase().includes("documentation"))
  ) {
    recommendations.push({
      key: "ADD_DEVTOOL_DOCUMENTATION",
      title: "Improve developer tooling documentation",
      description:
        "Developer tooling repositories benefit from strong usage examples, CLI documentation, and generated output demos.",
      resolvesWhenDomainAppears: "DOCUMENTATION_SYSTEM",
    });
  }

  if (
    architectureStyles.includes("QUEUE_DRIVEN") &&
    architectureStyles.includes("REALTIME_PLATFORM")
  ) {
    observations.push(
      "The repository combines asynchronous background processing with realtime feedback loops."
    );
  }

  const maturitySignal =
    strengths.length >= 4
      ? "ADVANCED"
      : strengths.length >= 2
        ? "EMERGING"
        : "EARLY";

  return {
    maturitySignal,
    strengths: Array.from(new Set(strengths)),
    observations: Array.from(new Set(observations)),
    risks: Array.from(new Set(risks)),
    recommendations,
  };
};