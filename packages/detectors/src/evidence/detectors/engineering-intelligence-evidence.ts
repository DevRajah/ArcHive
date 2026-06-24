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

    const hasEngineeringIntelligenceSignal = includesAny(combinedText, [
        "repository intelligence",
        "repository-intelligence",
        "repository_intelligence",

        "engineering intelligence",
        "engineering-intelligence",
        "engineering_intelligence",

        "architecture intelligence",
        "architecture-intelligence",
        "architecture_intelligence",

        "repository fingerprint",
        "repository-fingerprint",
        "repository_fingerprint",

        "technology fingerprint",
        "technology-fingerprint",
        "technology_fingerprint",

        "architecture evolution",
        "architecture-evolution",
        "architecture_evolution",

        "architecture drift",
        "architecture-drift",
        "architecture_drift",

        "repository health",
        "repository-health",
        "repository_health",

        "engineering quality",
        "engineering-quality",
        "engineering_quality",

        "repository maturity",
        "repository-maturity",
        "repository_maturity",

        "technical debt",
        "technical-debt",
        "technical_debt",

        "repository persona",
        "repository-persona",
        "repository_persona",

        "repository dna",
        "repository-dna",
        "repository_dna",

        "codebase intelligence",
        "codebase-intelligence",
        "codebase_intelligence",

        "intelligence-report",
        "intelligence report",
    ]);

    const hasGithubAnalysisSignal = includesAny(combinedText, [
        "github webhook",
        "github-webhook",
        "github_webhook",

        "github oauth",
        "github-oauth",
        "github_oauth",

        "repository import",
        "repository-import",
        "repository_import",

        "tracked repository",
        "tracked-repository",
        "tracked_repository",

        "engineering event",
        "engineering-event",
        "engineering_event",

        "architecture change",
        "architecture-change",
        "architecture_change",

        "repository timeline",
        "repository-timeline",
        "repository_timeline",

        "commit analysis",
        "commit-analysis",
        "commit_analysis",

        "repository analysis",
        "repository-analysis",
        "repository_analysis",

        "engineering-event-classifier",
        "repository.routes",
    ]);

    if (hasEngineeringIntelligenceSignal) {
        addEvidence(
            "ENGINEERING_INTELLIGENCE_PLATFORM",
            "Detected repository intelligence concepts and engineering analysis patterns",
            hasGithubAnalysisSignal ? 95 : 75,
            "DOMAIN_LANGUAGE",
            hasGithubAnalysisSignal ? "STRONG" : "MEDIUM"
        );
    }
};