import { RepositoryIntelligenceReport } from "../repository-intelligence";
import { scoreArchitectureDomains } from "./architecture-domain-scoring";
import { ArchitectureIntelligenceReport } from "./architecture-intelligence-types";

export const buildArchitectureIntelligence = ({
  repositoryIntelligence,
}: {
  repositoryIntelligence: RepositoryIntelligenceReport;
}): ArchitectureIntelligenceReport => {
  const radar = scoreArchitectureDomains(repositoryIntelligence);

  return {
    strongestDomain: radar[0] || null,
    radar,
  };
};