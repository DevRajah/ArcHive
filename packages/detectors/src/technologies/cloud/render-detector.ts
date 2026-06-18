import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRenderTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "render",
      "render.yaml",
      "render.com",
      "render deploy",
    ])
  ) {
    context.addTechnology(
      "Render",
      "Detected Render deployment configuration.",
      15,
      "MEDIUM"
    );
  }
};