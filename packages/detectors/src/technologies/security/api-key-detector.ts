import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectApiKeyTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "api key",
      "apikey",
      "x-api-key",
      "api_key",
      "authorization header",
    ])
  ) {
    context.addTechnology(
      "API Key Authentication",
      "Detected API key authentication.",
      20,
      "STRONG"
    );
  }
};