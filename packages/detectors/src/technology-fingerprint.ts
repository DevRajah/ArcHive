import {
  applyFrameworkVersionStage,
  applyLegacyClassificationStage,
  applyLegacyPurposeAdjustmentStage,
  applyRepositoryPurposeStage,
  applyRepositoryTypeResolutionStage,
  applyTechnologyConflictStage,
  applyTechnologyRelationshipStage,
  buildAnalysisStage,
  buildEngineeringStage,
  buildEvidenceStage,
  buildFingerprintResult,
  buildHealthStage,
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

import {
  getImplementationFiles,
} from "./technologies/technology-context";

/**
 * Coordinates the complete ArcHive repository intelligence pipeline.
 *
 * Future me:
 * Keep this file as an orchestrator only.
 *
 * Detection, scoring, health analysis, architecture analysis,
 * and report building belong inside their respective stages.
 */
export const detectTechnologyFingerprint = (
  filesChanged: string[],
  commitMessages: string[],
  repositoryContext = "",
  repositoryFiles: RepositoryFileContent[] = [],
): TechnologyFingerprintResult => {
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
   * Collect structured evidence and run repository-purpose
   * and technology detectors.
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
   * Give the temporary legacy classifier only filtered
   * implementation paths and real commit context.
   *
   * This reduces false positives caused by detector source files
   * mentioning technologies that the analysed repository does not use.
   */
  const combinedText = [
    ...getImplementationFiles(
      evidenceContext,
    ),
    ...commitMessages,
  ]
    .join(" ")
    .toLowerCase();

  /**
   * Stage 2:
   * Run remaining legacy classification.
   *
   * This is kept temporarily for backward compatibility while
   * structured evidence continues replacing older heuristics.
   */
  const repositoryTypesBeforeLegacy =
    new Set(
      state.repositoryTypes,
    );

  applyLegacyClassificationStage({
    filesChanged,
    combinedText,
    state,
  });

  const legacyAddedRepositoryTypes =
    Array.from(
      state.repositoryTypes,
    ).filter(
      (repositoryType) =>
        !repositoryTypesBeforeLegacy.has(
          repositoryType,
        ),
    );

  console.log(
    "[LEGACY TYPES ADDED]",
    legacyAddedRepositoryTypes,
  );

  /**
   * Stage 3:
   * Convert structured repository-purpose evidence into
   * the shared fingerprint state.
   */
  applyRepositoryPurposeStage({
    evidenceResults,
    state,
  });

  /**
   * Stage 4:
   * Build capabilities, repository persona, DNA,
   * and engineering quality.
   *
   * This stage can also add confirmed technologies
   * to state.technologies.
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
   * Remove generic technology labels where stronger,
   * more specific technology evidence exists.
   */
  applyTechnologyConflictStage({
    state,
  });

  /**
   * Stage 6:
   * Add framework-version context from parsed dependencies.
   */
  applyFrameworkVersionStage({
    evidenceContext,
    state,
  });

  /**
   * Stage 7:
   * Explain meaningful relationships between confirmed technologies.
   */
  applyTechnologyRelationshipStage({
    evidenceContext,
    state,
  });

  /**
   * Stage 8:
   * Build production readiness, maturity, technical debt,
   * strengths, weaknesses, and repository health.
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
   * Stage 9:
   * Build architecture quality, drift, evolution,
   * and recommendations.
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
   * Stage 10:
   * Allow the remaining late legacy purpose adjustments to run.
   *
   * Important:
   * This stage can still add noisy repository types such as
   * DEVTOOL_PLATFORM.
   *
   * That is why repository-purpose resolution runs AFTER this stage.
   */
  const repositoryTypesBeforeLateAdjustment =
    new Set(
      state.repositoryTypes,
    );

  applyLegacyPurposeAdjustmentStage({
    filesChanged,
    commitMessages,
    repositoryContext,
    state,
  });

  const lateAddedRepositoryTypes =
    Array.from(
      state.repositoryTypes,
    ).filter(
      (repositoryType) =>
        !repositoryTypesBeforeLateAdjustment.has(
          repositoryType,
        ),
    );

  console.log(
    "[LATE PURPOSE TYPES ADDED]",
    lateAddedRepositoryTypes,
  );

  /**
   * Stage 11:
   * Resolve the canonical repository purpose.
   *
   * This MUST run after every legacy classifier.
   *
   * Structured evidence gets the final say over repository identity.
   * Any unsupported repository-purpose classifications introduced by
   * legacy stages are removed here.
   */
  applyRepositoryTypeResolutionStage({
    evidenceResults,
    state,
  });

  /**
   * Stage 12:
   * Dependency graph generation will return here once the final
   * report DTO exposes it again.
   *
   * const dependencyGraph =
   *   buildDependencyGraphStage({
   *     evidenceContext,
   *     state,
   *   });
   */

  /**
   * Stage 13:
   * Technology-confidence reporting will return here once the
   * final report DTO exposes it again.
   *
   * const technologyConfidence =
   *   buildTechnologyConfidenceStage(
   *     evidenceContext,
   *   );
   */

  /**
   * Stage 14:
   * Build the final response consumed by the API,
   * workers, dashboards, and reports.
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