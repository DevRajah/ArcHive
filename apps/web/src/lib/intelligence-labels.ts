const intelligenceLabelMap: Record<string, string> = {
  ENGINEERING_INTELLIGENCE_PLATFORM: "Engineering Intelligence Platform",
  JAVASCRIPT_TYPESCRIPT_PROJECT: "JavaScript / TypeScript Project",
  FRONTEND_APPLICATION: "Frontend Application",
  DEVTOOL_PLATFORM: "Developer Tooling Platform",
  FINTECH_PLATFORM: "FinTech Platform",
  QUEUE_INFRASTRUCTURE: "Queue Infrastructure",
  BACKEND_SYSTEMS: "Backend Systems",
  BACKEND_SYSTEM: "Backend System",
  DATABASE_LAYER: "Database Layer",
  REALTIME_SYSTEMS: "Realtime Systems",
  REALTIME_INFRASTRUCTURE: "Realtime Infrastructure",
  AUTHENTICATION: "Authentication",
  API_LAYER: "API Layer",
  ARCHITECTURE_INTELLIGENCE: "Architecture Intelligence",
  REPOSITORY_INTELLIGENCE: "Repository Intelligence",
  GENERAL_ENGINEERING_PROJECT: "General Software Repository",
  PRODUCT_SAAS: "Product SaaS",
};

export function formatIntelligenceLabel(value?: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatIntelligenceLabel).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return formatIntelligenceLabel(
      record.label ||
        record.title ||
        record.name ||
        record.type ||
        record.category ||
        record.domain ||
        record.capability ||
        record.value ||
        JSON.stringify(value)
    );
  }

  const raw = String(value).trim();

  if (!raw) return "";

  if (intelligenceLabelMap[raw]) {
    return intelligenceLabelMap[raw];
  }

  return raw
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => {
      if (word === "api") return "API";
      if (word === "ui") return "UI";
      if (word === "ux") return "UX";
      if (word === "ai") return "AI";
      if (word === "ml") return "ML";
      if (word === "oauth") return "OAuth";
      if (word === "saas") return "SaaS";
      if (word === "javascript") return "JavaScript";
      if (word === "typescript") return "TypeScript";
      if (word === "devtool") return "Developer Tooling";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function formatIntelligenceLabels(values?: unknown[]): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .flatMap((value) => {
      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => formatIntelligenceLabel(item))
          .filter(Boolean);
      }

      return [formatIntelligenceLabel(value)].filter(Boolean);
    })
    .filter(Boolean);
}