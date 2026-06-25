import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectEngineeringIntelligenceEvidence = (

    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    console.log("========== ENGINEERING INTELLIGENCE DETECTOR ==========");
    console.log("Detector is running.");

    console.log({
        repositoryIntelligence: context.combinedText.includes("repository-intelligence"),
        technologyFingerprint: context.combinedText.includes("technology-fingerprint"),
        githubOauth: context.combinedText.includes("github-oauth"),
        architectureChange: context.combinedText.includes("architecture-change"),
        intelligenceReport: context.combinedText.includes("intelligence-report"),
        engineeringIntelligence: context.combinedText.includes("engineering intelligence"),
    });

    console.log(
        "Combined text preview:",
        context.combinedText.substring(0, 800)
    );

    console.log("======================================================");

    const hasGeneratedRefreshNoise = includesAny(combinedText, [
        "repository_intelligence_reprocessed",
        "repository intelligence was regenerated",
        "intelligence was regenerated",
        "repository-intelligence.service.ts",
    ]);

    const hasStrongEngineeringIntelligenceSignal = includesAny(combinedText, [
        "engineering intelligence platform",
        "codebase intelligence",
        "architecture radar",
        "architecture narrative",
        "repository fingerprint",
        "technology fingerprint",
        "architecture drift",
        "repository health",
        "engineering quality",
        "repository maturity",
        "technical debt",
        "archive",
        "archiv e",
        "engineering event",
        "repository intelligence report",
        "repository purpose",
        "repository health intelligence",
        "canonical intelligence wrapper",
        "repository comparison intelligence",
        "repository benchmark",
        "repository evolution",
        "architecture drift analysis",
    ]);

    const hasRepositoryAnalysisSignal = includesAny(combinedText, [
        "github webhook",
        "github oauth",
        "repository import",
        "engineering event",
        "architecture change",
        "repository timeline",
        "commit analysis",
        "pull request analysis",
    ]);

    if (hasStrongEngineeringIntelligenceSignal && hasRepositoryAnalysisSignal) {
        addEvidence(
            "ENGINEERING_INTELLIGENCE_PLATFORM",
            "Detected engineering intelligence platform and repository analysis signals",
            95,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }

    const isArcHiveRepository = includesAny(combinedText, [
        "devrajah/archive",
        "archive intelligence",
        "repository intelligence report",
        "canonical intelligence wrapper",
        "repository purpose",
    ]);

    if (isArcHiveRepository && hasStrongEngineeringIntelligenceSignal) {
        addEvidence(
            "ENGINEERING_INTELLIGENCE_PLATFORM",
            "Detected ArcHive repository intelligence platform identity",
            95,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }

    if (
        hasStrongEngineeringIntelligenceSignal &&
        !hasRepositoryAnalysisSignal &&
        !hasGeneratedRefreshNoise
    ) {
        addEvidence(
            "ENGINEERING_INTELLIGENCE_PLATFORM",
            "Detected strong engineering intelligence domain language",
            70,
            "DOMAIN_LANGUAGE",
            "MEDIUM"
        );
    }
};