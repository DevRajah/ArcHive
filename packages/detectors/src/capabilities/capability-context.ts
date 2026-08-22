import {
  CapabilityContext,
  CapabilityContextInput,
  CapabilityKey,
  CapabilityResult,
} from "./types";


export const createCapabilityContext = ({
  evidenceContext,
}: CapabilityContextInput): CapabilityContext => {
  const capabilities: CapabilityResult[] = [];

  /**
   * Add one detected engineering capability.
   *
   * If multiple detectors eventually contribute evidence for the
   * same capability, keep the strongest confidence result.
   */
  const addCapability = (
    key: CapabilityKey,
    confidence: number,
    reason: string
  ) => {
    const existing = capabilities.find(
      (capability) => capability.key === key
    );

    if (!existing) {
      capabilities.push({
        key,
        confidence: Math.min(100, confidence),
        reason,
      });

      return;
    }

    if (confidence > existing.confidence) {
      existing.confidence = Math.min(
        100,
        confidence
      );

      existing.reason = reason;
    }
  };

  return {
    evidenceContext,
    capabilities,
    addCapability,
  };
};