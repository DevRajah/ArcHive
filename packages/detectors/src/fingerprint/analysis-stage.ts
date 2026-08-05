import {
  buildArchitectureQuality,
} from "../architecture-quality";

import {
  buildArchitectureDriftReport,
} from "../architecture-drift";

import {
  analyzeRepositoryEvolution,
} from "../repository-evolution";

import {
  buildRecommendationReport,
} from "../recommendations";

import type {
  EngineeringQualityResult,
} from "../engineering-quality";

import type {
  RepositoryDNA,
} from "../dna";

import type {
  RepositoryMaturity,
} from "../maturity";

import type {
  ProductionReadiness,
} from "../production-readiness";

import type {
  TechnicalDebtReport,
} from "../technical-debt";

import type {
  StrengthReport,
} from "../strengths";

import type {
  WeaknessReport,
} from "../weaknesses";

import type {
  RepositoryHealth,
} from "../repository-health";

import type {
  FingerprintState,
} from "./shared";
import { detectEngineeringCapabilities } from "../capabilities";

/**
 * Builds architecture and evolution intelligence after the repository's
 * engineering quality and health have already been calculated.
 */
export const buildAnalysisStage = ({
  capabilities,
  repositoryDNA,
  engineeringQuality,
  productionReadiness,
  repositoryMaturity,
  technicalDebt,
  strengthReport,
  weaknessReport,
  repositoryHealth,
  state,
}: {
capabilities:
  ReturnType<
    typeof detectEngineeringCapabilities
  >;

  repositoryDNA: RepositoryDNA;

  engineeringQuality:
    EngineeringQualityResult;

  productionReadiness:
    ProductionReadiness;

  repositoryMaturity:
    RepositoryMaturity;

  technicalDebt:
    TechnicalDebtReport;

  strengthReport:
    StrengthReport;

  weaknessReport:
    WeaknessReport;

  repositoryHealth:
    RepositoryHealth;

  state: FingerprintState;
}) => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
  } = state;

  const architectureQuality =
    buildArchitectureQuality({
      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      technologies:
        Array.from(
          technologies,
        ),

      engineeringSignals:
        Array.from(
          engineeringSignals,
        ),

      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      capabilities,

      repositoryDNA,

      engineeringQuality,
    });

  const architectureDrift =
    buildArchitectureDriftReport({
      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      technologies:
        Array.from(
          technologies,
        ),

      reasoningSignals,
    });

  const evolutionInsights =
    analyzeRepositoryEvolution({
      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      technologies:
        Array.from(
          technologies,
        ),

      reasoningSignals,

      repositoryDNA,

      engineeringQuality,

      repositoryMaturity,

      repositoryHealth,

      architectureDrift,
    });

  const recommendationReport =
    buildRecommendationReport({
      weaknessReport,

      technicalDebt,

      productionReadiness,

      engineeringQuality,

      repositoryMaturity,

      repositoryHealth,

      architectureDrift,

      evolutionInsights,
    });

  return {
    architectureQuality,
    architectureDrift,
    evolutionInsights,
    recommendationReport,
  };
};