import type {
  FingerprintState,
} from "./shared";

type TechnologyConflictRule = {
  /**
   * When this technology exists, remove the listed weaker or
   * duplicate classifications.
   */
  technology: string;
  removes: string[];
};

/**
 * Removes duplicate, generic, or misleading technology classifications.
 *
 * Future me:
 * Keep this stage focused on output cleanup. Detection itself belongs
 * inside evidence-aware technology detectors.
 */
const TECHNOLOGY_CONFLICT_RULES:
  TechnologyConflictRule[] = [
    {
      technology: "Next.js",
      removes: [
        "React / Frontend UI",
      ],
    },

    {
      technology: "React",
      removes: [
        "React / Frontend UI",
      ],
    },

    {
      technology: "Fastify",
      removes: [
        "Backend API",
      ],
    },

    {
      technology: "Express",
      removes: [
        "Backend API",
      ],
    },

    {
      technology: "NestJS",
      removes: [
        "Backend API",
      ],
    },

    {
      technology: "BullMQ",
      removes: [
        "Background Jobs / Queue",
      ],
    },

    {
      technology: "Kafka",
      removes: [
        "Messaging / Event Streaming",
      ],
    },

    {
      technology: "RabbitMQ",
      removes: [
        "Messaging / Event Streaming",
      ],
    },

    {
      technology: "Socket.IO",
      removes: [
        "Socket.IO / Realtime Events",
      ],
    },

    {
      technology: "PostgreSQL",
      removes: [
        "Database",
      ],
    },

    {
      technology: "MongoDB",
      removes: [
        "Database",
      ],
    },

    {
      technology: "MySQL",
      removes: [
        "Database",
      ],
    },

    {
      technology: "Docker Compose",
      removes: [
        "Container Orchestration",
      ],
    },

    {
      technology: "Turborepo",
      removes: [
        "Turborepo Pipelines",
      ],
    },

    {
      technology: "Nx Workspace",
      removes: [
        "Nx",
      ],
    },

    {
      technology: "Vercel Hosting",
      removes: [
        "Vercel",
      ],
    },

    {
      technology: "Render Hosting",
      removes: [
        "Render",
      ],
    },

    {
      technology: "Railway Hosting",
      removes: [
        "Railway",
      ],
    },
  ];

/**
 * Technologies that belong together and must not be treated as conflicts.
 */
const PRESERVED_RELATIONSHIPS = [
  ["Next.js", "React"],
  ["NestJS", "Fastify"],
  ["NestJS", "Express"],
  ["BullMQ", "Redis"],
  ["Socket.IO", "Redis"],
  ["Prisma ORM", "PostgreSQL"],
  ["Prisma ORM", "MySQL"],
  ["Prisma ORM", "SQLite"],
  ["Turborepo", "Monorepo"],
  ["Nx Workspace", "Monorepo"],
  ["Docker Compose", "Docker"],
];

const relationshipExists = (
  technologies: Set<string>,
  relationship: string[],
): boolean => {
  return relationship.every(
    (technology) =>
      technologies.has(
        technology,
      ),
  );
};

export const applyTechnologyConflictStage = ({
  state,
}: {
  state: FingerprintState;
}): void => {
  const {
    technologies,
    addReasoningSignal,
  } = state;

  for (
    const rule of
    TECHNOLOGY_CONFLICT_RULES
  ) {
    if (
      !technologies.has(
        rule.technology,
      )
    ) {
      continue;
    }

    for (
      const conflictingTechnology of
      rule.removes
    ) {
      if (
        !technologies.has(
          conflictingTechnology,
        )
      ) {
        continue;
      }

      technologies.delete(
        conflictingTechnology,
      );

      addReasoningSignal(
        `Replaced generic classification "${conflictingTechnology}" with confirmed technology "${rule.technology}".`,
      );
    }
  }

  /**
   * Record important technology relationships without removing
   * either side of the relationship.
   */
  for (
    const relationship of
    PRESERVED_RELATIONSHIPS
  ) {
    if (
      !relationshipExists(
        technologies,
        relationship,
      )
    ) {
      continue;
    }

    addReasoningSignal(
      `Detected compatible technology relationship: ${relationship.join(
        " + ",
      )}.`,
    );
  }
};