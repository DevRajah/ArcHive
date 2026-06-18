import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectSupertestTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "supertest",
      "request(app)",
      ".expect(",
    ])
  ) {
    context.addTechnology(
      "Supertest",
      "Detected API integration testing with Supertest.",
      20,
      "STRONG"
    );
  }
};