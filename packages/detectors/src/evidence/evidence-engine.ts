import { EvidenceItem, EvidenceResult } from "./evidence-types";
import { RepositoryType } from "../constants";
import { getEvidenceThreshold } from "./evidence-thresholds";

export const calculateEvidenceResults = (
  evidenceItems: EvidenceItem[]
): EvidenceResult[] => {
  const grouped = new Map<RepositoryType, EvidenceItem[]>();

  for (const item of evidenceItems) {
    const existingItems = grouped.get(item.repositoryType) || [];
    existingItems.push(item);
    grouped.set(item.repositoryType, existingItems);
  }

  return Array.from(grouped.entries())
    .map(([repositoryType, items]) => {
      const totalScore = items.reduce((sum, item) => sum + item.weight, 0);
      const confidence = Math.min(100, totalScore);

      const evidence = Array.from(new Set(items.map((item) => item.label)));

      const strongestEvidence = Array.from(
        new Set(
          items
            .filter((item) => item.strength === "STRONG")
            .map((item) => item.label)
        )
      );

      return {
        repositoryType,
        confidence,
        totalScore,
        evidence,
        strongestEvidence,
      };
    })
    .filter(
      (result) =>
        result.totalScore >= getEvidenceThreshold(result.repositoryType)
    )
    .sort((a, b) => b.totalScore - a.totalScore);
};