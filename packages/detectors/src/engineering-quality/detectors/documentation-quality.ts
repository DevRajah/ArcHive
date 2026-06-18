import { QualityDetector } from "../quality-registry";

export const detectDocumentationQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (context.repositoryTypes.includes("DOCUMENTATION_HEAVY_REPOSITORY")) {
    addQuality(
      "DOCUMENTATION",
      45,
      "Repository contains strong documentation-heavy evidence."
    );
  }

  if (context.technologies.includes("Technical Documentation")) {
    addQuality(
      "DOCUMENTATION",
      30,
      "Technical documentation was detected as a repository technology signal."
    );
  }

  if (
    context.architectureDomains.includes("KNOWLEDGE_MANAGEMENT") ||
    context.architectureDomains.includes("DOCUMENTATION_SYSTEM")
  ) {
    addQuality(
      "DOCUMENTATION",
      25,
      "Repository includes knowledge management or documentation architecture signals."
    );
  }
};