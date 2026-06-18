export type RepositoryComparisonLevel = "LOW" | "MEDIUM" | "HIGH";

export type RepositoryComparisonInput = {
  source: {
    name: string;
    repositoryTypes: string[];
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    healthScore?: number;
    maturityScore?: number;
  };
  target: {
    name: string;
    repositoryTypes: string[];
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    healthScore?: number;
    maturityScore?: number;
  };
};

export type RepositoryComparison = {
  similarityScore: number;
  similarityLevel: RepositoryComparisonLevel;
  sharedSignals: {
    repositoryTypes: string[];
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
  };
  keyDifferences: string[];
  recommendations: string[];
};