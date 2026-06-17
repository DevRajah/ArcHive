import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectInfrastructureEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "terraform",
            "kubernetes",
            "helm",
            "docker compose",
            "ansible",
            "iac",
            "infrastructure as code",
        ])
    ) {
        addEvidence(
            "INFRASTRUCTURE_PLATFORM",
            "Detected infrastructure automation platform",
            45,
            "ARCHITECTURE_PATTERN",
            "STRONG"
        );
    }
};