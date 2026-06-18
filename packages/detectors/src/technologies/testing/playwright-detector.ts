import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectPlaywrightTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "playwright",
      "playwright.config",
      "@playwright/test",
      "page.goto",
      "page.locator",
    ])
  ) {
    context.addTechnology(
      "Playwright",
      "Detected Playwright browser testing.",
      20,
      "STRONG"
    );
  }
};