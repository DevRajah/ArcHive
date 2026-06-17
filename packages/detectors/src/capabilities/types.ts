export type CapabilityKey =
  | "QUEUE_INFRASTRUCTURE"
  | "REALTIME_SYSTEMS"
  | "API_LAYER"
  | "DATABASE_LAYER"
  | "CACHE_INFRASTRUCTURE"
  | "AUTHENTICATION"
  | "DEVOPS_INFRASTRUCTURE"
  | "TESTING"
  | "OBSERVABILITY";

export type CapabilityResult = {
  key: CapabilityKey;
  confidence: number;
  reason: string;
};

export type CapabilityContextInput = {
  filesChanged: string[];
  commitMessages: string[];
  repositoryContext?: string;
};

export type CapabilityContext = {
  filesChanged: string[];
  commitMessages: string[];
  combinedText: string;
  capabilities: CapabilityResult[];
  addCapability: (
    key: CapabilityKey,
    confidence: number,
    reason: string
  ) => void;
};