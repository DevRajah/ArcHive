import type {
  EvidenceResult,
} from "../evidence";

import {
  detectEngineeringCapabilities,
} from "../capabilities";

import type {
  RepositoryDNA,
} from "../dna";

import type {
  RepositoryPersona,
} from "../persona";

import type {
  EngineeringQualityResult,
} from "../engineering-quality";

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
  RecommendationReport,
} from "../recommendations";

import type {
  RepositoryHealth,
} from "../repository-health";

import type {
  ArchitectureQuality,
} from "../architecture-quality";

import type {
  ArchitectureDriftReport,
} from "../architecture-drift";

import type {
  EvolutionInsightsReport,
} from "../repository-evolution";

import {
  buildRepositoryIntelligenceReport,
} from "../repository-intelligence";

import type {
  RepositoryIntelligenceReport,
} from "../repository-intelligence";

import {
  sortRepositoryTypesByPurpose,
  type FingerprintState,
} from "./shared";

export type TechnologyFingerprintResult = {
  technologies: string[];

  architectureDomains: string[];

  engineeringSignals: string[];

  repositoryTypes: string[];

  reasoningSignals: string[];

  evidenceResults:
    EvidenceResult[];

  capabilities:
    ReturnType<
      typeof detectEngineeringCapabilities
    >;

  repositoryDNA:
    RepositoryDNA;

  repositoryPersona:
    RepositoryPersona;

  engineeringQuality:
    EngineeringQualityResult;

  repositoryMaturity:
    RepositoryMaturity;

  productionReadiness:
    ProductionReadiness;

  technicalDebt:
    TechnicalDebtReport;

  strengthReport:
    StrengthReport;

  weaknessReport:
    WeaknessReport;

  recommendationReport:
    RecommendationReport;

  repositoryHealth:
    RepositoryHealth;

  architectureQuality:
    ArchitectureQuality;

  architectureDrift:
    ArchitectureDriftReport;

  evolutionInsights:
    EvolutionInsightsReport;

  repositoryIntelligence:
    RepositoryIntelligenceReport;
};

/**
 * Removes repository-purpose classifications that conflict with the
 * strongest detected purpose.
 *
 * Future me:
 * Most repository-purpose conflict resolution now happens earlier inside
 * repository-type-resolution-stage.ts.
 *
 * Keep this final guard small. It should never invent repository types.
 */
const removeConflictingSecondaryTypes = (
  types: string[],
): string[] => {
  const primaryType =
    types[0];

  if (
    primaryType ===
    "ENGINEERING_INTELLIGENCE_PLATFORM"
  ) {
    return types.filter(
      (type) =>
        type !==
        "DEVTOOL_PLATFORM",
    );
  }

  return types;
};

/**
 * Builds the final immutable fingerprint response consumed by ArcHive.
 *
 * At this point repository purpose has already been resolved.
 * This stage must preserve that result rather than reclassifying it.
 */
export const buildFingerprintResult = ({
  state,
  evidenceResults,
  capabilities,
  repositoryDNA,
  repositoryPersona,
  engineeringQuality,
  repositoryMaturity,
  productionReadiness,
  technicalDebt,
  strengthReport,
  weaknessReport,
  recommendationReport,
  repositoryHealth,
  architectureQuality,
  architectureDrift,
  evolutionInsights,
}: {
  state:
    FingerprintState;

  evidenceResults:
    EvidenceResult[];

  capabilities:
    ReturnType<
      typeof detectEngineeringCapabilities
    >;

  repositoryDNA:
    RepositoryDNA;

  repositoryPersona:
    RepositoryPersona;

  engineeringQuality:
    EngineeringQualityResult;

  repositoryMaturity:
    RepositoryMaturity;

  productionReadiness:
    ProductionReadiness;

  technicalDebt:
    TechnicalDebtReport;

  strengthReport:
    StrengthReport;

  weaknessReport:
    WeaknessReport;

  recommendationReport:
    RecommendationReport;

  repositoryHealth:
    RepositoryHealth;

  architectureQuality:
    ArchitectureQuality;

  architectureDrift:
    ArchitectureDriftReport;

  evolutionInsights:
    EvolutionInsightsReport;
}): TechnologyFingerprintResult => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
  } = state;

  const finalTechnologies =
    Array.from(
      technologies,
    );

  const finalArchitectureDomains =
    Array.from(
      architectureDomains,
    );

  const finalEngineeringSignals =
    Array.from(
      engineeringSignals,
    );

  /**
   * Repository purpose was already resolved before reaching this stage.
   *
   * Sorting is retained for backwards compatibility, but normally this
   * should now contain a single canonical repository purpose.
   */
  const finalRepositoryTypes =
    removeConflictingSecondaryTypes(
      sortRepositoryTypesByPurpose(
        Array.from(
          repositoryTypes,
        ),
      ),
    );

  console.log(
    "[FINAL FINGERPRINT REPOSITORY TYPES]",
    finalRepositoryTypes,
  );

  const repositoryIntelligence =
    buildRepositoryIntelligenceReport({
      technologies:
        finalTechnologies,

      architectureDomains:
        finalArchitectureDomains,

      engineeringSignals:
        finalEngineeringSignals,

      reasoningSignals,

      /**
       * Never rebuild repository purpose here.
       * Pass through the canonical result from the resolver.
       */
      repositoryTypes:
        finalRepositoryTypes,

      repositoryPersona,

      repositoryDNA,

      capabilities,

      evidenceResults,

      engineeringQuality,

      productionReadiness,

      repositoryMaturity,

      repositoryHealth,

      technicalDebt,

      architectureDrift,

      evolutionInsights,

      strengthReport,

      weaknessReport,

      recommendationReport,
    });

  /**
   * Temporary diagnostic.
   *
   * This tells us whether buildRepositoryIntelligenceReport() preserves
   * the canonical repository purpose or changes it internally.
   */
  console.log(
    "[FINAL REPOSITORY INTELLIGENCE IDENTITY]",
    {
      fingerprintRepositoryTypes:
        finalRepositoryTypes,

      intelligenceRepositoryTypes:
        repositoryIntelligence
          .identity
          .repositoryTypes,

      primaryRepositoryType:
        repositoryIntelligence
          .identity
          .primaryRepositoryType,
    },
  );

  return {
    technologies:
      finalTechnologies,

    architectureDomains:
      finalArchitectureDomains,

    engineeringSignals:
      finalEngineeringSignals,

    repositoryTypes:
      finalRepositoryTypes,

    reasoningSignals,

    evidenceResults,

    capabilities,

    repositoryDNA,

    repositoryPersona,

    engineeringQuality,

    repositoryMaturity,

    productionReadiness,

    technicalDebt,

    strengthReport,

    weaknessReport,

    recommendationReport,

    repositoryHealth,

    architectureQuality,

    architectureDrift,

    evolutionInsights,

    repositoryIntelligence,
  };
}; 