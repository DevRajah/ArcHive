export type IntelligenceDiffDirection =
  | "UP"
  | "DOWN"
  | "UNCHANGED"
  | null;

export interface IntelligenceDiffRepository {
  id: string;
  name: string;
  fullName: string | null;
}

export interface IntelligenceDiffSummary {
  headline: string;
  description: string;
}

export interface IntelligenceDiffScoreChange {
  label: string;
  previous: number | string | null;
  current: number | string | null;
  direction: IntelligenceDiffDirection;
  summary: string | null;
}

export interface IntelligenceDiffSignalGroup {
  added: string[];
  removed: string[];
  unchanged: string[];
}

export interface IntelligenceDiffSignalChanges {
  technologies: IntelligenceDiffSignalGroup;
  architectureDomains: IntelligenceDiffSignalGroup;
  repositoryTypes: IntelligenceDiffSignalGroup;
  capabilities: IntelligenceDiffSignalGroup;
}

export interface IntelligenceDiffRecommendationChanges {
  added: string[];
  resolved: string[];
  removed: string[];
}

export interface RepositoryIntelligenceDiffResponse {
  repository: IntelligenceDiffRepository;
  hasDiff: boolean;
  generatedAt: string | null;
  summary: IntelligenceDiffSummary | null;
  scoreChanges: IntelligenceDiffScoreChange[];
  signalChanges: IntelligenceDiffSignalChanges;
  recommendationChanges: IntelligenceDiffRecommendationChanges;
}