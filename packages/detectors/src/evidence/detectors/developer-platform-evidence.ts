import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDeveloperPlatformEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "developer platform",
      "internal developer platform",
      "platform engineering",
      "developer infrastructure",
    ])
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected developer platform or platform engineering terminology",
      35,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "service orchestration",
      "service composition",
      "worker platform",
      "runtime platform",
    ])
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected service orchestration or runtime platform evidence",
      30,
      "ARCHITECTURE_PATTERN",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, ["sdk", "plugin"]) &&
    includesAny(combinedText, ["platform", "developer", "runtime", "tooling"])
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected SDK/plugin patterns connected to platform tooling",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }
};