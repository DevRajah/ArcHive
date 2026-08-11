import { ArchitectureDriftReport } from "../architecture-drift";
import { EngineeringQualityResult } from "../engineering-quality";
import { EvolutionInsightsReport } from "../repository-evolution";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryHealth } from "../repository-health";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtReport } from "../technical-debt";
import { WeaknessReport } from "../weaknesses";

import {
  EngineeringRecommendation,
  RecommendationReport,
} from "./types";

/**
 * Convert severity-style values into the recommendation priority used by
 * the advisor layer.
 */
const priorityFromSeverity = (
  severity: "LOW" | "MEDIUM" | "HIGH"
): EngineeringRecommendation["priority"] => {
  if (severity === "HIGH") return "HIGH";
  if (severity === "MEDIUM") return "MEDIUM";

  return "LOW";
};

const priorityWeight: Record<
  EngineeringRecommendation["priority"],
  number
> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Normalise categories before consolidation.
 *
 * Future me:
 * Recommendation sources use categories as the semantic identity of an
 * engineering concern. Normalising here prevents formatting differences
 * from creating duplicate recommendations.
 */
const normalizeCategory = (category: string) => {
  return category
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
};

/**
 * Decide which recommendation should represent a category when several
 * intelligence reports describe the same underlying concern.
 *
 * Higher priority wins.
 *
 * If priorities are equal, keep the recommendation with the more specific
 * action text because it usually gives the developer more useful guidance.
 */
const chooseBetterRecommendation = (
  current: EngineeringRecommendation,
  candidate: EngineeringRecommendation
) => {
  const currentPriority =
    priorityWeight[current.priority];

  const candidatePriority =
    priorityWeight[candidate.priority];

  if (candidatePriority > currentPriority) {
    return candidate;
  }

  if (candidatePriority < currentPriority) {
    return current;
  }

  if (
    candidate.action.trim().length >
    current.action.trim().length
  ) {
    return candidate;
  }

  return current;
};

/**
 * Consolidate recommendations by engineering concern instead of exact text.
 *
 * Previously ArcHive deduplicated using:
 *
 * priority + category + title + action
 *
 * That meant the same Observability problem could appear three or four
 * times merely because Quality, Technical Debt, Maturity and Weakness
 * reports described it differently.
 *
 * The advisor should surface one clear recommendation for one concern.
 */
const addRecommendation = (
  recommendationsByCategory: Map<
    string,
    EngineeringRecommendation
  >,
  recommendation: EngineeringRecommendation
) => {
  const category =
    normalizeCategory(recommendation.category);

  const normalizedRecommendation = {
    ...recommendation,
    category,
  };

  const existing =
    recommendationsByCategory.get(category);

  if (!existing) {
    recommendationsByCategory.set(
      category,
      normalizedRecommendation
    );

    return;
  }

  recommendationsByCategory.set(
    category,
    chooseBetterRecommendation(
      existing,
      normalizedRecommendation
    )
  );
};

