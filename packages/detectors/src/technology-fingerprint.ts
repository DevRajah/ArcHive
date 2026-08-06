import {
    applyLegacyClassificationStage,
    applyLegacyPurposeAdjustmentStage,
    applyRepositoryPurposeStage,
    applyTechnologyConflictStage,
    buildAnalysisStage,
    buildEngineeringStage,
    buildEvidenceStage,
    buildFingerprintResult,
    buildHealthStage,
    applyFrameworkVersionStage,
    applyTechnologyRelationshipStage,
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
 * Detection, scoring, health analysis, and report building belong
 * inside their respective fingerprint stages.
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
   * The remaining legacy classifier receives filtered implementation paths.
   *
   * This prevents ArcHive from classifying itself as Kafka, MongoDB,
   * Kubernetes, Anthropic, and similar technologies merely because those
   * words exist inside detector source filenames.
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
     * Apply final legacy repository-purpose adjustments after all
     * reasoning signals and classifications have been produced.
     */
    applyLegacyPurposeAdjustmentStage({
        filesChanged,
        commitMessages,
        state,
    });

    /**
     * Stage 6:
     * Resolve any conflicts between identified technologies.
     */
    applyTechnologyConflictStage({
        state,
    });

    /**
 * Add exact dependency-version context after generic classifications
 * and duplicate labels have been resolved.
 */
    applyFrameworkVersionStage({
        evidenceContext,
        state,
    });

    /**
     * Explain how confirmed technologies interact before health,
     * architecture, and recommendation reports are generated.
     */
    applyTechnologyRelationshipStage({
        evidenceContext,
        state,
    });

    /**
 * Stage 7:
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
 * Stage 8:
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
     * Stage 9:
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