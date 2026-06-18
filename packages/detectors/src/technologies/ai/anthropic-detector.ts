import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectAnthropicTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "anthropic",
      "claude",
      "@anthropic-ai/sdk",
    ])
  ) {
    context.addTechnology(
      "Anthropic",
      "Detected Anthropic Claude API integration.",
      25,
      "STRONG"
    );
  }
};