export type RecommendationPriority = "LOW" | "MEDIUM" | "HIGH";

export type EngineeringRecommendation = {
  priority: RecommendationPriority;
  category: string;
  title: string;
  reason: string;
  action: string;
};

export type RecommendationReport = {
  recommendations: EngineeringRecommendation[];
};