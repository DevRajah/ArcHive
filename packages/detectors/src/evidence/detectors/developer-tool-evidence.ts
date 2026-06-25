import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDeveloperToolEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (includesAny(combinedText, ["scaffold", "scaffolding"])) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected scaffolding workflow terminology",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (includesAny(combinedText, ["generator", "codegen", "code generation"])) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected code generation or generator tooling",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "cli",
      "command line",
      "commander",
      "inquirer",
      "backend-forge",
      "generate module",
      "generate resource",
      "scaffold backend",
      "crud generator",
      "module generator",
      "backend generator",
    ])
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected CLI tooling dependencies or command-line patterns",
      25,
      "DEPENDENCY",
      "MEDIUM"
    );
  }

  if (
    includesAny(combinedText, ["boilerplate", "template"]) &&
    includesAny(combinedText, ["generator", "scaffold", "cli", "codegen"])
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected boilerplate/template usage with generator or CLI evidence",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM"
    );
  }
};