import { QualityDetector } from "../quality-registry";

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

const hasCapability = (context: Parameters<QualityDetector>[0], key: string) =>
  context.capabilities.some((capability) => capability.key === key);

export const detectDevopsQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (hasCapability(context, "DEVOPS_INFRASTRUCTURE")) {
    addQuality(
      "DEVOPS",
      35,
      "DevOps capability was detected from deployment, containerization, or CI/CD evidence."
    );
  }

  if (
    hasTechnology(context, [
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
    ])
  ) {
    addQuality(
      "DEVOPS",
      40,
      "Repository includes deployment, infrastructure, or CI/CD technologies."
    );
  }

  if (
    hasTechnology(context, ["AWS", "Microsoft Azure", "Google Cloud", "Vercel"])
  ) {
    addQuality(
      "DEVOPS",
      20,
      "Repository includes cloud platform deployment signals."
    );
  }
};