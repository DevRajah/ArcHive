import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessDevOpsMaturity = (input: MaturityInput) => {
  let score = 15;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (includesAny(input.technologies, ["Docker", "Docker Compose"])) {
    score += 25;
    strengths.push("Containerization evidence was detected.");
  } else {
    recommendations.push("Add Docker support for consistent local and deployment environments.");
  }

  if (includesAny(input.technologies, ["GitHub Actions", "GitLab CI", "Azure Pipelines"])) {
    score += 30;
    strengths.push("CI/CD automation evidence was detected.");
  } else {
    weaknesses.push("CI/CD evidence is weak or missing.");
    recommendations.push("Add CI/CD pipelines for tests, builds, and deployment checks.");
  }

  if (includesAny(input.technologies, ["Terraform", "Kubernetes", "Helm"])) {
    score += 30;
    strengths.push("Infrastructure automation or orchestration evidence was detected.");
  }

  return buildAssessment({
    area: "DEVOPS",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};