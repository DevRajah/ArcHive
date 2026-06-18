export type EvolutionDirection =
  | "BECOMING_MORE_COMPLEX"
  | "BECOMING_MORE_MATURE"
  | "BECOMING_MORE_PRODUCT_ORIENTED"
  | "BECOMING_MORE_INFRASTRUCTURE_ORIENTED"
  | "STABLE"
  | "UNCLEAR";

export type EvolutionInsight = {
  title: string;
  description: string;
  evidence: string[];
};

export type EvolutionInsightsReport = {
  direction: EvolutionDirection;
  summary: string;
  complexityTrend: "INCREASING" | "STABLE" | "DECREASING";
  maturityTrend: "IMPROVING" | "STABLE" | "DECLINING";
  platformTrend:
    | "BACKEND"
    | "FULLSTACK"
    | "PLATFORM"
    | "INFRASTRUCTURE"
    | "UNKNOWN";
  confidence: number;
  timelineEvidence: string[];
  insights: EvolutionInsight[];
};