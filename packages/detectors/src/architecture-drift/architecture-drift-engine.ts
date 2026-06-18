import { ArchitectureDriftItem, ArchitectureDriftReport } from "./types";

const getSeverity = (score: number): ArchitectureDriftReport["severity"] => {
  if (score >= 70) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
};

const getSummary = (severity: ArchitectureDriftReport["severity"]) => {
  switch (severity) {
    case "HIGH":
      return "Repository shows strong architecture drift signals that may need review.";
    case "MEDIUM":
      return "Repository shows some architecture drift signals worth monitoring.";
    case "LOW":
      return "Repository shows limited architecture drift based on detected evidence.";
  }
};

export const buildArchitectureDriftReport = ({
  architectureDomains,
  repositoryTypes,
  technologies,
  reasoningSignals,
}: {
  architectureDomains: string[];
  repositoryTypes: string[];
  technologies: string[];
  reasoningSignals: string[];
}): ArchitectureDriftReport => {
  const items: ArchitectureDriftItem[] = [];

  if (repositoryTypes.length >= 5) {
    items.push({
      severity: "MEDIUM",
      title: "Repository has many competing identities",
      description:
        "The repository has several detected repository types, which may indicate broad scope or drifting responsibilities.",
      evidence: repositoryTypes,
    });
  }

  if (architectureDomains.length >= 9) {
    items.push({
      severity: "MEDIUM",
      title: "Repository spans many architecture domains",
      description:
        "A high number of architecture domains may indicate growing complexity or unclear boundaries.",
      evidence: architectureDomains,
    });
  }

  if (
    repositoryTypes.includes("FRONTEND_APPLICATION") &&
    repositoryTypes.includes("BACKEND_SERVICE") &&
    repositoryTypes.includes("INFRASTRUCTURE_PLATFORM")
  ) {
    items.push({
      severity: "HIGH",
      title: "Application and infrastructure concerns are mixed",
      description:
        "Frontend, backend, and infrastructure identities are all strongly present, which may indicate mixed responsibilities in one repository.",
      evidence: [
        "FRONTEND_APPLICATION",
        "BACKEND_SERVICE",
        "INFRASTRUCTURE_PLATFORM",
      ],
    });
  }

  if (
    technologies.includes("Microservices") &&
    !technologies.includes("Docker") &&
    !technologies.includes("Kubernetes")
  ) {
    items.push({
      severity: "MEDIUM",
      title: "Microservices detected without deployment orchestration",
      description:
        "Microservice architecture signals were detected, but containerization or orchestration signals are weak.",
      evidence: ["Microservices"],
    });
  }

  if (
    reasoningSignals.some((signal) =>
      signal.toLowerCase().includes("removed")
    )
  ) {
    items.push({
      severity: "LOW",
      title: "Removal signals detected",
      description:
        "Some architecture changes include removal signals. This can be healthy refactoring, but repeated removals may indicate instability.",
      evidence: reasoningSignals.filter((signal) =>
        signal.toLowerCase().includes("removed")
      ),
    });
  }

  const driftScore = Math.min(
    100,
    items.reduce((sum, item) => {
      if (item.severity === "HIGH") return sum + 35;
      if (item.severity === "MEDIUM") return sum + 20;
      return sum + 10;
    }, 0)
  );

  const severity = getSeverity(driftScore);

  return {
    driftScore,
    severity,
    summary: getSummary(severity),
    items,
  };
};