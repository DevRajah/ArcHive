export interface RepositoryCapabilitiesResponse {
    repository: {
        id: string;
        name: string;
        fullName: string;
    };

    capabilities: {
        frontendArchitecture?: boolean;
        apiLayer?: boolean;
        authentication?: boolean;
        realtimeSystems?: boolean;
        queueInfrastructure?: boolean;
        databaseLayer?: boolean;
        cachingLayer?: boolean;
        devopsInfrastructure?: boolean;
        dependencyManagement?: boolean;
        typeContracts?: boolean;
        stateManagement?: boolean;
        architectureIntelligence?: boolean;
    };

    scores: {
        repositoryMaturityScore: number;
        capabilityScore: number;

        infrastructureDepthScore: number;
        infrastructureDepth: string;

        infrastructureDepthEvidence?: {
            detected: string[];
            detectedCount: number;
            totalPossible: number;
        };

        /**
         * @deprecated
         * Use repositoryMaturityScore instead.
         */
        architectureMaturityScore: number;

        /**
         * @deprecated
         * Use capabilityScore instead.
         */
        engineeringComplexityScore: number;
    };

    repositoryPurpose?: {
        purposeType: string;
        label: string;
        description: string;
    } | null;

    detectedDomains: string[];
    detectedTechnologies: string[];
    reasoningSignals?: string[];
    detectedRepositoryTypes?: string[];
    repositoryTypes?: string[];

    architectureStyles?: string[];
}