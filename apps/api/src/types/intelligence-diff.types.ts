export type IntelligenceDiffDirection =
  | "UP"
  | "DOWN"
  | "UNCHANGED"
  | null;

export type IntelligenceScoreChange = {
  label: string;
  previous: number | string | null;
  current: number | string | null;
  direction: IntelligenceDiffDirection;
  summary: string | null;
};

export type IntelligenceSignalChange = {
  added: string[];
  removed: string[];
  unchanged: string[];
};

export type IntelligenceDiffResponse = {
  repository: {
    id: string;
    name: string;
    fullName: string | null;
  };

  hasDiff: boolean;

  generatedAt: string | null;

  summary: {
    headline: string;
    description: string;
  } | null;

  scoreChanges: IntelligenceScoreChange[];

  signalChanges: {
    technologies: IntelligenceSignalChange;
    architectureDomains: IntelligenceSignalChange;
    repositoryTypes: IntelligenceSignalChange;
    capabilities: IntelligenceSignalChange;
  };

  recommendationChanges: {
    added: string[];
    resolved: string[];
    removed: string[];
  };
};