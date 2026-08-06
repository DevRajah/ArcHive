import type {
  EvidenceContext,
} from "../evidence";

import type {
  FingerprintState,
} from "./shared";

type VersionDefinition = {
  packageNames: string[];
  technology: string;
};

const VERSION_DEFINITIONS:
  VersionDefinition[] = [
    {
      packageNames: [
        "react",
      ],
      technology: "React",
    },
    {
      packageNames: [
        "next",
      ],
      technology: "Next.js",
    },
    {
      packageNames: [
        "vue",
      ],
      technology: "Vue",
    },
    {
      packageNames: [
        "@angular/core",
      ],
      technology: "Angular",
    },
    {
      packageNames: [
        "express",
      ],
      technology: "Express",
    },
    {
      packageNames: [
        "fastify",
      ],
      technology: "Fastify",
    },
    {
      packageNames: [
        "@nestjs/core",
      ],
      technology: "NestJS",
    },
    {
      packageNames: [
        "@prisma/client",
        "prisma",
      ],
      technology: "Prisma ORM",
    },
    {
      packageNames: [
        "bullmq",
      ],
      technology: "BullMQ",
    },
    {
      packageNames: [
        "socket.io",
      ],
      technology: "Socket.IO",
    },
    {
      packageNames: [
        "jest",
      ],
      technology: "Jest",
    },
    {
      packageNames: [
        "vitest",
      ],
      technology: "Vitest",
    },
    {
      packageNames: [
        "vite",
      ],
      technology: "Vite",
    },
    {
      packageNames: [
        "turbo",
      ],
      technology: "Turborepo",
    },
    {
      packageNames: [
        "typescript",
      ],
      technology: "TypeScript",
    },
  ];

const extractMajorVersion = (
  declaredVersion: string,
): number | null => {
  /**
   * Supports versions such as:
   *
   * ^5.2.0
   * ~19.0.0
   * >=4.0.0
   * 11.1.2
   * npm:package@5.0.0
   */
  const match =
    declaredVersion.match(
      /(?:^|@|[<>=~^\s])(\d+)(?:\.\d+)?(?:\.\d+)?/,
    );

  if (!match?.[1]) {
    return null;
  }

  const major =
    Number.parseInt(
      match[1],
      10,
    );

  return Number.isNaN(major)
    ? null
    : major;
};

const findPackageVersion = ({
  context,
  packageNames,
}: {
  context: EvidenceContext;
  packageNames: string[];
}): {
  packageName: string;
  declaredVersion: string;
} | null => {
  for (
    const packageName of
    packageNames
  ) {
    const declaredVersion =
      context.dependencyVersions.get(
        packageName.toLowerCase(),
      );

    if (declaredVersion) {
      return {
        packageName,
        declaredVersion,
      };
    }
  }

  return null;
};

/**
 * Adds version evidence without turning each version into a separate
 * technology label.
 *
 * Example:
 * "Detected Fastify major version 5 from package.json dependency fastify."
 */
export const applyFrameworkVersionStage = ({
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
    const definition of
    VERSION_DEFINITIONS
  ) {
    if (
      !technologies.has(
        definition.technology,
      )
    ) {
      continue;
    }

    const packageVersion =
      findPackageVersion({
        context:
          evidenceContext,

        packageNames:
          definition.packageNames,
      });

    if (!packageVersion) {
      continue;
    }

    const majorVersion =
      extractMajorVersion(
        packageVersion.declaredVersion,
      );

    if (majorVersion !== null) {
      addReasoningSignal(
        `Detected ${definition.technology} major version ${majorVersion} from dependency "${packageVersion.packageName}" (${packageVersion.declaredVersion}).`,
      );

      continue;
    }

    addReasoningSignal(
      `Detected ${definition.technology} dependency "${packageVersion.packageName}" with declared version "${packageVersion.declaredVersion}".`,
    );
  }
};