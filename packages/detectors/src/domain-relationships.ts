export const buildDomainRelationships = (
  domains: string[]
) => {
  const relationships = [];

  if (
    domains.includes("QUEUE_INFRASTRUCTURE") &&
    domains.includes("REALTIME_SYSTEMS")
  ) {
    relationships.push({
      source: "QUEUE_INFRASTRUCTURE",
      target: "REALTIME_SYSTEMS",
      relationship:
        "supports asynchronous realtime event propagation",
    });
  }

  if (
    domains.includes("API_LAYER") &&
    domains.includes("DATABASE_LAYER")
  ) {
    relationships.push({
      source: "API_LAYER",
      target: "DATABASE_LAYER",
      relationship:
        "coordinates persistent application workflows",
    });
  }

  if (
    domains.includes("ARCHITECTURE_INTELLIGENCE")
  ) {
    relationships.push({
      source:
        "ARCHITECTURE_INTELLIGENCE",
      target:
        "ENGINEERING_REASONING",
      relationship:
        "supports semantic engineering analysis",
    });
  }

  return relationships;
};