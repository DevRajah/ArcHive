export const inferEvolutionDirection = ({
  domains,
  repositoryTypes,
}: {
  domains: string[];
  repositoryTypes: string[];
}) => {
  if (
    repositoryTypes.includes("ENGINEERING_INTELLIGENCE_PLATFORM") ||
    domains.includes("ARCHITECTURE_INTELLIGENCE")
  ) {
    return {
      direction: "ENGINEERING_INTELLIGENCE_EXPANSION",
      label: "Engineering Intelligence Expansion",
      description:
        "The repository is expanding toward architecture analysis, repository reasoning, and engineering intelligence workflows.",
    };
  }

  if (
    repositoryTypes.includes("FINTECH_PLATFORM") ||
    domains.includes("FINANCIAL_SYSTEMS")
  ) {
    return {
      direction: "FINANCIAL_INFRASTRUCTURE_EXPANSION",
      label: "Financial Infrastructure Expansion",
      description:
        "The repository is moving toward payment, ledger, reconciliation, or audit-safe financial workflows.",
    };
  }

  if (
    domains.includes("REALTIME_SYSTEMS") &&
    domains.includes("QUEUE_INFRASTRUCTURE")
  ) {
    return {
      direction: "REALTIME_EVENT_DRIVEN_EXPANSION",
      label: "Realtime Event-Driven Expansion",
      description:
        "The repository is developing realtime and queue-driven infrastructure for asynchronous system behavior.",
    };
  }

  return {
    direction: "GENERAL_ENGINEERING_EVOLUTION",
    label: "General Engineering Evolution",
    description:
      "The repository shows general engineering activity without a strong specialized evolution direction yet.",
  };
};