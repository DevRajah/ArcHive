import { RepositoryIntelligenceReport } from "../repository-intelligence";
import { ArchitectureRadarItem } from "./architecture-intelligence-types";
import { architectureDomainWeights } from "./architecture-domain-weights";

const labelFromDomain = (domain: string) =>
  domain
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getStrength = (score: number): ArchitectureRadarItem["strength"] => {
  if (score >= 85) return "DOMINANT";
  if (score >= 65) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

const addScore = ({
  score,
  evidence,
  points,
  reason,
}: {
  score: number;
  evidence: string[];
  points: number;
  reason: string;
}) => {
  evidence.push(reason);
  return score + points;
};

export const scoreArchitectureDomains = (
  repositoryIntelligence: RepositoryIntelligenceReport
): ArchitectureRadarItem[] => {
  const repositoryTypes = repositoryIntelligence.identity.repositoryTypes;
  const technologies = repositoryIntelligence.signals.technologies;
  const architectureDomains = repositoryIntelligence.signals.architectureDomains;
  const engineeringSignals = repositoryIntelligence.signals.engineeringSignals;

  // I convert capability keys to plain strings here because the architecture radar
  // is a scoring/visualisation layer, not a strict capability validation layer.
  const capabilities = repositoryIntelligence.signals.capabilities.map(
    (capability) => String(capability.key)
  );

  return Object.entries(architectureDomainWeights)
    .map(([domain, weights]) => {
      let score = 0;
      const evidence: string[] = [];

      if (
        weights.repositoryTypes.some((item) =>
          repositoryTypes.includes(item)
        )
      ) {
        score = addScore({
          score,
          evidence,
          points: 35,
          reason: "Matched repository purpose/type evidence.",
        });
      }

      if (
        weights.technologies.some((item) =>
          technologies.includes(item)
        )
      ) {
        score = addScore({
          score,
          evidence,
          points: 25,
          reason: "Matched technology evidence.",
        });
      }

      if (
        weights.architectureDomains.some((item) =>
          architectureDomains.includes(item)
        )
      ) {
        score = addScore({
          score,
          evidence,
          points: 25,
          reason: "Matched architecture domain evidence.",
        });
      }

      if (
        weights.engineeringSignals.some((item) =>
          engineeringSignals.includes(item)
        )
      ) {
        score = addScore({
          score,
          evidence,
          points: 15,
          reason: "Matched engineering signal evidence.",
        });
      }

      if (
        weights.capabilities.some((item) =>
          capabilities.includes(String(item))
        )
      ) {
        score = addScore({
          score,
          evidence,
          points: 20,
          reason: "Matched capability evidence.",
        });
      }

      const finalScore = Math.min(100, score);

      return {
        domain,
        label: labelFromDomain(domain),
        score: finalScore,
        strength: getStrength(finalScore),
        evidence,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
};