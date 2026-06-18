export type RepositoryMaturityLevel =
  | "PROTOTYPE"
  | "GROWING"
  | "PRODUCTION_READY"
  | "ENTERPRISE_READY";

export type RepositoryMaturity = {
  score: number;
  level: RepositoryMaturityLevel;
  summary: string;
  reasons: string[];
};