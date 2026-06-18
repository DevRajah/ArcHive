import { QualityDetector } from "../quality-registry";

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

const hasCapability = (context: Parameters<QualityDetector>[0], key: string) =>
  context.capabilities.some((capability) => capability.key === key);

export const detectTestingQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (hasCapability(context, "TESTING")) {
    addQuality(
      "TESTING",
      30,
      "Testing capability was detected from test frameworks or test files."
    );
  }

  if (hasTechnology(context, ["Jest", "Vitest", "Supertest"])) {
    addQuality(
      "TESTING",
      30,
      "Repository includes unit or API integration testing tools."
    );
  }

  if (hasTechnology(context, ["Playwright", "Cypress"])) {
    addQuality(
      "TESTING",
      30,
      "Repository includes end-to-end or browser testing tools."
    );
  }

  if (
    hasTechnology(context, ["GitHub Actions"]) &&
    hasTechnology(context, ["Jest", "Vitest", "Playwright", "Cypress"])
  ) {
    addQuality(
      "TESTING",
      10,
      "Testing appears connected to CI/CD automation."
    );
  }
};