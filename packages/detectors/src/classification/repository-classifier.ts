import { EvidenceResult } from "../evidence";
import { RepositoryType } from "../constants";
import {
    classificationConflicts,
    dominantRepositoryTypes,
} from "./classification-rules";
import {
    ClassifiedRepositoryIdentity,
    RepositoryClassification,
} from "./types";
import { negativeEvidenceRules } from "./negative-evidence";

const isDominantType = (repositoryType: RepositoryType) =>
    dominantRepositoryTypes.includes(repositoryType);

const calculateAdjustedScore = (result: EvidenceResult) => {
    const dominantBonus = isDominantType(result.repositoryType) ? 12 : 0;
    return result.totalScore + dominantBonus;
};

const calculateNegativePenalty = (
    repositoryType: RepositoryType,
    acceptedTypes: RepositoryType[]
) => {
    return negativeEvidenceRules
        .filter(
            (rule) =>
                acceptedTypes.includes(rule.source) &&
                rule.target === repositoryType
        )
        .reduce((sum, rule) => sum + rule.penalty, 0);
};

export const classifyRepositoryFromEvidence = (
    evidenceResults: EvidenceResult[]
): RepositoryClassification => {
    const ranked = evidenceResults
        .map((result) => ({
            repositoryType: result.repositoryType,
            confidence: result.confidence,
            totalScore: calculateAdjustedScore(result),
            evidence: result.evidence,
            role: "SECONDARY" as const,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

    const accepted: ClassifiedRepositoryIdentity[] = [];
    const rejected: ClassifiedRepositoryIdentity[] = [];

    for (const candidate of ranked) {
        const conflicts = classificationConflicts[candidate.repositoryType] || [];

        const strongerConflict = accepted.find((acceptedCandidate) =>
            conflicts.includes(acceptedCandidate.repositoryType)
        );

        if (strongerConflict && strongerConflict.totalScore > candidate.totalScore) {
            rejected.push({
                ...candidate,
                role: "REJECTED",
                rejectionReason: `Suppressed by stronger ${strongerConflict.repositoryType} evidence.`,
            });
            continue;
        }

        const penalty = calculateNegativePenalty(
            candidate.repositoryType,
            accepted.map((item) => item.repositoryType)
        );

        candidate.totalScore -= penalty;

        if (candidate.totalScore <= 0) {
            rejected.push({
                ...candidate,
                role: "REJECTED",
                rejectionReason: "Negative evidence outweighed positive evidence.",
            });

            continue;
        }

        accepted.push(candidate);
    }

    const primary = accepted[0]
        ? {
            ...accepted[0],
            role: "PRIMARY" as const,
        }
        : null;

    const secondary = accepted.slice(1, 4).map((item) => ({
        ...item,
        role: "SECONDARY" as const,
    }));

    const overflowRejected = accepted.slice(4).map((item) => ({
        ...item,
        role: "REJECTED" as const,
        rejectionReason: "Lower-ranked evidence compared with stronger repository identities.",
    }));

    const finalRejected = [...rejected, ...overflowRejected];

    return {
        primary,
        secondary,
        rejected: finalRejected,
        rankedEvidence: [
            ...(primary ? [primary] : []),
            ...secondary,
            ...finalRejected,
        ],
        repositoryTypes: [
            ...(primary ? [primary.repositoryType] : []),
            ...secondary.map((item) => item.repositoryType),
        ],
    };
};