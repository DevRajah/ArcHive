import type {
  EvidenceContext,
} from "../evidence";

import type {
  FingerprintState,
} from "./shared";

type TechnologyRelationshipRule = {
  requires: string[];

  description: string;

  /**
   * Optional dependency or import signals that make the relationship
   * more specific than technology coexistence alone.
   */
  evidencePackages?: string[];
};

const RELATIONSHIP_RULES:
  TechnologyRelationshipRule[] = [
    {
      requires: [
        "Next.js",
        "React",
      ],

      description:
        "Next.js provides the application framework while React supplies the component runtime.",
    },

    {
      requires: [
        "NestJS",
        "Fastify",
      ],

      evidencePackages: [
        "@nestjs/platform-fastify",
      ],

      description:
        "NestJS is configured with the Fastify HTTP platform adapter.",
    },

    {
      requires: [
        "NestJS",
        "Express",
      ],

      evidencePackages: [
        "@nestjs/platform-express",
      ],

      description:
        "NestJS is configured with the Express HTTP platform adapter.",
    },

    {
      requires: [
        "BullMQ",
        "Redis",
      ],

      description:
        "BullMQ uses Redis as its queue persistence and coordination layer.",
    },

    {
      requires: [
        "Socket.IO",
        "Redis",
      ],

      evidencePackages: [
        "@socket.io/redis-adapter",
        "socket.io-redis",
      ],

      description:
        "Socket.IO uses Redis-backed coordination for horizontally scalable realtime communication.",
    },

    {
      requires: [
        "Prisma ORM",
        "PostgreSQL",
      ],

      description:
        "Prisma ORM provides application data access to PostgreSQL.",
    },

    {
      requires: [
        "Prisma ORM",
        "MySQL",
      ],

      description:
        "Prisma ORM provides application data access to MySQL.",
    },

    {
      requires: [
        "Prisma ORM",
        "MongoDB",
      ],

      description:
        "Prisma ORM provides application data access to MongoDB.",
    },

    {
      requires: [
        "Docker Compose",
        "PostgreSQL",
      ],

      description:
        "Docker Compose appears to orchestrate application and PostgreSQL infrastructure.",
    },

    {
      requires: [
        "Docker Compose",
        "Redis",
      ],

      description:
        "Docker Compose appears to orchestrate application and Redis infrastructure.",
    },

    {
      requires: [
        "Turborepo",
        "Monorepo",
      ],

      description:
        "Turborepo coordinates tasks across the detected monorepo workspace.",
    },

    {
      requires: [
        "Nx Workspace",
        "Monorepo",
      ],

      description:
        "Nx coordinates projects and tasks across the detected monorepo workspace.",
    },

    {
      requires: [
        "OpenAI",
        "LangChain",
      ],

      description:
        "LangChain orchestrates application workflows that use OpenAI models.",
    },

    {
      requires: [
        "Anthropic",
        "LangChain",
      ],

      description:
        "LangChain orchestrates application workflows that use Anthropic models.",
    },

    {
      requires: [
        "JWT",
        "OAuth",
      ],

      description:
        "OAuth handles delegated identity while JWT supports application session or API authorization.",
    },
  ];

const hasAnyPackageEvidence = ({
  context,
  packageNames,
}: {
  context: EvidenceContext;
  packageNames: string[];
}): boolean => {
  return packageNames.some(
    (packageName) => {
      const normalized =
        packageName.toLowerCase();

      return (
        context.dependencies.has(
          normalized,
        ) ||
        context.imports.has(
          normalized,
        )
      );
    },
  );
};

/**
 * Adds explainable relationships between confirmed technologies.
 *
 * This does not create additional technology labels. It explains how the
 * technologies work together, which improves reports and recommendations.
 */
export const applyTechnologyRelationshipStage = ({
  evidenceContext,
  state,
}: {
  evidenceContext: EvidenceContext;
  state: FingerprintState;
}): void => {
  const {
    technologies,
    addReasoningSignal,
  } = state;

  for (
    const rule of
    RELATIONSHIP_RULES
  ) {
    const technologiesExist =
      rule.requires.every(
        (technology) =>
          technologies.has(
            technology,
          ),
      );

    if (!technologiesExist) {
      continue;
    }

    if (
      rule.evidencePackages &&
      !hasAnyPackageEvidence({
        context:
          evidenceContext,

        packageNames:
          rule.evidencePackages,
      })
    ) {
      /**
       * The two technologies may coexist, but the more specific relationship
       * has not been proven by dependency or import evidence.
       */
      continue;
    }

    addReasoningSignal(
      `Technology relationship: ${rule.description}`,
    );
  }
};