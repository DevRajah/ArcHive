import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectPackageSdkEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "npm package",
            "sdk",
            "client library",
            "typescript sdk",
            "javascript sdk",
            "publish package",
            "library",
        ])
    ) {
        addEvidence(
            "PACKAGE_LIBRARY",
            "Detected reusable SDK or package library",
            35,
            "DEPENDENCY",
            "STRONG"
        );
    }
};