export type RepositoryWeakness = {
  category: string;
  title: string;
  description: string;
  evidence: string[];
  severity: "LOW" | "MEDIUM" | "HIGH";
};

export type WeaknessReport = {
  weaknesses: RepositoryWeakness[];
};