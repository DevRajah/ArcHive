import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDocumentationEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, filesChanged, addEvidence } = context;

    const documentationFiles = filesChanged.filter((file) => {
        const normalized = file.toLowerCase();

        return (
            normalized.endsWith(".md") ||
            normalized.includes("docs/") ||
            normalized.includes("documentation/")
        );
    });

    if (
        documentationFiles.length >= 5 ||
        includesAny(combinedText, [
            "documentation",
            "docs",
            "readme",
            "guide",
            "tutorial",
        ])
    ) {
        addEvidence(
            "DOCUMENTATION_HEAVY_REPOSITORY",
            "Detected documentation-heavy repository",
            35,
            "FILE_STRUCTURE",
            "MEDIUM"
        );
    }
};