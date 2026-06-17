import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectCollaborationEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "chat",
            "workspace",
            "channel",
            "message",
            "team",
            "presence",
            "collaboration",
            "shared document",
            
        ])
    ) {
        addEvidence(
            "COLLABORATION_PLATFORM",
            "Detected Collaboration platform terminology",
            35,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }
};