export type TechnologyRelationship = {
  source: string;
  target: string;
  relationship: string;
};

export const buildTechnologyRelationships = ({
  technologies,
  domains,
  repositoryTypes,
}: {
  technologies: string[];
  domains: string[];
  repositoryTypes: string[];
}) => {
  const relationships: TechnologyRelationship[] = [];

  for (const technology of technologies) {
    if (
      technology.toLowerCase().includes("bullmq")
    ) {
      relationships.push({
        source: "BullMQ",
        target: "QUEUE_INFRASTRUCTURE",
        relationship:
          "enables asynchronous background processing",
      });

      relationships.push({
        source: "BullMQ",
        target: "EVENT_DRIVEN_SYSTEMS",
        relationship:
          "supports event-driven infrastructure",
      });
    }

    if (
      technology.toLowerCase().includes("socket")
    ) {
      relationships.push({
        source: "Socket.IO",
        target: "REALTIME_SYSTEMS",
        relationship:
          "enables realtime bidirectional communication",
      });
    }

    if (
      technology.toLowerCase().includes("prisma")
    ) {
      relationships.push({
        source: "Prisma",
        target: "DATABASE_LAYER",
        relationship:
          "supports typed database access and schema management",
      });
    }
  }

  for (const domain of domains) {
    if (
      domain === "QUEUE_INFRASTRUCTURE"
    ) {
      relationships.push({
        source: "QUEUE_INFRASTRUCTURE",
        target: "DISTRIBUTED_PROCESSING",
        relationship:
          "supports distributed asynchronous workloads",
      });
    }

    if (
      domain === "REALTIME_SYSTEMS"
    ) {
      relationships.push({
        source: "REALTIME_SYSTEMS",
        target: "LIVE_ENGINEERING_FEEDBACK",
        relationship:
          "supports live operational visibility and feedback",
      });
    }
  }

  for (const repositoryType of repositoryTypes) {
    if (
      repositoryType ===
      "ENGINEERING_INTELLIGENCE_PLATFORM"
    ) {
      relationships.push({
        source:
          "ENGINEERING_INTELLIGENCE_PLATFORM",
        target: "ARCHITECTURE_REASONING",
        relationship:
          "focuses on engineering analysis and repository intelligence",
      });
    }
  }

  const uniqueRelationships = Array.from(
  new Map(
    relationships.map((relationship) => [
      `${relationship.source}-${relationship.target}-${relationship.relationship}`,
      relationship,
    ])
  ).values()
);

return uniqueRelationships;
};