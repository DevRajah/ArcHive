import { formatFilterLabel } from "@/lib/filters";

export const repositoryPurposeMap: Record<
  string,
  { title: string; category: string; description: string }
> = {
  ENGINEERING_INTELLIGENCE_PLATFORM: {
    title: "Engineering Intelligence Platform",
    category: "Engineering Intelligence",
    description:
      "Repository intelligence, engineering analytics, architecture evolution, codebase intelligence, and repository analysis platform.",
  },

  DEVTOOL_PLATFORM: {
    title: "Developer Tooling",
    category: "Developer Tooling",
    description:
      "CLI, scaffolding, code generation, or developer automation tooling.",
  },

  FINTECH_PLATFORM: {
    title: "Financial Infrastructure",
    category: "Fintech",
    description:
      "Payment, ledger, reconciliation, or audit workflow infrastructure.",
  },

  JAVASCRIPT_TYPESCRIPT_PROJECT: {
    title: "JavaScript / TypeScript Project",
    category: "General Software",
    description: "General JavaScript or TypeScript engineering project.",
  },

  GENERAL_ENGINEERING_PROJECT: {
    title: "General Software Repository",
    category: "General Software",
    description: "General software engineering activity.",
  },
};

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
  return (
    data?.summary?.primaryRepositoryType ||
    data?.repositoryIntelligence?.identity?.primaryRepositoryType ||
    data?.repositoryIntelligence?.identity?.repositoryTypes?.[0] ||
    data?.legacy?.repositoryTypes?.[0] ||
    null
  );
}

export function getPurposeDetails(primaryType?: string | null) {
  if (!primaryType) {
    return {
      title: "General Software Repository",
      category: "General Software",
      description: "General software engineering activity.",
    };
  }

  return (
    repositoryPurposeMap[primaryType] || {
      title: formatFilterLabel(primaryType),
      category: "Repository Intelligence",
      description:
        "Repository purpose was classified by ArcHive using backend intelligence signals.",
    }
  );
}

export function normalizeReasoningSignals(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeReasoningSignals(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}