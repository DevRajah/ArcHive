import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectBackendServiceEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "express",
            "fastify",
            "nestjs",
            "hono",
            "koa",
            "router",
            "controller",
            "middleware",
            "service layer",
            "rest api",
            "graphql",
            "rpc",
        ])
    ) {
        addEvidence(
            "BACKEND_SERVICE",
            "Detected backend service architecture",
            40,
            "ARCHITECTURE_PATTERN",
            "STRONG"
        );
    }
};