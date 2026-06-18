import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectHexagonalTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "hexagonal architecture",
      "ports and adapters",
      "port adapter",
      "adapter layer",
      "application port",
      "inbound adapter",
      "outbound adapter",
    ])
  ) {
    context.addTechnology(
      "Hexagonal Architecture",
      "Detected ports-and-adapters or hexagonal architecture patterns.",
      30,
      "STRONG"
    );
  }
};