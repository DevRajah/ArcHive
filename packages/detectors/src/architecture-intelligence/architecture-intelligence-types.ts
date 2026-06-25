export type ArchitectureRadarItem = {
  domain: string;
  label: string;
  score: number;
  strength: "LOW" | "MEDIUM" | "HIGH" | "DOMINANT";
  evidence: string[];
};

export type ArchitectureIntelligenceReport = {
  strongestDomain: ArchitectureRadarItem | null;
  radar: ArchitectureRadarItem[];
};