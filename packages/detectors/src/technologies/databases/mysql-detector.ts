import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectMySqlTechnology: TechnologyDetector = (context) => {
  if (hasKeyword(context, ["mysql", "mariadb"])) {
    context.addTechnology(
      "MySQL",
      "Detected MySQL or MariaDB database usage.",
      20,
      "STRONG"
    );
  }
};