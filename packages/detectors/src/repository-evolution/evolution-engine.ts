import { ArchitectureDriftReport } from "../architecture-drift";
import { EngineeringQualityResult } from "../engineering-quality";
import { RepositoryDNA } from "../dna";
import { RepositoryHealth } from "../repository-health";
import { RepositoryMaturity } from "../maturity";
import {
  EvolutionDirection,
  EvolutionInsightsReport,
} from "./types";

const INFRASTRUCTURE_TECHNOLOGIES = [
  "BullMQ",
  "Kafka",
  "RabbitMQ",
  "Redis",
  "Docker",
  "Kubernetes",
];

export const analyzeRepositoryEvolution = ({
  architectureDomains,
  repositoryTypes,
  technologies,
  reasoningSignals,
  repositoryDNA,
  engineeringQuality,
  repositoryMaturity,
  repositoryHealth,
  architectureDrift,
}: {
  architectureDomains: string[];
  repositoryTypes: string[];
  technologies: string[];
  reasoningSignals: string[];
  repositoryDNA: RepositoryDNA;
  engineeringQuality: EngineeringQualityResult;
  repositoryMaturity: RepositoryMaturity;
  repositoryHealth: RepositoryHealth;
  architectureDrift: ArchitectureDriftReport;
}): EvolutionInsightsReport => {
  const insights: EvolutionInsightsReport["insights"] = [];

  const infrastructureEvidence = technologies.filter((technology) =>
    INFRASTRUCTURE_TECHNOLOGIES.includes(technology)
  );

  if (architectureDomains.length >= 7) {
    insights.push({
      title: "Repository responsibilities are expanding",
      description:
        "Multiple engineering domains have emerged, indicating the repository is evolving into a broader platform rather than a narrowly focused service.",
      evidence: architectureDomains,
    });
  }

  if (repositoryTypes.length >= 3) {
    insights.push({
      title: "Repository is accumulating multiple engineering responsibilities",
      description:
        "Several repository identities were detected, which suggests the project is growing across more than one responsibility or product direction.",
      evidence: repositoryTypes,
    });
  }

  if (infrastructureEvidence.length > 0) {
    insights.push({
      title: "Infrastructure capabilities are growing",
      description:
        "Infrastructure-oriented technologies were detected, suggesting the repository is moving toward more production-aware engineering.",
      evidence: infrastructureEvidence,
    });
  }

  if (engineeringQuality.overallScore >= 75 && repositoryMaturity.score >= 70) {
    insights.push({
      title: "Engineering maturity is improving",
      description:
        "The repository has strong engineering quality and maturity scores, suggesting it is becoming more production-oriented.",
      evidence: [
        `Engineering quality: ${engineeringQuality.overallScore}`,
        `Maturity score: ${repositoryMaturity.score}`,
      ],
    });
  }

  if (architectureDrift.severity === "HIGH") {
    insights.push({
      title: "Architecture drift requires attention",
      description:
        "The repository shows drift signals, meaning responsibilities may be expanding or becoming less clearly separated.",
      evidence: architectureDrift.items.map((item) => item.title),
    });
  }

  if (repositoryHealth.status === "HEALTHY") {
    insights.push({
      title: "Repository health is strong",
      description:
        "The repository appears to be evolving with a healthy engineering foundation.",
      evidence: [`Health score: ${repositoryHealth.score}`],
    });
  }

  let direction: EvolutionDirection = "STABLE";

  if (architectureDrift.severity === "HIGH") {
    direction = "BECOMING_MORE_COMPLEX";
  }

  if (repositoryMaturity.score >= 80) {
    direction = "BECOMING_MORE_MATURE";
  }

  if (repositoryTypes.includes("INFRASTRUCTURE_PLATFORM")) {
    direction = "BECOMING_MORE_INFRASTRUCTURE_ORIENTED";
  }

  if (repositoryDNA.engineeringProfile !== "GENERAL_ENGINEERING_PROJECT") {
    direction = "BECOMING_MORE_PRODUCT_ORIENTED";
  }

  if (!insights.length) {
    direction = "UNCLEAR";
  }

  const complexityTrend =
    architectureDrift.severity === "HIGH" || architectureDomains.length >= 7
      ? "INCREASING"
      : "STABLE";

  const maturityTrend =
    repositoryMaturity.score >= 70 || engineeringQuality.overallScore >= 75
      ? "IMPROVING"
      : "STABLE";

  const platformTrend = repositoryTypes.includes("INFRASTRUCTURE_PLATFORM")
    ? "INFRASTRUCTURE"
    : repositoryTypes.includes("FRONTEND_APPLICATION") &&
        repositoryTypes.includes("BACKEND_SERVICE")
      ? "FULLSTACK"
      : repositoryTypes.includes("BACKEND_SERVICE")
        ? "BACKEND"
        : repositoryDNA.engineeringProfile !== "GENERAL_ENGINEERING_PROJECT"
          ? "PLATFORM"
          : "UNKNOWN";

  const confidence = Math.min(
    100,
    insights.length * 15 +
      architectureDomains.length * 3 +
      repositoryTypes.length * 5
  );

  const timelineEvidence = [
    ...reasoningSignals.slice(0, 8),
    ...architectureDrift.items.map((item) => item.title),
  ];

  const summary =
    direction === "BECOMING_MORE_COMPLEX"
      ? "Repository evolution suggests growing architectural complexity that should be monitored."
      : direction === "BECOMING_MORE_MATURE"
        ? "Repository evolution suggests increasing engineering maturity and production readiness."
        : direction === "BECOMING_MORE_INFRASTRUCTURE_ORIENTED"
          ? "Repository evolution suggests stronger infrastructure and platform engineering direction."
          : direction === "BECOMING_MORE_PRODUCT_ORIENTED"
            ? "Repository evolution suggests a clearer product or platform identity."
            : direction === "STABLE"
              ? "Repository evolution appears relatively stable based on current intelligence signals."
              : "Not enough evidence exists yet to infer a clear evolution direction.";

  return {
    direction,
    summary,
    complexityTrend,
    maturityTrend,
    platformTrend,
    confidence,
    timelineEvidence,
    insights,
  };
};