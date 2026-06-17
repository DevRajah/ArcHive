import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectDevopsCapability = (context: CapabilityContext) => {
  const { combinedText, addCapability } = context;

  if (
    includesAny(combinedText, [
      "dockerfile",
      "docker-compose",
      "github actions",
      ".github/workflows",
      "terraform",
      "kubernetes",
      "helm",
      "nginx",
      "ci/cd",
    ])
  ) {
    addCapability(
      "DEVOPS_INFRASTRUCTURE",
      86,
      "Repository contains deployment, containerization, CI/CD, or infrastructure automation signals."
    );
  }
};