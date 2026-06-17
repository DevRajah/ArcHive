import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectHealthcareEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "patient",
            "doctor",
            "hospital",
            "clinic",
            "ehr",
            "emr",
            "medical",
            "diagnosis"
        ])
    ) {
        addEvidence(
            "HEALTHCARE_PLATFORM",
            "Detected hospital platform terminology",
            35,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }
};