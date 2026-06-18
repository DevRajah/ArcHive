import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtReport } from "../technical-debt";
import { StrengthReport } from "../strengths";
import { WeaknessReport } from "../weaknesses";
import { RecommendationReport } from "../recommendations";
import { RepositoryHealth } from "./types";

const getStatus = (score: number): RepositoryHealth["status"] => {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "STABLE";
  if (score >= 40) return "AT_RISK";
  return "CRITICAL";
};

const getSummary = (status: RepositoryHealth["status"]) => {
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
  recommendationReport,
}: {
  engineeringQuality: EngineeringQualityResult;
  productionReadiness: ProductionReadiness;
  repositoryMaturity: RepositoryMaturity;
  technicalDebt: TechnicalDebtReport;
  strengthReport: StrengthReport;
  weaknessReport: WeaknessReport;
  recommendationReport: RecommendationReport;
}): RepositoryHealth => {
  const weaknessPenalty = Math.min(30, weaknessReport.weaknesses.length * 4);
  const debtPenalty = Math.min(30, technicalDebt.debtScore * 0.3);
  const recommendationPenalty = Math.min(
    20,
    recommendationReport.recommendations.filter(
      (recommendation) => recommendation.priority === "HIGH"
    ).length * 5
  );

  const rawScore =
    engineeringQuality.overallScore * 0.35 +
    productionReadiness.score * 0.25 +
    repositoryMaturity.score * 0.25 +
    (100 - technicalDebt.debtScore) * 0.15 -
    weaknessPenalty -
    debtPenalty -
    recommendationPenalty;

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const status = getStatus(score);

  const highlights = [
    ...strengthReport.strengths.slice(0, 5).map((strength) => strength.title),
    ...productionReadiness.strengths.slice(0, 3),
  ];

  const concerns = [
    ...weaknessReport.weaknesses.slice(0, 5).map((weakness) => weakness.title),
    ...technicalDebt.items.slice(0, 3).map((item) => item.title),
    ...productionReadiness.blockers.filter(
      (blocker) => blocker !== "No major engineering blockers detected."
    ),
  ];

  return {
    score,
    status,
    summary: getSummary(status),
    highlights: Array.from(new Set(highlights)),
    concerns: Array.from(new Set(concerns)),
  };
};