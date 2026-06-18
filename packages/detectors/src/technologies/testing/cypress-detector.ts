import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectCypressTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "cypress",
      "cypress.config",
      "cy.",
      "cy.visit",
      "cy.get",
    ])
  ) {
    context.addTechnology(
      "Cypress",
      "Detected Cypress end-to-end testing.",
      20,
      "STRONG"
    );
  }
};