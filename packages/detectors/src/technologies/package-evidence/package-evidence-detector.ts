import type {
  EvidenceContext,
  TechnologyEvidenceSource,
} from "../../evidence";

import {
  PACKAGE_TECHNOLOGY_MAP,
} from "./package-technology-map";

const normalizePackageName = (
  packageName: string,
): string => {
  return packageName
    .trim()
    .toLowerCase();
};

const findMatchingPackage = ({
  candidates,
  expectedPackages,
}: {
  candidates: Set<string>;
  expectedPackages: string[];
}): string | null => {
  for (
    const expectedPackage of
    expectedPackages
  ) {
    const normalizedExpected =
      normalizePackageName(
        expectedPackage,
      );

    if (
      candidates.has(
        normalizedExpected,
      )
    ) {
      return normalizedExpected;
    }
  }

  return null;
};

const registerPackageTechnology = ({
  context,
  technology,
  description,
  packageName,
  source,
  weight,
}: {
  context: EvidenceContext;
  technology: string;
  description: string;
  packageName: string;
  source: TechnologyEvidenceSource;
  weight: number;
}): void => {
  context.addTechnology({
    name: technology,
    reason: description,
    weight,
    strength: "STRONG",
    source,
    evidence:
      `${source === "IMPORT" ? "Imported package" : "Dependency"}: ${packageName}`,
    status: "CONFIRMED",
  });
};

/**
 * Converts parsed dependencies and imports into implementation-backed
 * technology evidence.
 *
 * Dependency plus import evidence is stronger than either one alone.
 */
export const detectPackageTechnologyEvidence = (
  context: EvidenceContext,
): void => {
  for (
    const definition of
    PACKAGE_TECHNOLOGY_MAP
  ) {
    const dependencyMatch =
      findMatchingPackage({
        candidates:
          context.dependencies,

        expectedPackages:
          definition.packages,
      });

    const importMatch =
      findMatchingPackage({
        candidates:
          context.imports,

        expectedPackages:
          definition.packages,
      });

    if (
      dependencyMatch &&
      importMatch
    ) {
      context.addTechnology({
        name:
          definition.technology,

        reason:
          `${definition.description} Confirmed by dependency and source import evidence.`,

        weight: 100,

        strength: "STRONG",

        source: "DEPENDENCY",

        evidence:
          `Dependency: ${dependencyMatch}; Import: ${importMatch}`,

        status: "CONFIRMED",
      });

      continue;
    }

    if (importMatch) {
      registerPackageTechnology({
        context,

        technology:
          definition.technology,

        description:
          `${definition.description} Confirmed through source-code usage.`,

        packageName:
          importMatch,

        source: "IMPORT",

        weight: 95,
      });

      continue;
    }

    if (dependencyMatch) {
      /**
       * Runtime dependencies are strong implementation evidence.
       *
       * Development dependencies may represent configuration or tooling,
       * but still prove that the repository actively includes the package.
       */
      const weight =
        definition.category ===
        "RUNTIME"
          ? 90
          : 85;

      registerPackageTechnology({
        context,

        technology:
          definition.technology,

        description:
          definition.description,

        packageName:
          dependencyMatch,

        source:
          "PACKAGE_JSON",

        weight,
      });
    }
  }
};