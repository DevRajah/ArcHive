type RepositorySimilarityInput = {
  sourceRepositoryTypes: string[];
  sourceDomains: string[];
  sourceTechnologies: string[];

  targetRepositoryTypes: string[];
  targetDomains: string[];
  targetTechnologies: string[];
};

export const calculateRepositorySimilarity = ({
  sourceRepositoryTypes,
  sourceDomains,
  sourceTechnologies,
  targetRepositoryTypes,
  targetDomains,
  targetTechnologies,
}: RepositorySimilarityInput) => {
  let score = 0;

  const sharedRepositoryTypes = sourceRepositoryTypes.filter((type) =>
    targetRepositoryTypes.includes(type)
  );

  const sharedDomains = sourceDomains.filter((domain) =>
    targetDomains.includes(domain)
  );

  const sharedTechnologies = sourceTechnologies.filter((technology) =>
    targetTechnologies.includes(technology)
  );

  score += sharedRepositoryTypes.length * 35;
  score += sharedDomains.length * 15;
  score += sharedTechnologies.length * 5;

  const similarityScore = Math.min(100, score);

  let similarityLevel = "LOW";

  if (similarityScore >= 70) {
    similarityLevel = "HIGH";
  } else if (similarityScore >= 40) {
    similarityLevel = "MEDIUM";
  }

  return {
    similarityScore,
    similarityLevel,

    sharedSignals: {
      repositoryTypes: sharedRepositoryTypes,
      domains: sharedDomains,
      technologies: sharedTechnologies,
    },
  };
};