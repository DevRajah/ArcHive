import type {
    EvidenceResult,
} from "../evidence";

import type {
    RepositoryType,
} from "../constants";

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
 * This currently preserves ArcHive's previous behaviour exactly.
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

    const finalRepositoryTypes =
        removeConflictingSecondaryTypes(
            sortRepositoryTypesByPurpose(
                Array.from(
                    repositoryTypes,
                ),
            ),
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

            repositoryTypes:
                Array.from(
                    repositoryTypes,
                ),

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

    return {
        technologies:
            finalTechnologies,

        architectureDomains:
            finalArchitectureDomains,

        engineeringSignals:
            finalEngineeringSignals,

        /**
         * Use the final sorted and conflict-resolved repository types.
         *
         * The previous implementation returned the unsorted Set here even
         * though it built repositoryIntelligence with the final list.
         * Returning the final list keeps both outputs consistent.
         */
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