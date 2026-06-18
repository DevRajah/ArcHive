import { MaturityInput } from "./maturity-types";
import { buildAssessment, includesAny } from "./maturity-utils";

export const assessTestingMaturity = (input: MaturityInput) => {
  let score = 15;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (includesAny(input.technologies, ["Jest", "Vitest", "Supertest"])) {
    score += 35;
    strengths.push("Unit or API integration testing tools were detected.");
  } else {
    weaknesses.push("Unit or API testing evidence is weak.");
    recommendations.push("Add unit and API integration tests.");
  }

  if (includesAny(input.technologies, ["Playwright", "Cypress"])) {
    score += 30;
    strengths.push("End-to-end or browser testing tools were detected.");
  } else {
    recommendations.push("Consider adding end-to-end testing for critical flows.");
  }

  if (includesAny(input.technologies, ["GitHub Actions"])) {
    score += 20;
    strengths.push("CI/CD integration can support automated testing.");
  }

  return buildAssessment({
    area: "TESTING",
    score,
    strengths,
    weaknesses,
    recommendations,
  });
};