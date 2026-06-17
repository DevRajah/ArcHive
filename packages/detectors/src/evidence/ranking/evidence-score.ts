import { EvidenceResult } from "../evidence-types";

export const scoreEvidence = (
    evidence: EvidenceResult[]
): EvidenceResult[] => {
    return evidence
        .map((item) => ({
            ...item,
            totalWeight: item.totalScore,
        }))
        .sort((a, b) => b.totalWeight - a.totalWeight);
};