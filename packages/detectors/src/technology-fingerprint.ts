import {
  buildAnalysisStage,
  buildEngineeringStage,
  buildEvidenceStage,
  buildFingerprintResult,
  buildHealthStage,
  applyLegacyClassificationStage,
  applyLegacyPurposeAdjustmentStage,
  applyRepositoryPurposeStage,
} from "./fingerprint";

import type {
  TechnologyFingerprintResult,
} from "./fingerprint/report-stage";

export type {
  TechnologyFingerprintResult,
} from "./fingerprint/report-stage";

import type {
  RepositoryFileContent,
} from "./evidence";

/**
 * Coordinates the complete ArcHive repository intelligence pipeline.
 *
 * Future me:
 * Keep this file as an orchestrator only.
 * Detection, scoring, health analysis, and report building belong
 * inside their respective fingerprint stages.
 */
export const detectTechnologyFingerprint = (
  filesChanged: string[],
  commitMessages: string[],
  repositoryContext = "",
  repositoryFiles: RepositoryFileContent[] = [],
): TechnologyFingerprintResult => {
  const joinedFiles =
    filesChanged
      .join(" ")
      .toLowerCase();

  const joinedCommits =
    commitMessages
      .join(" ")
      .toLowerCase();

  /**
   * This preserves the previous legacy-classification behaviour.
   *
   * repositoryContext is processed separately by the evidence stage.
   */
  const combinedText =
    `${joinedFiles} ${joinedCommits}`;

  const technologies =
    new Set<string>();

  const architectureDomains =
    new Set<string>();

  const engineeringSignals =
    new Set<string>();

  const repositoryTypes =
    new Set<string>();

  const reasoningSignals:
    string[] = [];

  const addReasoningSignal = (
    signal: string,
  ): void => {
    if (
      !reasoningSignals.includes(
        signal,
      )
    ) {
      reasoningSignals.push(
        signal,
      );
    }
  };

  const state = {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
    addReasoningSignal,
  };

  /**
   * Stage 1:
   * Build structured evidence and run repository and technology detectors.
   */
  const {
    evidenceContext,
    evidenceResults,
  } = buildEvidenceStage(
    filesChanged,
    commitMessages,
    repositoryContext,
    repositoryFiles,
  );

  /**
   * Stage 2:
   * Preserve older classifications while the evidence-aware engine
   * gradually replaces the remaining broad keyword heuristics.
   */
  applyLegacyClassificationStage({
    filesChanged,
    combinedText,
    state,
  });

  /**
   * Stage 3:
   * Convert repository-purpose evidence into technologies,
   * architecture domains, and engineering signals.
   *
   * This stage was missing from the previous shortened version.
   */
  applyRepositoryPurposeStage({
    evidenceResults,
    state,
  });

  /**
   * Stage 4:
   * Build capabilities, repository persona, DNA, and engineering quality.
   */
  const {
    capabilities,
    repositoryPersona,
    repositoryDNA,
    engineeringQuality,
  } = buildEngineeringStage({
    filesChanged,
    commitMessages,
    combinedText,
    evidenceContext,
    state,
  });

  /**
   * Stage 5:
   * Build production readiness, maturity, debt, strengths,
   * weaknesses, and overall repository health.
   */
  const {
    productionReadiness,
    repositoryMaturity,
    technicalDebt,
    strengthReport,
    weaknessReport,
    repositoryHealth,
  } = buildHealthStage({
    engineeringQuality,
    state,
  });

  /**
   * Stage 6:
   * Build architecture quality, drift, evolution, and recommendations.
   */
  const {
    architectureQuality,
    architectureDrift,
    evolutionInsights,
    recommendationReport,
  } = buildAnalysisStage({
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
  });

  /**
   * Stage 7:
   * Apply final legacy repository-purpose adjustments after all
   * reasoning signals and classifications have been produced.
   */
  applyLegacyPurposeAdjustmentStage({
    filesChanged,
    commitMessages,
    state,
  });

  /**
   * Stage 8:
   * Build the final response consumed by the API, worker,
   * dashboards, reports, and repository intelligence features.
   */
  return buildFingerprintResult({
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
  });
};