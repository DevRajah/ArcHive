import { formatFilterLabel } from "@/lib/filters";

export interface RepositoryPurposeDetails {
  title: string;
  category: string;
  description: string;
}

/**
 * Frontend presentation metadata for repository purposes.
 *
 * Important:
 * This map does NOT classify repositories.
 *
 * The backend intelligence engine is the source of truth for the
 * repository's canonical purpose. The frontend only converts that
 * canonical value into human-friendly copy.
 */
export const repositoryPurposeMap: Record<
  string,
  RepositoryPurposeDetails
> = {
  ENGINEERING_INTELLIGENCE_PLATFORM: {
    title: "Engineering Intelligence Platform",
    category: "Engineering Intelligence",
    description:
      "Repository intelligence, engineering analytics, architecture evolution, codebase intelligence, and repository analysis platform.",
  },

  FINTECH_PLATFORM: {
    title: "Fintech Platform",
    category: "Financial Technology",
    description:
      "Financial platform implementing payment, ledger, reconciliation, settlement, or transaction-processing workflows.",
  },

  DEVTOOL_PLATFORM: {
    title: "Developer Tool Platform",
    category: "Developer Tooling",
    description:
      "Developer tooling platform providing CLI, scaffolding, generation, automation, or engineering workflow capabilities.",
  },

  OBSERVABILITY_PLATFORM: {
    title: "Observability Platform",
    category: "Observability",
    description:
      "Engineering platform focused on monitoring, telemetry, metrics, logging, tracing, queue visibility, or operational system health.",
  },

  SECURITY_PLATFORM: {
    title: "Security Platform",
    category: "Security Engineering",
    description:
      "Security-focused platform implementing threat detection, fraud analysis, access protection, vulnerability monitoring, or security automation.",
  },

  AI_ML_PROJECT: {
    title: "AI / ML Project",
    category: "Artificial Intelligence",
    description:
      "Software project implementing artificial intelligence, machine learning, model inference, intelligent automation, or AI-powered workflows.",
  },

  DEVELOPER_PLATFORM: {
    title: "Developer Platform",
    category: "Developer Infrastructure",
    description:
      "Platform providing reusable infrastructure, APIs, services, workflows, or capabilities used by software engineering teams.",
  },

  DATA_ENGINEERING_PROJECT: {
    title: "Data Engineering Project",
    category: "Data Engineering",
    description:
      "Data-focused system implementing ingestion, transformation, pipelines, analytics processing, storage, or data infrastructure.",
  },

  SMART_TRANSPORT_PLATFORM: {
    title: "Smart Transport Platform",
    category: "Transport Technology",
    description:
      "Transport intelligence platform implementing routing, journey analysis, delay processing, mobility data, or transport optimisation.",
  },

  ENERGY_PLATFORM: {
    title: "Energy Platform",
    category: "Energy Technology",
    description:
      "Energy-focused platform implementing consumption monitoring, smart-meter analytics, optimisation, forecasting, or sustainability intelligence.",
  },

  HEALTHCARE_PLATFORM: {
    title: "Healthcare Platform",
    category: "Healthcare Technology",
    description:
      "Healthcare technology platform implementing clinical, patient, health-data, care-delivery, or healthcare operational workflows.",
  },

  ECOMMERCE_PLATFORM: {
    title: "E-commerce Platform",
    category: "Commerce",
    description:
      "Commerce platform implementing products, orders, checkout, payments, fulfilment, inventory, or online retail workflows.",
  },

  EDUCATION_PLATFORM: {
    title: "Education Platform",
    category: "Education Technology",
    description:
      "Education technology platform supporting learning, mentorship, assessment, course delivery, student workflows, or educational collaboration.",
  },

  COLLABORATION_PLATFORM: {
    title: "Collaboration Platform",
    category: "Collaboration",
    description:
      "Collaborative software platform supporting shared workspaces, communication, real-time coordination, document collaboration, or team workflows.",
  },

  INFRASTRUCTURE_PLATFORM: {
    title: "Infrastructure Platform",
    category: "Infrastructure",
    description:
      "Engineering infrastructure platform providing deployment, orchestration, cloud, networking, runtime, automation, or platform operations capabilities.",
  },

  MOBILE_APPLICATION: {
    title: "Mobile Application",
    category: "Mobile Engineering",
    description:
      "Application primarily designed for mobile devices using native or cross-platform mobile technologies.",
  },

  BACKEND_SERVICE: {
    title: "Backend Service",
    category: "Backend Engineering",
    description:
      "Backend application providing APIs, business logic, persistence, asynchronous processing, or server-side application capabilities.",
  },

  FRONTEND_APPLICATION: {
    title: "Frontend Application",
    category: "Frontend Engineering",
    description:
      "Browser-facing application implementing user interfaces, client-side interactions, and frontend product experiences.",
  },

  PACKAGE_LIBRARY: {
    title: "Package / Library",
    category: "Developer Libraries",
    description:
      "Reusable software package, SDK, framework, library, or published module designed for consumption by other applications.",
  },

  MESSAGING_PLATFORM: {
    title: "Messaging Platform",
    category: "Messaging Infrastructure",
    description:
      "Messaging or event-driven platform implementing message delivery, queues, brokers, streaming, notifications, or communication infrastructure.",
  },

  DOCUMENTATION_HEAVY_REPOSITORY: {
    title: "Documentation-Heavy Repository",
    category: "Documentation",
    description:
      "Repository primarily focused on technical documentation, guides, reference material, specifications, or knowledge resources.",
  },

  JAVASCRIPT_TYPESCRIPT_PROJECT: {
    title: "JavaScript / TypeScript Project",
    category: "General Software",
    description:
      "General JavaScript or TypeScript engineering project.",
  },

  GENERAL_ENGINEERING_PROJECT: {
    title: "General Software Repository",
    category: "General Software",
    description:
      "General software engineering activity.",
  },
};

