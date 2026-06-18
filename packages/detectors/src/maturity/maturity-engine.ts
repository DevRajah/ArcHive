import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "../production-readiness";
import { runMaturityDetectors } from "./maturity-registry";
import { RepositoryMaturity } from "./maturity-types";

const getLevel = (score: number): RepositoryMaturity["level"] => {
  if (score >= 85) return "ENTERPRISE_READY";
  if (score >= 70) return "PRODUCTION_READY";
  if (score >= 45) return "GROWING";
  return "PROTOTYPE";
};

const getSummary = (level: RepositoryMaturity["level"]) => {
  switch (level) {
    case "ENTERPRISE_READY":
      return "Repository shows strong signals of mature, enterprise-grade engineering practices.";
    case "PRODUCTION_READY":
      return "Repository appears production-oriented, with several mature engineering practices detected.";
    case "GROWING":
      return "Repository shows meaningful engineering structure but still has maturity gaps.";
    case "PROTOTYPE":
      return "Repository appears early-stage or lightly structured based on detected engineering evidence.";
  }
};

export const buildRepositoryMaturity = ({
  engineeringQuality,
  productionReadiness,
  repositoryTypes,
  technologies,
  architectureDomains,
  engineeringSignals,
  reasoningSignals,
}: {
  engineeringQuality: EngineeringQualityResult;
  productionReadiness?: ProductionReadiness;
  repositoryTypes: string[];
  technologies: string[];
  architectureDomains: string[];
  engineeringSignals: string[];
  reasoningSignals: string[];
}): RepositoryMaturity => {
  const assessments = runMaturityDetectors({
    engineeringQuality,
    productionReadiness,
    repositoryTypes,
    technologies,
    architectureDomains,
    engineeringSignals,
    reasoningSignals,
  });

  const score = Math.round(
    assessments.reduce((sum, assessment) => sum + assessment.score, 0) /
      Math.max(assessments.length, 1)
  );

  const level = getLevel(score);

  return {
    score,
    level,
    summary: getSummary(level),
    assessments,
    strengths: assessments.flatMap((assessment) => assessment.strengths),
    weaknesses: assessments.flatMap((assessment) => assessment.weaknesses),
    recommendations: assessments.flatMap((assessment) => assessment.recommendations),
    reasons: [
      `Repository maturity score is ${score}.`,
      `Repository maturity level is ${level}.`,
      `Maturity was calculated across ${assessments.length} engineering areas.`,
    ],
  };
};