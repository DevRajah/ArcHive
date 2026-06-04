export interface ArchitectureEvolutionChange {
    id: string;
    changeType: string;
    detectedTechnology?: string | null;
    fileAffected?: string | null;
    summary?: string | null;
    architectureDomain: string;
    evolutionSummary?: string | null;
    createdAt: string;
}

export interface ArchitectureEvolutionDomain {
    domain: string;
    label: string;
    totalChanges: number;
    latestChangeAt?: string | null;
    technologies: string[];
    changes: ArchitectureEvolutionChange[];
}

export interface ArchitectureEvolutionResponse {
    repository: {
        id: string;
        name: string;
        owner?: string;
        fullName: string;
        description?: string | null;
        defaultBranch?: string;
        language?: string | null;
        stars?: number;
        forks?: number;
        userId?: string;
    };

    summary: {
        totalArchitectureChanges: number;
        totalDomains: number;
        mostActiveDomain?: string | null;
    };

    insights?: {
        architectureStyles?: string[];
    };

    domains: ArchitectureEvolutionDomain[];
}