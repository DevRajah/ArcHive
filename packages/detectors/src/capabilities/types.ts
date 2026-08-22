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

import type {
  EvidenceContext,
} from "../evidence";

export type CapabilityResult = {
  key: CapabilityKey;
  confidence: number;
  reason: string;
};

export type CapabilityContextInput = {
  /**
   * Canonical repository evidence produced by the evidence stage.
   *
   * Future me:
   * Do not rebuild repository evidence from arbitrary strings here.
   * Capability detectors should consume the same evidence model used
   * by the rest of the fingerprint pipeline.
   */
  evidenceContext: EvidenceContext;
};

export type CapabilityContext = {
  /**
   * Canonical evidence for the repository.
   */
  evidenceContext: EvidenceContext;

  capabilities: CapabilityResult[];

  addCapability: (
    key: CapabilityKey,
    confidence: number,
    reason: string
  ) => void;
};