import { EvidenceResult } from "../evidence-types";

export type RepositoryIdentity = {
    primary: EvidenceResult | null;

    secondary: EvidenceResult[];

    rejected: EvidenceResult[];
};

export const buildRepositoryIdentity = (
    evidence: EvidenceResult[]
): RepositoryIdentity => {
    if (evidence.length === 0) {
        return {
            primary: null,
            secondary: [],
            rejected: [],
        };
    }

    return {
        primary: evidence[0],
        secondary: evidence.slice(1, 3),
        rejected: evidence.slice(3),
    };
};