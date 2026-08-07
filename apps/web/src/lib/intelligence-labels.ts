const intelligenceLabelMap: Record<
  string,
  string
> = {
  /*
   * Canonical repository purposes
   */
  ENGINEERING_INTELLIGENCE_PLATFORM:
    "Engineering Intelligence Platform",

  FINTECH_PLATFORM:
    "Fintech Platform",

  DEVTOOL_PLATFORM:
    "Developer Tool Platform",

  OBSERVABILITY_PLATFORM:
    "Observability Platform",

  SECURITY_PLATFORM:
    "Security Platform",

  AI_ML_PROJECT:
    "AI / ML Project",

  DEVELOPER_PLATFORM:
    "Developer Platform",

  DATA_ENGINEERING_PROJECT:
    "Data Engineering Project",

  SMART_TRANSPORT_PLATFORM:
    "Smart Transport Platform",

  ENERGY_PLATFORM:
    "Energy Platform",

  HEALTHCARE_PLATFORM:
    "Healthcare Platform",

  ECOMMERCE_PLATFORM:
    "E-commerce Platform",

  EDUCATION_PLATFORM:
    "Education Platform",

  COLLABORATION_PLATFORM:
    "Collaboration Platform",

  INFRASTRUCTURE_PLATFORM:
    "Infrastructure Platform",

  MOBILE_APPLICATION:
    "Mobile Application",

  BACKEND_SERVICE:
    "Backend Service",

  FRONTEND_APPLICATION:
    "Frontend Application",

  PACKAGE_LIBRARY:
    "Package / Library",

  MESSAGING_PLATFORM:
    "Messaging Platform",

  DOCUMENTATION_HEAVY_REPOSITORY:
    "Documentation-Heavy Repository",

  JAVASCRIPT_TYPESCRIPT_PROJECT:
    "JavaScript / TypeScript Project",

  GENERAL_ENGINEERING_PROJECT:
    "General Software Repository",

  /*
   * Architecture and engineering intelligence labels
   */
  QUEUE_INFRASTRUCTURE:
    "Queue Infrastructure",

  BACKEND_SYSTEMS:
    "Backend Systems",

  BACKEND_SYSTEM:
    "Backend System",

  DATABASE_LAYER:
    "Database Layer",

  REALTIME_SYSTEMS:
    "Realtime Systems",

  REALTIME_INFRASTRUCTURE:
    "Realtime Infrastructure",

  AUTHENTICATION:
    "Authentication",

  API_LAYER:
    "API Layer",

  ARCHITECTURE_INTELLIGENCE:
    "Architecture Intelligence",

  REPOSITORY_INTELLIGENCE:
    "Repository Intelligence",

  PRODUCT_SAAS:
    "Product SaaS",
};

export function formatIntelligenceLabel(
  value?: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(formatIntelligenceLabel)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const record =
      value as Record<string, unknown>;

    return formatIntelligenceLabel(
      record.label ||
        record.title ||
        record.name ||
        record.type ||
        record.category ||
        record.domain ||
        record.capability ||
        record.value ||
        JSON.stringify(value),
    );
  }

  const raw =
    String(value).trim();

  if (!raw) {
    return "";
  }

  if (intelligenceLabelMap[raw]) {
    return intelligenceLabelMap[raw];
  }

  /*
   * Future backend intelligence values should still render cleanly
   * even before a dedicated frontend label is added.
   *
   * This is formatting only. It never reclassifies repository purpose.
   */
  return raw
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => {
      if (word === "api") {
        return "API";
      }

      if (word === "ui") {
        return "UI";
      }

      if (word === "ux") {
        return "UX";
      }

      if (word === "ai") {
        return "AI";
      }

      if (word === "ml") {
        return "ML";
      }

      if (word === "oauth") {
        return "OAuth";
      }

      if (word === "saas") {
        return "SaaS";
      }

      if (word === "javascript") {
        return "JavaScript";
      }

      if (word === "typescript") {
        return "TypeScript";
      }

      if (word === "devtool") {
        return "Developer Tool";
      }

      if (word === "fintech") {
        return "Fintech";
      }

      if (word === "ecommerce") {
        return "E-commerce";
      }

      if (word === "realtime") {
        return "Realtime";
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

export function formatIntelligenceLabels(
  values?: unknown[],
): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .flatMap((value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) =>
            formatIntelligenceLabel(item),
          )
          .filter(Boolean);
      }

      return [
        formatIntelligenceLabel(value),
      ].filter(Boolean);
    })
    .filter(Boolean);
}