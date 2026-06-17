import { RepositoryDNA } from "./dna-types";

export const buildRepositoryDNA = ({
    repositoryTypes,
    technologies,
    architectureDomains,
    capabilities,
}: {
    repositoryTypes: string[];
    technologies: string[];
    architectureDomains: string[];
    capabilities: {
        key: string;
        confidence: number;
    }[];
}): RepositoryDNA => {
    const strongestCapabilities = [...capabilities]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    const maturityScore = Math.min(
        100,
        architectureDomains.length * 10 +
            technologies.length * 3 +
            capabilities.length * 5
    );

    const complexityScore = Math.min(
        100,
        repositoryTypes.length * 15 +
            architectureDomains.length * 6
    );

    const confidenceScore =
        strongestCapabilities.reduce(
            (sum, capability) => sum + capability.confidence,
            0
        ) /
        Math.max(strongestCapabilities.length, 1);

    return {
        engineeringProfile:
            repositoryTypes[0] ?? "GENERAL_ENGINEERING_PROJECT",

        dominantArchitecture: architectureDomains,

        strongestCapabilities: strongestCapabilities.map((capability) => ({
            name: capability.key,
            confidence: capability.confidence,
        })),

        dominantTechnologies: technologies,

        repositoryTypes,

        engineeringFocus: architectureDomains,

        maturityScore,

        complexityScore,

        confidenceScore: Math.round(confidenceScore),
    };
};