import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectEngineeringIntelligenceEvidence = (
  context: EvidenceContext
) => {
  const { combinedText, addEvidence } = context;

  const hasEngineeringIntelligenceSignal = includesAny(combinedText, [
    "repository intelligence",
    "engineering intelligence",
    "architecture intelligence",
    "repository fingerprint",
    "technology fingerprint",
    "architecture evolution",
    "architecture drift",
    "repository health",
    "engineering quality",
    "repository maturity",
    "technical debt",
    "repository persona",
    "repository dna",
    "codebase intelligence",
  ]);

  const hasGithubAnalysisSignal = includesAny(combinedText, [
    "github webhook",
    "github oauth",
    "repository import",
    "tracked repository",
    "engineering event",
    "architecture change",
    "repository timeline",
    "commit analysis",
    "repository analysis",
  ]);

  if (hasEngineeringIntelligenceSignal && hasGithubAnalysisSignal) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected repository intelligence, architecture analysis, and GitHub repository analysis signals",
      95,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }
};