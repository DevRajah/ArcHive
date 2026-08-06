import type {
  EvidenceContext,
} from "../evidence";

import type {
  FingerprintState,
} from "./shared";

export type TechnologyRelationship = {
  source: string;
  target: string;
  relationship: string;
};

const RELATIONSHIPS = [
  {
    source: "BullMQ",
    target: "Redis",
    relationship: "uses",
  },
  {
    source: "Socket.IO",
    target: "Redis",
    relationship: "adapter",
  },
  {
    source: "Prisma ORM",
    target: "PostgreSQL",
    relationship: "database",
  },
  {
    source: "Prisma ORM",
    target: "MySQL",
    relationship: "database",
  },
  {
    source: "Prisma ORM",
    target: "MongoDB",
    relationship: "database",
  },
  {
    source: "NestJS",
    target: "Fastify",
    relationship: "http-platform",
  },
  {
    source: "NestJS",
    target: "Express",
    relationship: "http-platform",
  },
  {
    source: "Next.js",
    target: "React",
    relationship: "framework",
  },
];

export const buildDependencyGraphStage = ({
  state,
}: {
  evidenceContext: EvidenceContext;
  state: FingerprintState;
}) => {
  const graph: TechnologyRelationship[] = [];

  for (const edge of RELATIONSHIPS) {
    if (
      state.technologies.has(edge.source) &&
      state.technologies.has(edge.target)
    ) {
      graph.push(edge);

      state.addReasoningSignal(
        `${edge.source} ${edge.relationship} ${edge.target}.`,
      );
    }
  }

  return graph;
};