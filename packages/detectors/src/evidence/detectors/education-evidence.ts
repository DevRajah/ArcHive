import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectEducationEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "student",
            "teacher",
            "course",
            "lesson",
            "exam",
            "quiz",
            "grading",
            "learning"
        ])
    ) {
        addEvidence(
            "EDUCATION_PLATFORM",
            "Detected education platform terminology",
            35,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }
};