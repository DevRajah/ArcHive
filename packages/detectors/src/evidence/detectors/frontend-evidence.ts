import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectFrontendEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "react",
            "next.js",
            "nextjs",
            "vue",
            "nuxt",
            "angular",
            "tailwind",
            "shadcn",
            "component",
            "use client",
        ])
    ) {
        addEvidence(
            "FRONTEND_APPLICATION",
            "Detected frontend framework and UI architecture",
            45,
            "DEPENDENCY",
            "STRONG"
        );
    }
};