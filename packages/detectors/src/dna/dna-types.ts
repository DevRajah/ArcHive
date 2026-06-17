export type RepositoryDNA = {
    engineeringProfile: string;

    dominantArchitecture: string[];

    strongestCapabilities: {
        name: string;
        confidence: number;
    }[];

    dominantTechnologies: string[];

    repositoryTypes: string[];

    engineeringFocus: string[];

    maturityScore: number;

    complexityScore: number;

    confidenceScore: number;
};