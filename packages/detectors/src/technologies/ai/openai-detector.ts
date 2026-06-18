import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectOpenAiTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "openai",
      "gpt-4",
      "gpt-5",
      "chat completions",
      "responses api",
      "openai sdk",
    ])
  ) {
    context.addTechnology(
      "OpenAI",
      "Detected OpenAI API integration.",
      25,
      "STRONG"
    );
  }
};