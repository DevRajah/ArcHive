import {
  CapabilityContext,
  CapabilityContextInput,
  CapabilityKey,
  CapabilityResult,
} from "./types";

export const createCapabilityContext = ({
  filesChanged,
  commitMessages,
  repositoryContext,
}: CapabilityContextInput): CapabilityContext => {
  const capabilities: CapabilityResult[] = [];

  const combinedText = [...filesChanged, ...commitMessages, repositoryContext]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const addCapability = (
    key: CapabilityKey,
    confidence: number,
    reason: string
  ) => {
    const existing = capabilities.find((capability) => capability.key === key);

    if (!existing) {
      capabilities.push({
        key,
        confidence: Math.min(100, confidence),
        reason,
      });

      return;
    }

    if (confidence > existing.confidence) {
      existing.confidence = Math.min(100, confidence);
      existing.reason = reason;
    }
  };

  return {
    filesChanged,
    commitMessages,
    combinedText,
    capabilities,
    addCapability,
  };
};