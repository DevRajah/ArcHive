import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtReport } from "../technical-debt";
import { StrengthReport } from "../strengths";
import { WeaknessReport } from "../weaknesses";
import { RepositoryHealth } from "./types";

const getStatus = (
  score: number
): RepositoryHealth["status"] => {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "STABLE";
  if (score >= 40) return "AT_RISK";

  return "CRITICAL";
};

const getSummary = (
  status: RepositoryHealth["status"]
) => {
  switch (status) {
    case "HEALTHY":
      return "Repository shows strong engineering health and appears well-positioned for production use.";

    case "STABLE":
      return "Repository is reasonably stable, but some engineering areas still need improvement.";

    case "AT_RISK":
      return "Repository has notable engineering risks that may affect maintainability, reliability, or production readiness.";

    case "CRITICAL":
      return "Repository shows serious engineering health concerns and should be improved before being treated as production-ready.";
  }
};

export const buildRepositoryHealth = ({
  engineeringQuality,
  productionReadiness,
  repositoryMaturity,
  technicalDebt,
  strengthReport,
  weaknessReport,
}: {
  engineeringQuality: EngineeringQualityResult;
  productionReadiness: ProductionReadiness;
  repositoryMaturity: RepositoryMaturity;
  technicalDebt: TechnicalDebtReport;
  strengthReport: StrengthReport;
  weaknessReport: WeaknessReport;
}): RepositoryHealth => {
  /**
   * Repository Health is a weighted synthesis of four distinct dimensions.
   *
   * Future me:
   * Do not subtract weakness counts or technical debt again below.
   *
   * WeaknessReport is an explanatory aggregation built from many of the
   * same inputs already represented here. Penalising its item count would
   * count the same engineering problem multiple times.
   *
   * Technical debt is also already represented by the Technical Debt
   * Control component, so an additional debt penalty would double-charge
   * repositories for the same debt score.
   */
  const rawScore =
    engineeringQuality.overallScore * 0.35 +
    productionReadiness.score * 0.25 +
    repositoryMaturity.score * 0.25 +
    (100 - technicalDebt.debtScore) * 0.15;

  const score = Math.max(
    0,
    Math.min(100, Math.round(rawScore))
  );

  const status = getStatus(score);

  /**
   * Strengths and weaknesses explain the score.
   *
   * They do not independently modify it.
   */
  const highlights = [
    ...strengthReport.strengths
      .slice(0, 5)
      .map((strength) => strength.title),

    ...productionReadiness.strengths.slice(0, 3),
  ];

  const concerns = [
    ...weaknessReport.weaknesses
      .slice(0, 5)
      .map((weakness) => weakness.title),

    ...technicalDebt.items
      .slice(0, 3)
      .map((item) => item.title),

    ...productionReadiness.blockers.filter(
      (blocker) =>
        blocker !==
        "No major production-readiness blockers were detected." &&
        blocker !==
        "No major engineering blockers detected."
    ),
  ];

  return {
    score,
    status,
    summary: getSummary(status),
    highlights: Array.from(
      new Set(highlights)
    ),
    concerns: Array.from(
      new Set(concerns)
    ),
  };
};