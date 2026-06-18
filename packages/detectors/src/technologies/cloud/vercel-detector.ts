import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectVercelTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "vercel",
      "vercel.json",
      "vercel deploy",
      "@vercel",
    ])
  ) {
    context.addTechnology(
      "Vercel",
      "Detected deployment configuration for Vercel.",
      15,
      "MEDIUM"
    );
  }
};