import { MaturityAssessment, MaturityLevel } from "./maturity-types";

export const includesAny = (items: string[], values: string[]) => {
  return values.some((value) => items.includes(value));
};

export const textIncludesAny = (items: string[], values: string[]) => {
  const text = items.join(" ").toLowerCase();

  return values.some((value) => text.includes(value.toLowerCase()));
};

export const getMaturityLevel = (score: number): MaturityLevel => {
  if (score >= 85) return "ADVANCED";
  if (score >= 70) return "MATURE";
  if (score >= 45) return "DEVELOPING";
  return "BASIC";
};

export const clampScore = (score: number) => {
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const buildAssessment = ({
  area,
  score,
  strengths,
  weaknesses,
  recommendations,
}: Omit<MaturityAssessment, "level">): MaturityAssessment => {
  const finalScore = clampScore(score);

  return {
    area,
    score: finalScore,
    level: getMaturityLevel(finalScore),
    strengths,
    weaknesses,
    recommendations,
  };
};