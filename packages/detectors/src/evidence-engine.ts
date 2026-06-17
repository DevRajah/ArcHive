export type EvidenceItem = {
  repositoryType: string;
  label: string;
  weight: number;
};

export type EvidenceResult = {
  repositoryType: string;
  confidence: number;
  evidence: string[];
};

export const calculateEvidenceResults = (evidenceItems: EvidenceItem[]) => {
  const grouped = new Map<string, EvidenceItem[]>();

  for (const item of evidenceItems) {
    const existing = grouped.get(item.repositoryType) || [];
    existing.push(item);
    grouped.set(item.repositoryType, existing);
  }

  return Array.from(grouped.entries())
    .map(([repositoryType, items]) => {
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

      return {
        repositoryType,
        confidence: Math.min(100, totalWeight),
        evidence: items.map((item) => item.label),
      };
    })
    .filter((result) => result.confidence >= 60);
};