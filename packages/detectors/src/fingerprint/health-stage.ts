import {
  buildProductionReadiness,
} from "../production-readiness";

import {
  buildRepositoryMaturity,
} from "../maturity";

import {
  buildTechnicalDebtReport,
} from "../technical-debt";

import {
  buildStrengthReport,
} from "../strengths";

import {
  buildWeaknessReport,
} from "../weaknesses";

import {
  buildRepositoryHealth,
} from "../repository-health";

import type {
  EngineeringQualityResult,
} from "../engineering-quality";

import type {
  FingerprintState,
} from "./shared";

/**
 * Builds the repository's quality and health reports.
 *
 * Future me:
 * This stage receives the engineering-quality result and derives the
 * higher-level conclusions shown throughout ArcHive.
 */
export const buildHealthStage = ({
  engineeringQuality,
  state,
}: {
  engineeringQuality: EngineeringQualityResult;
  state: FingerprintState;
}) => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
  } = state;

  const productionReadiness =
    buildProductionReadiness({
      engineeringQuality,
    });

  const repositoryMaturity =
    buildRepositoryMaturity({
      engineeringQuality,
      productionReadiness,

      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      technologies:
        Array.from(
          technologies,
        ),

      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      engineeringSignals:
        Array.from(
          engineeringSignals,
        ),

      reasoningSignals,
    });

  const technicalDebt =
    buildTechnicalDebtReport({
      engineeringQuality,
      productionReadiness,
      repositoryMaturity,
    });

  const strengthReport =
    buildStrengthReport({
      engineeringQuality,
      repositoryMaturity,
      productionReadiness,
    });

  const weaknessReport =
    buildWeaknessReport({
      engineeringQuality,
      repositoryMaturity,
      productionReadiness,
      technicalDebt,
    });

  const repositoryHealth =
    buildRepositoryHealth({
      engineeringQuality,
      productionReadiness,
      repositoryMaturity,
      technicalDebt,
      strengthReport,
      weaknessReport,
    });

  return {
    productionReadiness,
    repositoryMaturity,
    technicalDebt,
    strengthReport,
    weaknessReport,
    repositoryHealth,
  };
};