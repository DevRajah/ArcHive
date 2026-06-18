import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessSecurityMaturity = (input: MaturityInput) => {
  let score = 20;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (
    includesAny(input.technologies, [
      "JWT",
      "OAuth",
      "Role-Based Access Control",
      "API Key Authentication",
    ])
  ) {
    score += 35;
    strengths.push("Authentication or authorization mechanisms were detected.");
  } else {
    weaknesses.push("Authentication and authorization evidence is weak.");
    recommendations.push("Add explicit authentication and authorization boundaries.");
  }

  if (includesAny(input.technologies, ["Encryption", "Rate Limiting"])) {
    score += 25;
    strengths.push("Security hardening signals such as encryption or rate limiting exist.");
  } else {
    recommendations.push("Consider rate limiting, hashing, encryption, and request protection.");
  }

  if (input.repositoryTypes.includes("SECURITY_PLATFORM")) {
    score += 20;
    strengths.push("Repository has security-focused platform evidence.");
  }

  return buildAssessment({
    area: "SECURITY",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};