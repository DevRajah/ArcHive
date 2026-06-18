export type ArchitectureDriftSeverity = "LOW" | "MEDIUM" | "HIGH";

export type ArchitectureDriftItem = {
  severity: ArchitectureDriftSeverity;
  title: string;
  description: string;
  evidence: string[];
};

export type ArchitectureDriftReport = {
  driftScore: number;
  severity: ArchitectureDriftSeverity;
  summary: string;
  items: ArchitectureDriftItem[];
};