/**
 * Determines which repository purpose the UI should display.
 *
 * The canonical repository intelligence identity is authoritative.
 *
 * We intentionally prefer:
 *
 * repositoryIntelligence.identity.primaryRepositoryType
 *
 * over summary and legacy fields because the identity object contains
 * the backend's resolved repository purpose.
 *
 * Older fields are retained only as compatibility fallbacks for reports
 * generated before the canonical intelligence wrapper existed.
 */
export function getPrimaryRepositoryType(data?: {
  summary?: {
    primaryRepositoryType?: string | null;
  };

  repositoryIntelligence?: {
    identity?: {
      primaryRepositoryType?: string | null;
      repositoryTypes?: string[];
    };
  };

  legacy?: {
    repositoryTypes?: string[];
  };
}) {
  const canonicalPrimaryType =
    data?.repositoryIntelligence?.identity
      ?.primaryRepositoryType;

  if (canonicalPrimaryType) {
    return canonicalPrimaryType;
  }

  const canonicalRepositoryTypes =
    data?.repositoryIntelligence?.identity
      ?.repositoryTypes;

  if (
    Array.isArray(canonicalRepositoryTypes) &&
    canonicalRepositoryTypes.length > 0
  ) {
    return canonicalRepositoryTypes[0];
  }

  /*
   * Compatibility only.
   *
   * These fields should never override canonical repository intelligence.
   */
  if (data?.summary?.primaryRepositoryType) {
    return data.summary.primaryRepositoryType;
  }

  if (
    Array.isArray(
      data?.legacy?.repositoryTypes,
    ) &&
    data.legacy.repositoryTypes.length > 0
  ) {
    return data.legacy.repositoryTypes[0];
  }

  return null;
}

/**
 * Converts the backend canonical purpose into presentation copy.
 *
 * Unknown future repository types are displayed using their backend
 * value rather than being incorrectly converted into JavaScript /
 * TypeScript Project.
 */
export function getPurposeDetails(
  primaryType?: string | null,
): RepositoryPurposeDetails {
  if (!primaryType) {
    return {
      title: "General Software Repository",
      category: "General Software",
      description:
        "ArcHive has not resolved a canonical repository purpose yet.",
    };
  }

  const mappedPurpose =
    repositoryPurposeMap[primaryType];

  if (mappedPurpose) {
    return mappedPurpose;
  }

  return {
    title: formatFilterLabel(primaryType),
    category: "Repository Intelligence",
    description:
      "Repository purpose was classified by ArcHive using backend intelligence signals.",
  };
}

/**
 * The backend may return reasoning signals as either arrays or
 * comma-separated historical values.
 *
 * Normalising here is purely a rendering concern. It does not affect
 * repository classification.
 */
export function normalizeReasoningSignals(
  value: unknown,
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      normalizeReasoningSignals(item),
    );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}