type GenerateEvolutionSummaryInput = {
  changeType: string;
  architectureDomain: string;
  detectedTechnology?: string | null;
  fileAffected?: string | null;
};

export const generateEvolutionSummary = ({
  changeType,
  architectureDomain,
  detectedTechnology,
  fileAffected,
}: GenerateEvolutionSummaryInput) => {
  const file = fileAffected?.split("/").pop();

  /**
   * =========================================
   * REALTIME
   * =========================================
   */

  if (architectureDomain === "REALTIME_SYSTEMS") {
    return `Realtime infrastructure evolved through updates to ${
      file || "live synchronization systems"
    }.`;
  }

  /**
   * =========================================
   * QUEUES
   * =========================================
   */

  if (architectureDomain === "QUEUE_INFRASTRUCTURE") {
    return `Queue and worker infrastructure evolved through changes to ${
      file || "background processing systems"
    }.`;
  }

  /**
   * =========================================
   * FRONTEND
   * =========================================
   */

  if (architectureDomain === "FRONTEND_ARCHITECTURE") {
    return `Frontend architecture evolved through UI and client-side updates affecting ${
      file || "repository interfaces"
    }.`;
  }

  /**
   * =========================================
   * API
   * =========================================
   */

  if (architectureDomain === "API_LAYER") {
    return `API and backend service architecture evolved through updates to ${
      file || "service routing logic"
    }.`;
  }

  /**
   * =========================================
   * ARCHITECTURE INTELLIGENCE
   * =========================================
   */

  if (architectureDomain === "ARCHITECTURE_INTELLIGENCE") {
    return `Repository intelligence and engineering classification systems evolved through updates to ${
      file || "architecture analysis logic"
    }.`;
  }

  /**
   * =========================================
   * DATABASE
   * =========================================
   */

  if (architectureDomain === "DATABASE_LAYER") {
    return `Database and persistence architecture evolved through schema or migration updates affecting ${
      file || "storage infrastructure"
    }.`;
  }

  return `This change contributed to the repository's ${architectureDomain
    .replaceAll("_", " ")
    .toLowerCase()} evolution.`;
};