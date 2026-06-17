import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDesignSystemEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "storybook",
            "design system",
            "component library",
            "ui kit",
            "tokens",
            "figma",
            "theme provider",
        ])
    ) {
        addEvidence(
            "DESIGN_SYSTEM",
            "Detected reusable design system",
            40,
            "ARCHITECTURE_PATTERN",
            "STRONG"
        );
    }
};