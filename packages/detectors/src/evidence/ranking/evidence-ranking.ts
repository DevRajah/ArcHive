import { NegativeEvidence } from "./negative-evidence";
import { scoreEvidence } from "./evidence-score";
import { buildRepositoryIdentity } from "./repository-identity";
import { calculateConfidenceScore } from "./confidence-score";

import {
    EvidenceResult,
} from "../evidence-types";

import {
    EvidenceThresholds,
} from "../evidence-thresholds";

export const rankRepositoryEvidence = (
    evidence: EvidenceResult[]
) => {

    const ranked = scoreEvidence(evidence);

    const filtered = ranked.filter((candidate) => {

        const conflicts =
            NegativeEvidence[candidate.repositoryType] ?? [];

        return !ranked.some(
            (other) =>
                other.totalScore >
                    candidate.totalScore &&
                conflicts.includes(other.repositoryType)
        );
    });

    const repositoryIdentity =
        buildRepositoryIdentity(filtered);

    const scored = filtered.map((item) => ({
        ...item,
        confidence: calculateConfidenceScore(
            item.totalScore,
            EvidenceThresholds[item.repositoryType] ?? 50
        ),
    }));

    return {
        repositoryIdentity,
        rankedEvidence: scored,
    };
};