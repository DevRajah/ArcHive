import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectOllamaTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "ollama",
      "llama3",
      "mistral",
      "deepseek",
      "ollama run",
    ])
  ) {
    context.addTechnology(
      "Ollama",
      "Detected Ollama local LLM infrastructure.",
      25,
      "STRONG"
    );
  }
};