export const buildRecommendationReport = ({
  weaknessReport,
  technicalDebt,
  productionReadiness,
  engineeringQuality,
  repositoryMaturity,
  repositoryHealth,
  architectureDrift,
  evolutionInsights,
}: {
  weaknessReport: WeaknessReport;
  technicalDebt: TechnicalDebtReport;
  productionReadiness: ProductionReadiness;
  engineeringQuality: EngineeringQualityResult;
  repositoryMaturity: RepositoryMaturity;
  repositoryHealth: RepositoryHealth;
  architectureDrift: ArchitectureDriftReport;
  evolutionInsights: EvolutionInsightsReport;
}): RecommendationReport => {
  /**
   * One recommendation per engineering category.
   *
   * Examples:
   *
   * OBSERVABILITY
   * SECURITY
   * TESTING
   * DOCUMENTATION
   * PRODUCTION_READINESS
   * MATURITY
   * REPOSITORY_HEALTH
   * ARCHITECTURE_DRIFT
   * EVOLUTION
   */
  const recommendationsByCategory =
    new Map<string, EngineeringRecommendation>();

  /**
   * ============================================================
   * WEAKNESS-BASED RECOMMENDATIONS
   * ============================================================
   *
   * Weaknesses are useful because they already contain explanatory
   * evidence from the advisor layer.
   */
  for (const weakness of weaknessReport.weaknesses) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority:
          priorityFromSeverity(
            weakness.severity
          ),

        category:
          weakness.category,

        title:
          `Improve ${weakness.category
            .replaceAll("_", " ")
            .toLowerCase()}`,

        reason:
          weakness.description,

        action:
          weakness.evidence[0] ||
          `Strengthen ${weakness.category
            .replaceAll("_", " ")
            .toLowerCase()} implementation evidence.`,
      }
    );
  }

  /**
   * ============================================================
   * TECHNICAL DEBT
   * ============================================================
   *
   * Technical debt may describe the same category already found by the
   * Weakness report. addRecommendation() will consolidate the two instead
   * of creating another card.
   */
  for (const debtItem of technicalDebt.items) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority:
          priorityFromSeverity(
            debtItem.severity
          ),

        category:
          debtItem.area,

        title:
          debtItem.title,

        reason:
          debtItem.description,

        action:
          debtItem.recommendation,
      }
    );
  }

  /**
   * ============================================================
   * ENGINEERING QUALITY
   * ============================================================
   */

  for (const quality of engineeringQuality.scores) {
    if (quality.score >= 50) {
      continue;
    }

    addRecommendation(
      recommendationsByCategory,
      {
        priority: "HIGH",

        category:
          quality.area,

        title:
          `Prioritise ${quality.area
            .replaceAll("_", " ")
            .toLowerCase()} improvement`,

        reason:
          `${quality.area} quality is low with a score of ${quality.score}.`,

        action:
          quality.reasons[0] ||
          `Strengthen ${quality.area
            .replaceAll("_", " ")
            .toLowerCase()} implementation before scaling this repository further.`,
      }
    );
  }

  /**
   * ============================================================
   * PRODUCTION READINESS
   * ============================================================
   *
   * Production Readiness now has independent operational semantics, so it
   * deserves its own recommendation when the repository is genuinely not
   * ready.
   */
  if (
    productionReadiness.level ===
    "NOT_READY"
  ) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority: "HIGH",

        category:
          "PRODUCTION_READINESS",

        title:
          "Improve production readiness",

        reason:
          productionReadiness.summary,

        action:
          productionReadiness.blockers.find(
            (blocker) =>
              blocker !==
                "No major production-readiness blockers were detected." &&
              blocker !==
                "No major engineering blockers detected."
          ) ||
          "Strengthen deployment, delivery automation, observability, security, and operational resilience before treating this repository as production-ready.",
      }
    );
  }

  /**
   * ============================================================
   * REPOSITORY MATURITY
   * ============================================================
   */

  if (
    repositoryMaturity.level ===
      "PROTOTYPE" ||
    repositoryMaturity.level ===
      "GROWING"
  ) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority: "MEDIUM",

        category: "MATURITY",

        title:
          "Increase repository maturity",

        reason:
          repositoryMaturity.summary,

        action:
          repositoryMaturity
            .recommendations[0] ||
          "Improve weak maturity areas such as testing, documentation, DevOps, observability, or security.",
      }
    );
  }

  /**
   * ============================================================
   * REPOSITORY HEALTH
   * ============================================================
   *
   * Only create a health-level recommendation when the repository is
   * actually unhealthy enough for that summary to add useful information.
   *
   * AT_RISK alone is not another individual engineering problem, so we do
   * not create an extra recommendation merely for being AT_RISK.
   */
  if (
    repositoryHealth.status ===
    "CRITICAL"
  ) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority: "HIGH",

        category:
          "REPOSITORY_HEALTH",

        title:
          "Address critical repository health risks",

        reason:
          repositoryHealth.summary,

        action:
          repositoryHealth.concerns[0] ||
          "Review the repository's highest-severity engineering concerns first.",
      }
    );
  }

  /**
   * ============================================================
   * ARCHITECTURE DRIFT
   * ============================================================
   */

  if (
    architectureDrift.severity === "HIGH"
  ) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority: "HIGH",

        category:
          "ARCHITECTURE_DRIFT",

        title:
          "Review architecture drift",

        reason:
          architectureDrift.summary,

        action:
          architectureDrift.items[0]
            ?.description ||
          "Review repository responsibilities and determine whether boundaries or ownership should be separated.",
      }
    );
  }

  /**
   * ============================================================
   * REPOSITORY EVOLUTION
   * ============================================================
   */

  if (
    evolutionInsights.direction ===
    "BECOMING_MORE_COMPLEX"
  ) {
    addRecommendation(
      recommendationsByCategory,
      {
        priority: "MEDIUM",

        category: "EVOLUTION",

        title:
          "Control repository complexity growth",

        reason:
          evolutionInsights.summary,

        action:
          evolutionInsights.insights[0]
            ?.description ||
          "Review repository boundaries and document the intended architecture direction.",
      }
    );
  }

  /**
   * Convert the consolidated map back into the existing API contract.
   *
   * Higher-priority recommendations appear first. Categories are used as a
   * deterministic secondary sort so repeated intelligence refreshes return
   * a stable ordering.
   */
  const recommendations =
    Array.from(
      recommendationsByCategory.values()
    ).sort((a, b) => {
      const priorityDifference =
        priorityWeight[b.priority] -
        priorityWeight[a.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return a.category.localeCompare(
        b.category
      );
    });

  return {
    recommendations,
  };
};