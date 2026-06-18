export type TechnicalDebtSeverity = "LOW" | "MEDIUM" | "HIGH";

export type TechnicalDebtItem = {
  severity: TechnicalDebtSeverity;
  area: string;
  title: string;
  description: string;
  recommendation: string;
};

export type TechnicalDebtReport = {
  debtScore: number;
  severity: TechnicalDebtSeverity;
  summary: string;
  items: TechnicalDebtItem[];
};