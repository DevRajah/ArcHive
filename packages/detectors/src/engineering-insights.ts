export const generateEngineeringInsights = ({
  capabilities,
  domains,
}: {
  capabilities: Record<string, boolean>;
  domains: string[];
}) => {
  const insights: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  if (capabilities.realtimeSystems && !capabilities.cachingLayer) {
    risks.push(
      "Realtime systems were detected, but caching infrastructure is not strongly visible yet."
    );
    recommendations.push(
      "Consider adding or documenting caching/session infrastructure if realtime traffic grows."
    );
  }

  if (capabilities.queueInfrastructure && !domains.includes("OBSERVABILITY_SYSTEMS")) {
    recommendations.push(
      "Queue infrastructure was detected; adding observability signals would improve operational visibility."
    );
  }

  if (capabilities.apiLayer && !capabilities.authentication) {
    risks.push(
      "API infrastructure is present, but authentication signals are weak or missing."
    );
  }

  if (domains.includes("ARCHITECTURE_INTELLIGENCE")) {
    insights.push(
      "The repository contains signals of engineering intelligence and architecture reasoning."
    );
  }

  return {
    insights,
    risks,
    recommendations,
  };
};