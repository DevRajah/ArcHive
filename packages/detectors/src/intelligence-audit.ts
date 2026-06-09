export const auditRepositoryIntelligence = ({
  repositoryTypes,
  domains,
  technologies,
  reasoningSignals,
}: {
  repositoryTypes: string[];
  domains: string[];
  technologies: string[];
  reasoningSignals: string[];
}) => {
  const warnings: string[] = [];
  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (repositoryTypes.length === 0) {
    warnings.push("No repository type has been confidently detected yet.");
    improvementAreas.push("Add repository metadata, README details, or process webhook events to improve classification.");
  }

  if (domains.length === 0) {
    warnings.push("No architecture domains have been detected yet.");
    improvementAreas.push("Process code changes or run metadata intelligence backfill.");
  }

  if (reasoningSignals.length === 0) {
    warnings.push("No reasoning signals are available to explain the classification.");
    improvementAreas.push("Persist reasoning signals from fingerprint detection for better explainability.");
  }

  if (repositoryTypes.length > 0 && reasoningSignals.length > 0) {
    strengths.push("Repository classification is explainable using stored reasoning signals.");
  }

  if (domains.length >= 3) {
    strengths.push("Repository has multiple detected engineering domains.");
  }

  if (technologies.length >= 3) {
    strengths.push("Repository has several detected technology signals.");
  }

  const auditStatus =
    warnings.length === 0 ? "HEALTHY" : warnings.length <= 2 ? "PARTIAL" : "WEAK";

  return {
    auditStatus,
    strengths,
    warnings,
    improvementAreas,
  };
};