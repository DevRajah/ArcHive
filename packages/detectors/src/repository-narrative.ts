type GenerateRepositoryNarrativeInput = {
  repositoryName: string;
  repositoryTypes: string[];
  technologies: string[];
  domains: string[];
  capabilities: Record<string, boolean>;
  architectureStyles: string[];
};

export const generateRepositoryNarrative = ({
  repositoryName,
  repositoryTypes,
  technologies,
  domains,
  capabilities,
  architectureStyles,
}: GenerateRepositoryNarrativeInput) => {
  const strengths: string[] = [];
  const dominantPatterns: string[] = [];
  const detectedSpecializations: string[] = [];

  /**
   * =========================================
   * CAPABILITY STRENGTHS
   * =========================================
   */

  if (capabilities.realtimeSystems) {
    strengths.push("Realtime infrastructure");
  }

  if (capabilities.queueInfrastructure) {
    strengths.push("Background job processing");
  }

  if (capabilities.architectureIntelligence) {
    strengths.push("Repository intelligence systems");
  }

  if (capabilities.apiLayer) {
    strengths.push("API platform engineering");
  }

  if (capabilities.frontendArchitecture) {
    strengths.push("Frontend architecture");
  }

  /**
   * =========================================
   * ARCHITECTURE PATTERNS
   * =========================================
   */

  if (architectureStyles.includes("REALTIME_PLATFORM")) {
    dominantPatterns.push("Realtime synchronization");
  }

  if (architectureStyles.includes("QUEUE_DRIVEN")) {
    dominantPatterns.push("Queue-driven processing");
  }

  if (architectureStyles.includes("EVENT_DRIVEN")) {
    dominantPatterns.push("Event-driven architecture");
  }

  if (architectureStyles.includes("ENGINEERING_INTELLIGENCE")) {
    dominantPatterns.push("Repository intelligence analysis");
  }

  /**
   * =========================================
   * SPECIALIZATIONS
   * =========================================
   */

  if (repositoryTypes.includes("AI_ML_PROJECT")) {
    detectedSpecializations.push("AI / Machine Learning");
  }

  if (repositoryTypes.includes("DATA_ENGINEERING_PROJECT")) {
    detectedSpecializations.push("Data engineering");
  }

  if (repositoryTypes.includes("MOBILE_APPLICATION")) {
    detectedSpecializations.push("Mobile systems");
  }

  if (repositoryTypes.includes("INFRASTRUCTURE_REPOSITORY")) {
    detectedSpecializations.push("Infrastructure engineering");
  }

  if (
    repositoryTypes.includes("JAVASCRIPT_TYPESCRIPT_PROJECT")
  ) {
    detectedSpecializations.push("TypeScript engineering");
  }

  /**
   * =========================================
   * HEADLINE
   * =========================================
   */

  let headline =
    `${repositoryName} is evolving into an engineering platform.`;

  if (
    architectureStyles.includes("ENGINEERING_INTELLIGENCE")
  ) {
    headline =
      `${repositoryName} is evolving into a realtime engineering intelligence platform.`;
  } else if (
    architectureStyles.includes("REALTIME_PLATFORM")
  ) {
    headline =
      `${repositoryName} is evolving into a realtime distributed platform.`;
  } else if (
    architectureStyles.includes("API_PLATFORM")
  ) {
    headline =
      `${repositoryName} is evolving into a backend service platform.`;
  }

  /**
   * =========================================
   * SUMMARY
   * =========================================
   */

  const summary =
    `${repositoryName} demonstrates architectural evolution across ` +
    `${domains.length} engineering domains with detected technologies including ` +
    `${technologies.slice(0, 5).join(", ")}.` +
    (strengths.length > 0
      ? ` Key strengths include ${strengths.join(", ")}.`
      : "");

  /**
   * =========================================
   * ENGINEERING PROFILE
   * =========================================
   */

  const engineeringProfile =
    `${repositoryName} currently exhibits ` +
    `${architectureStyles.join(", ").replaceAll("_", " ").toLowerCase()} ` +
    `engineering patterns with emphasis on ` +
    `${dominantPatterns.join(", ").toLowerCase() || "modern software architecture"}.`;

  return {
    headline,
    summary,
    strengths,
    engineeringProfile,
    dominantPatterns,
    detectedSpecializations,
  };
};