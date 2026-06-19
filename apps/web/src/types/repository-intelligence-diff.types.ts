export interface IntelligenceDiffChange {
  label: string;
  previous?: string | number | null;
  current?: string | number | null;
  direction?: "UP" | "DOWN" | "UNCHANGED" | string;
  summary?: string | null;
}

export interface IntelligenceDiffSignalGroup {
  added?: string[];
  removed?: string[];
  unchanged?: string[];
}

export interface RepositoryIntelligenceDiffResponse {
  repository?: {
    id: string;
    name: string;
    fullName?: string | null;
  };

  hasDiff?: boolean;

  generatedAt?: string | null;

  scoreChanges?: IntelligenceDiffChange[];

  signalChanges?: {
    technologies?: IntelligenceDiffSignalGroup;
    architectureDomains?: IntelligenceDiffSignalGroup;
    repositoryTypes?: IntelligenceDiffSignalGroup;
    capabilities?: IntelligenceDiffSignalGroup;
  };

  recommendationChanges?: {
    added?: string[];
    resolved?: string[];
    removed?: string[];
  };

  summary?: {
    headline?: string | null;
    description?: string | null;
  };
}