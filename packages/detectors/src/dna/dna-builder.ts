import { RepositoryDNA } from "./dna-types";

const domainPurposePriority = [
  "ENGINEERING_INTELLIGENCE_PLATFORM",
  "DEVTOOL_PLATFORM",
  "FINTECH_PLATFORM",
  "OBSERVABILITY_PLATFORM",
  "SECURITY_PLATFORM",
  "AI_ML_PROJECT",
  "DATA_ENGINEERING_PROJECT",
  "SMART_TRANSPORT_PLATFORM",
  "ENERGY_PLATFORM",
  "HEALTHCARE_PLATFORM",
  "ECOMMERCE_PLATFORM",
  "EDUCATION_PLATFORM",
  "COLLABORATION_PLATFORM",
];

const getEngineeringProfile = (repositoryTypes: string[]) => {
  return (
    repositoryTypes.find((type) => domainPurposePriority.includes(type)) ||
    repositoryTypes[0] ||
    "GENERAL_ENGINEERING_PROJECT"
  );
};

export const buildRepositoryDNA = ({
  repositoryTypes,
  technologies,
  architectureDomains,
  capabilities,
}: {
  repositoryTypes: string[];
  technologies: string[];
  architectureDomains: string[];
  capabilities: {
    key: string;
    confidence: number;
  }[];
}): RepositoryDNA => {
  const strongestCapabilities =
    capabilities.length > 0
      ? [...capabilities]
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5)
          .map((capability) => ({
            name: capability.key,
            confidence: capability.confidence,
          }))
      : architectureDomains.slice(0, 5).map((domain) => ({
          name: domain,
          confidence: 60,
        }));

  const maturityScore = Math.min(
    100,
    architectureDomains.length * 10 +
      technologies.length * 3 +
      strongestCapabilities.length * 5
  );

  const complexityScore = Math.min(
    100,
    repositoryTypes.length * 15 + architectureDomains.length * 6
  );

  const confidenceScore =
    strongestCapabilities.reduce(
      (sum, capability) => sum + capability.confidence,
      0
    ) / Math.max(strongestCapabilities.length, 1);

  return {
    engineeringProfile: getEngineeringProfile(repositoryTypes),

    dominantArchitecture: architectureDomains,

    strongestCapabilities,

    dominantTechnologies: technologies,

    repositoryTypes,

    engineeringFocus: architectureDomains,

    maturityScore,

    complexityScore,

    confidenceScore: Math.round(confidenceScore),
  };
};