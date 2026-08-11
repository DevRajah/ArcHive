import { EngineeringQualityResult } from "../engineering-quality";
import { RepositoryMaturity } from "../maturity";
import { ProductionReadiness } from "../production-readiness";
import { TechnicalDebtReport } from "../technical-debt";
import {
  RepositoryWeakness,
  WeaknessReport,
} from "./types";

const getSeverity = (
  score: number
): RepositoryWeakness["severity"] => {
  if (score < 40) return "HIGH";
  if (score < 65) return "MEDIUM";

  return "LOW";
};

const severityWeight: Record<
  RepositoryWeakness["severity"],
  number
> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const normalizeCategory = (category: string) => {
  return category
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
};

/**
 * Pick the strongest representative when multiple intelligence layers
 * describe the same underlying engineering concern.
 *
 * Future me:
 * WeaknessReport is an explanatory layer. It should not repeat the same
 * observability/security/testing problem just because Quality, Technical
 * Debt, Maturity and Production Readiness all noticed it independently.
 */
const chooseBetterWeakness = (
  current: RepositoryWeakness,
  candidate: RepositoryWeakness
) => {
  const currentSeverity =
    severityWeight[current.severity];

  const candidateSeverity =
    severityWeight[candidate.severity];

  if (candidateSeverity > currentSeverity) {
    return candidate;
  }

  if (candidateSeverity < currentSeverity) {
    return current;
  }

  /**
   * When severity is equal, keep the finding with more evidence because it
   * gives the user a more useful explanation of why ArcHive flagged it.
   */
  if (
    candidate.evidence.length >
    current.evidence.length
  ) {
    return candidate;
  }

  /**
   * If evidence count is also equal, prefer the more descriptive message.
   */
  if (
    candidate.description.length >
    current.description.length
  ) {
    return candidate;
  }

  return current;
};

const addWeakness = (
  weaknessesByCategory: Map<
    string,
    RepositoryWeakness
  >,
  weakness: RepositoryWeakness
) => {
  const category =
    normalizeCategory(weakness.category);

  const normalizedWeakness = {
    ...weakness,
    category,
  };

  const existing =
    weaknessesByCategory.get(category);

  if (!existing) {
    weaknessesByCategory.set(
      category,
      normalizedWeakness
    );

    return;
  }

  weaknessesByCategory.set(
    category,
    chooseBetterWeakness(
      existing,
      normalizedWeakness
    )
  );
};

export const buildWeaknessReport = ({
  engineeringQuality,
  repositoryMaturity,
  productionReadiness,
  technicalDebt,
}: {
  engineeringQuality: EngineeringQualityResult;
  repositoryMaturity: RepositoryMaturity;
  productionReadiness: ProductionReadiness;
  technicalDebt: TechnicalDebtReport;
}): WeaknessReport => {
  /**
   * One primary weakness per engineering concern.
   *
   * Examples:
   *
   * SECURITY
   * TESTING
   * OBSERVABILITY
   * DOCUMENTATION
   * PRODUCTION_READINESS
   * MATURITY
   */
  const weaknessesByCategory =
    new Map<string, RepositoryWeakness>();

  /**
   * ============================================================
   * ENGINEERING QUALITY
   * ============================================================
   */
  for (const quality of engineeringQuality.scores) {
    if (quality.score >= 65) {
      continue;
    }

    addWeakness(
      weaknessesByCategory,
      {
        category: quality.area,

        title:
          `${quality.area} needs improvement`,

        description:
          `${quality.area} scored ${quality.score}, which indicates this area may need stronger engineering evidence.`,

        evidence:
          quality.reasons,

        severity:
          getSeverity(quality.score),
      }
    );
  }

  /**
   * ============================================================
   * PRODUCTION READINESS
   * ============================================================
   *
   * Production readiness is now an independent operational assessment, so
   * its blockers deserve their own category.
   *
   * Multiple readiness blockers are intentionally consolidated into one
   * production-readiness concern here. The full blocker list remains
   * available on ProductionReadiness itself.
   */
  const productionBlockers =
    productionReadiness.blockers.filter(
      (blocker) =>
        blocker !==
          "No major production-readiness blockers were detected." &&
        blocker !==
          "No major engineering blockers detected."
    );

  if (productionBlockers.length > 0) {
    addWeakness(
      weaknessesByCategory,
      {
        category:
          "PRODUCTION_READINESS",

        title:
          "Production readiness needs improvement",

        description:
          productionReadiness.summary,

        evidence:
          productionBlockers,

        severity:
          productionReadiness.level ===
          "NOT_READY"
            ? "HIGH"
            : "MEDIUM",
      }
    );
  }

  /**
   * ============================================================
   * TECHNICAL DEBT
   * ============================================================
   *
   * Technical debt can overlap with Quality. Because addWeakness()
   * consolidates by category, an OBSERVABILITY debt item will strengthen
   * the existing OBSERVABILITY weakness rather than create another card.
   */
  for (const item of technicalDebt.items) {
    addWeakness(
      weaknessesByCategory,
      {
        category:
          item.area,

        title:
          item.title,

        description:
          item.description,

        evidence: [
          item.recommendation,
        ],

        severity:
          item.severity,
      }
    );
  }

  /**
   * ============================================================
   * REPOSITORY MATURITY
   * ============================================================
   *
   * Maturity exposes many individual weakness strings. Those belong to one
   * higher-level MATURITY concern in the advisor layer rather than one card
   * per string.
   */
  const maturityWeaknesses =
    Array.from(
      new Set(
        repositoryMaturity.weaknesses
          .map((weakness) =>
            weakness.trim()
          )
          .filter(Boolean)
      )
    );

  if (maturityWeaknesses.length > 0) {
    addWeakness(
      weaknessesByCategory,
      {
        category: "MATURITY",

        title:
          "Repository maturity needs improvement",

        description:
          repositoryMaturity.summary,

        evidence:
          maturityWeaknesses,

        severity:
          repositoryMaturity.level ===
          "PROTOTYPE"
            ? "HIGH"
            : "MEDIUM",
      }
    );
  }

  /**
   * Keep output deterministic so repeated intelligence refreshes do not
   * shuffle the advisor cards unnecessarily.
   */
  const weaknesses =
    Array.from(
      weaknessesByCategory.values()
    ).sort((a, b) => {
      const severityDifference =
        severityWeight[b.severity] -
        severityWeight[a.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return a.category.localeCompare(
        b.category
      );
    });

  return {
    weaknesses,
  };
};