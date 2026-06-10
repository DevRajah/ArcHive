export type IntelligenceTimelineChange = {
  architectureDomain: string | null;
  detectedTechnology: string | null;
  summary: string;
  evolutionSummary: string | null;
  createdAt: Date;
};

const phaseMap: Record<
  string,
  { phaseType: string; title: string; description: string }
> = {
  DATABASE_LAYER: {
    phaseType: "PERSISTENCE_FOUNDATION",
    title: "Persistence Foundation",
    description:
      "Database and persistence structures became part of the repository architecture.",
  },
  API_LAYER: {
    phaseType: "API_FOUNDATION",
    title: "API Foundation",
    description:
      "Backend service routes or API-layer architecture became visible.",
  },
  QUEUE_INFRASTRUCTURE: {
    phaseType: "ASYNC_PROCESSING",
    title: "Asynchronous Processing",
    description:
      "Queue or worker infrastructure introduced background processing capabilities.",
  },
  REALTIME_SYSTEMS: {
    phaseType: "REALTIME_INTELLIGENCE",
    title: "Realtime Intelligence",
    description:
      "Realtime systems introduced live updates, event streaming, or websocket-driven feedback.",
  },
  ARCHITECTURE_INTELLIGENCE: {
    phaseType: "SEMANTIC_INTELLIGENCE",
    title: "Semantic Intelligence Layer",
    description:
      "Repository intelligence, architecture reasoning, or semantic classification capabilities emerged.",
  },
  FRONTEND_ARCHITECTURE: {
    phaseType: "USER_INTERFACE_LAYER",
    title: "User Interface Layer",
    description:
      "Frontend architecture evolved to expose repository intelligence to users.",
  },
};

export const buildIntelligenceTimeline = (
  changes: IntelligenceTimelineChange[]
) => {
  const grouped = new Map<string, IntelligenceTimelineChange[]>();

  for (const change of changes) {
    const domain = change.architectureDomain || "GENERAL_ARCHITECTURE";

    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }

    grouped.get(domain)?.push(change);
  }

  const phases = Array.from(grouped.entries()).map(([domain, domainChanges]) => {
    const sortedChanges = [...domainChanges].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const phase = phaseMap[domain] || {
      phaseType: "GENERAL_ENGINEERING_ACTIVITY",
      title: domain
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      description:
        "General engineering activity contributed to this repository's architecture.",
    };

    return {
      domain,
      ...phase,
      startedAt: sortedChanges[0]?.createdAt || null,
      latestActivityAt: sortedChanges[sortedChanges.length - 1]?.createdAt || null,
      totalChanges: sortedChanges.length,
      technologies: Array.from(
        new Set(
          sortedChanges
            .map((change) => change.detectedTechnology)
            .filter((technology): technology is string => Boolean(technology))
        )
      ),
      highlights: sortedChanges.slice(-3).map((change) => ({
        summary: change.summary,
        evolutionSummary: change.evolutionSummary,
        createdAt: change.createdAt,
      })),
    };
  });

  return phases.sort((a, b) => {
    const left = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const right = b.startedAt ? new Date(b.startedAt).getTime() : 0;

    return left - right;
  });
};