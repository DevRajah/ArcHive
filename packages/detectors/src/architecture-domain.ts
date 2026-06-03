export const mapArchitectureDomain = ({
  changeType,
  fallbackDomains,
}: {
  changeType: string;
  fallbackDomains?: string[];
}) => {
  const type = changeType.toUpperCase();

  if (type.includes("REALTIME") || type.includes("SOCKET")) {
    return "REALTIME_SYSTEMS";
  }

  if (type.includes("QUEUE") || type.includes("WORKER")) {
    return "QUEUE_INFRASTRUCTURE";
  }

  if (type.includes("AUTH")) {
    return "AUTHENTICATION";
  }

  if (type.includes("API")) {
    return "API_LAYER";
  }

  if (type.includes("FRONTEND")) {
    return "FRONTEND_ARCHITECTURE";
  }

  if (type.includes("STATE")) {
    return "STATE_MANAGEMENT";
  }

  if (type.includes("DATABASE") || type.includes("PRISMA")) {
    return "DATABASE_LAYER";
  }

  if (type.includes("DOCKER") || type.includes("DEVOPS")) {
    return "DEVOPS_INFRASTRUCTURE";
  }

  if (type.includes("DEPENDENCY")) {
    return "DEPENDENCY_MANAGEMENT";
  }

  if (type.includes("TYPE_CONTRACT")) {
    return "TYPE_CONTRACTS";
  }

  if (type.includes("ARCHITECTURE_INTELLIGENCE")) {
    return "ARCHITECTURE_INTELLIGENCE";
  }

  return fallbackDomains?.[0] || "GENERAL_ARCHITECTURE";
};