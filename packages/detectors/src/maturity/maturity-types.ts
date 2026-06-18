export type MaturityArea =
  | "ARCHITECTURE"
  | "SCALABILITY"
  | "SECURITY"
  | "TESTING"
  | "OBSERVABILITY"
  | "MAINTAINABILITY"
  | "DOCUMENTATION"
  | "DEVOPS"
  | "PRODUCTION_READINESS";

export type MaturityLevel =
  | "BASIC"
  | "DEVELOPING"
  | "MATURE"
  | "ADVANCED";

export type MaturityAssessment = {
  area: MaturityArea;
  score: number;
  level: MaturityLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type RepositoryMaturityLevel =
  | "PROTOTYPE"
  | "GROWING"
  | "PRODUCTION_READY"
  | "ENTERPRISE_READY";

export type RepositoryMaturity = {
  score: number;
  level: RepositoryMaturityLevel;
  summary: string;
  assessments: MaturityAssessment[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reasons: string[];
};

export type MaturityInput = {
  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  engineeringSignals: string[];
  reasoningSignals: string[];
  engineeringQuality: {
    overallScore: number;
    scores: {
      area: string;
      score: number;
      reasons: string[];
    }[];
  };
  productionReadiness?: {
    score: number;
    level: string;
    blockers: string[];
    strengths: string[];
  };
};