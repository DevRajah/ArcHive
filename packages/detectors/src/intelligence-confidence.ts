type CalculateConfidenceInput = {
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  reasoningSignals: string[];
};

export const calculateIntelligenceConfidence = ({
  repositoryTypes,
  domains,
  technologies,
  reasoningSignals,
}: CalculateConfidenceInput) => {
  let score = 0;

  score += repositoryTypes.length * 25;
  score += domains.length * 10;
  score += technologies.length * 5;
  score += reasoningSignals.length * 15;

  const normalizedScore = Math.min(100, score);

  let confidenceLevel = "LOW";

  if (normalizedScore >= 70) {
    confidenceLevel = "HIGH";
  } else if (normalizedScore >= 40) {
    confidenceLevel = "MEDIUM";
  }

  return {
    confidenceScore: normalizedScore,
    confidenceLevel,
  };
};