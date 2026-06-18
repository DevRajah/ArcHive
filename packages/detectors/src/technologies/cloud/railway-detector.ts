import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRailwayTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "railway",
      "railway.json",
      "railway.toml",
      "railway up",
    ])
  ) {
    context.addTechnology(
      "Railway",
      "Detected Railway deployment configuration.",
      15,
      "MEDIUM"
    );
  }
};