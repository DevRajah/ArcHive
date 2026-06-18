export interface ComparisonRepository {
  id: string;
  name: string;
  fullName?: string | null;
  language?: string | null;
}

export interface RepositoryComparisonSummary {
  id: string;
  name: string;
  fullName?: string | null;
  primaryRepositoryType?: string | null;
  persona?: string | null;
  healthScore?: number | null;
  healthStatus?: string | null;
  maturityScore?: number | null;
  maturityLevel?: string | null;
  productionReadinessScore?: number | null;
  productionReadinessLevel?: string | null;
  engineeringQualityScore?: number | null;
  technologies?: string[];
  architectureDomains?: string[];
  repositoryTypes?: string[];
  enabledCapabilities?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}