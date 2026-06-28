import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDeveloperToolEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  const isEngineeringIntelligenceRepository = includesAny(combinedText, [
  "engineering intelligence",
  "engineering-intelligence",
  "repository intelligence",
  "repository-intelligence",
  "architecture intelligence",
  "architecture-intelligence",
  "repository fingerprint",
  "technology fingerprint",
  "architecture drift",
  "repository health",
  "repository maturity",
  "repository purpose",
  "canonical intelligence wrapper",
]);

if (isEngineeringIntelligenceRepository) {
  return;
}

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

  const hasDeveloperToolSignal =
    combinedText.includes("backend-forge") ||
    (
      combinedText.includes("scaffold") &&
      combinedText.includes("cli")
    ) ||
    (
      combinedText.includes("generator") &&
      combinedText.includes("cli")
    ) ||
    combinedText.includes("generate module") ||
    combinedText.includes("module generator") ||
    combinedText.includes("backend generator");

  if (hasDeveloperToolSignal) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected CLI, scaffolding, or backend generation tooling patterns",
      85,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  

  console.log("===== DEVTOOL DETECTOR =====");
  console.log({
    scaffold: combinedText.includes("scaffold"),
    generator: combinedText.includes("generator"),
    cli: combinedText.includes("cli"),
    commander: combinedText.includes("commander"),
    inquirer: combinedText.includes("inquirer"),
    backendForge: combinedText.includes("backend-forge"),
    generateModule: combinedText.includes("generate module"),
  });
};