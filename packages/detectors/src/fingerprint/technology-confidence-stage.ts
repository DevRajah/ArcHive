import type {
    EvidenceContext,
    TechnologyEvidence,
} from "../evidence";

const SOURCE_SCORE = {
    UNKNOWN: 5,
    README: 15,
    COMMIT_MESSAGE: 20,
    REPOSITORY_CONTEXT: 20,
    FILE_PATH: 45,
    CONFIGURATION: 80,
    DEPENDENCY: 90,
    IMPORT: 95,
    SOURCE_CODE: 100,
    PACKAGE_JSON: 90,
    LOCK_FILE: 85,
} as const;

export type TechnologyConfidenceResult = {
    technology: string;
    confidence: number;
    evidence: TechnologyEvidence[];
};

export const buildTechnologyConfidenceStage = (
    context: EvidenceContext,
): TechnologyConfidenceResult[] => {
    const grouped = new Map<
        string,
        TechnologyEvidence[]
    >();

    for (const evidence of context.technologyEvidence) {
        const existing =
            grouped.get(evidence.name) ??
            [];

        existing.push(evidence);

        grouped.set(
            evidence.name,
            existing,
        );
    }

    return Array.from(grouped.entries()).map(
        ([technology, evidence]) => {
            const confidence = Math.min(
                100,
                Math.max(
                    ...evidence.map(
                        (item) =>
                            SOURCE_SCORE[item.source],
                    ),
                ),
            );

            return {
                technology,
                confidence,
                evidence,
            };
        },
    );
};