import type {
  EvidenceContext,
} from "../../evidence";

const isDockerfile = (
  filePath: string,
): boolean => {
  const fileName =
    filePath
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.toLowerCase() ?? "";

  return (
    fileName === "dockerfile" ||
    fileName.startsWith(
      "dockerfile.",
    )
  );
};

const extractBaseImages = (
  content: string,
): string[] => {
  const images =
    new Set<string>();

  const fromPattern =
    /^\s*from\s+(?:--platform=\S+\s+)?([^\s]+)(?:\s+as\s+\S+)?/gim;

  for (
    const match of
    content.matchAll(
      fromPattern,
    )
  ) {
    if (match[1]) {
      images.add(
        match[1],
      );
    }
  }

  return Array.from(images);
};

/**
 * Understands how Docker is being used rather than merely detecting
 * that a Dockerfile exists.
 */
export const detectDockerIntelligence = (
  context: EvidenceContext,
): void => {
  for (
    const file of
    context.repositoryFiles
  ) {
    if (
      !isDockerfile(
        file.path,
      )
    ) {
      continue;
    }

    const normalizedContent =
      file.content.toLowerCase();

    const baseImages =
      extractBaseImages(
        file.content,
      );

    context.addTechnology({
      name: "Docker",
      reason:
        "Detected a Docker image definition.",
      weight: 95,
      strength: "STRONG",
      source: "CONFIGURATION",
      evidence:
        `${file.path}: ${baseImages.join(", ") || "Dockerfile"}`,
      status: "CONFIRMED",
    });

    /**
     * Multiple FROM instructions usually indicate a multi-stage build.
     */
    if (baseImages.length > 1) {
      context.addTechnology({
        name:
          "Docker Multi-Stage Build",
        reason:
          "Detected multiple Docker build stages.",
        weight: 90,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      baseImages.some(
        (image) =>
          image
            .toLowerCase()
            .includes("alpine"),
      )
    ) {
      context.addTechnology({
        name:
          "Alpine Container Image",
        reason:
          "Detected an Alpine-based container image.",
        weight: 85,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      baseImages.some(
        (image) =>
          image
            .toLowerCase()
            .includes("distroless"),
      )
    ) {
      context.addTechnology({
        name:
          "Distroless Container Image",
        reason:
          "Detected a minimal distroless production image.",
        weight: 95,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      normalizedContent.includes(
        "healthcheck",
      )
    ) {
      context.addTechnology({
        name:
          "Container Health Checks",
        reason:
          "Detected a Docker HEALTHCHECK instruction.",
        weight: 90,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      normalizedContent.includes(
        "\nuser ",
      ) ||
      normalizedContent.startsWith(
        "user ",
      )
    ) {
      context.addTechnology({
        name:
          "Non-Root Container Runtime",
        reason:
          "Detected an explicit Docker USER instruction.",
        weight: 90,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      normalizedContent.includes(
        "npm ci",
      ) ||
      normalizedContent.includes(
        "pnpm install --frozen-lockfile",
      ) ||
      normalizedContent.includes(
        "yarn install --frozen-lockfile",
      ) ||
      normalizedContent.includes(
        "yarn install --immutable",
      )
    ) {
      context.addTechnology({
        name:
          "Reproducible Container Dependencies",
        reason:
          "Detected lockfile-respecting dependency installation.",
        weight: 85,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }

    if (
      normalizedContent.includes(
        "npm run build",
      ) ||
      normalizedContent.includes(
        "pnpm build",
      ) ||
      normalizedContent.includes(
        "yarn build",
      )
    ) {
      context.addTechnology({
        name:
          "Containerised Build Pipeline",
        reason:
          "Detected an application build step inside the Dockerfile.",
        weight: 85,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence: file.path,
        status: "CONFIRMED",
      });
    }
  }
};