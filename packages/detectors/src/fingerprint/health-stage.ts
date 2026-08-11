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

import type {
  EvidenceContext,
} from "../evidence";
import { CapabilityResult } from "../capabilities";

/**
 * Builds the repository's quality and health reports.
 *
 * Future me:
 * This stage receives the engineering-quality result and derives the
 * higher-level conclusions shown throughout ArcHive.
 */
export const buildHealthStage = ({
  engineeringQuality,
  evidenceContext,
  capabilities,
  state,
}: {
  engineeringQuality: EngineeringQualityResult;
  evidenceContext: EvidenceContext;
  capabilities: CapabilityResult[];
  state: FingerprintState;
}) => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
  } = state;

  /**
   * Production readiness is intentionally independent from Engineering
   * Quality.
   *
   * Engineering Quality evaluates software-engineering practices.
   * Production Readiness evaluates operational deployment evidence.
   */
  const productionReadiness =
    buildProductionReadiness({
      evidenceContext,

      technologies:
        Array.from(technologies),

      architectureDomains:
        Array.from(architectureDomains),

      engineeringSignals:
        Array.from(engineeringSignals),

      repositoryTypes:
        Array.from(repositoryTypes),

      reasoningSignals,
      capabilities,
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

  /**
   * Technical debt is intentionally derived from engineering-quality gaps.
   *
   * Production Readiness and Repository Maturity are separate intelligence
   * dimensions and should not be converted back into technical-debt items.
   */
  const technicalDebt =
    buildTechnicalDebtReport({
      engineeringQuality,
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