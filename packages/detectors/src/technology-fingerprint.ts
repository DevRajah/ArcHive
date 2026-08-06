import {
    applyFrameworkVersionStage,
    applyLegacyClassificationStage,
    applyLegacyPurposeAdjustmentStage,
    applyRepositoryPurposeStage,
    applyTechnologyConflictStage,
    applyTechnologyRelationshipStage,
    buildAnalysisStage,
    buildDependencyGraphStage,
    buildEngineeringStage,
    buildEvidenceStage,
    buildFingerprintResult,
    buildHealthStage,
    buildTechnologyConfidenceStage,
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
     * Collect structured evidence and run repository and technology detectors.
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

    console.log("Evidence Results");
    console.table(
        evidenceResults.map((item) => ({
            type: item.repositoryType,
            score: item.totalScore,
            confidence: item.confidence,
        })),
    );

    /**
     * Give the temporary legacy classifier only filtered implementation
     * paths and real commit context.
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
     * Preserve legacy classifications that have not yet been replaced.
     */
    applyLegacyClassificationStage({
        filesChanged,
        combinedText,
        state,
    });

    /**
     * Stage 3:
     * Map repository-purpose evidence into the shared fingerprint state.
     */
    applyRepositoryPurposeStage({
        evidenceResults,
        state,
    });

    console.log(
        "Repository types after purpose stage",
    );

    console.log(
        [...state.repositoryTypes],
    );

    /**
     * Stage 4:
     * Build capabilities, repository persona, DNA, and engineering quality.
     *
     * This stage also adds confirmed technology evidence to state.technologies.
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
     * Remove generic labels when a stronger specific technology exists.
     */
    applyTechnologyConflictStage({
        state,
    });

    /**
     * Stage 6:
     * Add framework version context from parsed dependency versions.
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
     * Stage 10:
     * Apply late repository-purpose adjustments after all classifications
     * and reasoning signals have been produced.
     */
    applyLegacyPurposeAdjustmentStage({
        filesChanged,
        commitMessages,
        repositoryContext,
        state,
    });

    /**
     * Stage 11:
     * Build the dependency graph only now that confirmed technologies exist.
     */
    //   const dependencyGraph =
    //     buildDependencyGraphStage({
    //       evidenceContext,
    //       state,
    //     });

    /**
     * Stage 12:
     * Build confidence details from the complete technology evidence set.
     */
    //   const technologyConfidence =
    //     buildTechnologyConfidenceStage(
    //       evidenceContext,
    //     );

    console.log(
        "Final repository types",
    );

    console.log(
        [...state.repositoryTypes],
    );

    /**
     * Stage 13:
     * Build the final response consumed by the API, workers,
     * dashboards, and reports.
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
        //dependencyGraph,
        //technologyConfidence,
    });
};