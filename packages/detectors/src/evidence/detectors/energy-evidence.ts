import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectEnergyEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "smart meter",
            "energy",
            "electricity",
            "grid",
            "consumption",
            "renewable",
            "power",
        ])
    ) {
        addEvidence(
            "ENERGY_PLATFORM",
            "Detected energy platform terminology",
            35,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }
};