export const mapArchitectureDomain = (
  changeType: string
): string => {
  if (
    changeType.includes("REALTIME") ||
    changeType.includes("SOCKET")
  ) {
    return "REALTIME_SYSTEMS";
  }

  if (changeType.includes("QUEUE")) {
    return "QUEUE_INFRASTRUCTURE";
  }

  if (
    changeType.includes("API") ||
    changeType.includes("AUTH")
  ) {
    return "API_LAYER";
  }

  if (changeType.includes("FRONTEND")) {
    return "FRONTEND_ARCHITECTURE";
  }

  if (changeType.includes("STATE")) {
    return "STATE_MANAGEMENT";
  }

  if (
    changeType.includes("DATABASE") ||
    changeType.includes("PRISMA")
  ) {
    return "DATABASE_LAYER";
  }

  return "GENERAL_ARCHITECTURE";
};