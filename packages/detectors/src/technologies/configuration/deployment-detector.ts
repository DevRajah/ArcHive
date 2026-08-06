import type {
  EvidenceContext,
} from "../../evidence";

export const detectDeploymentPlatforms = (
  context: EvidenceContext,
) => {
  for (const path of context.configurationFiles) {
    const file =
      path.toLowerCase();

    if (
      file.endsWith(
        "vercel.json",
      )
    ) {
      context.addTechnology({
        name:
          "Vercel Hosting",

        reason:
          "Detected vercel.json.",

        weight:
          90,

        strength:
          "STRONG",

        source:
          "CONFIGURATION",

        evidence:
          path,

        status:
          "CONFIRMED",
      });
    }

    if (
      file.endsWith(
        "railway.json",
      )
    ) {
      context.addTechnology({
        name:
          "Railway Hosting",

        reason:
          "Detected railway.json.",

        weight:
          90,

        strength:
          "STRONG",

        source:
          "CONFIGURATION",

        evidence:
          path,

        status:
          "CONFIRMED",
      });
    }

    if (
      file.endsWith(
        "render.yaml",
      ) ||
      file.endsWith(
        "render.yml",
      )
    ) {
      context.addTechnology({
        name:
          "Render Hosting",

        reason:
          "Detected render.yaml.",

        weight:
          90,

        strength:
          "STRONG",

        source:
          "CONFIGURATION",

        evidence:
          path,

        status:
          "CONFIRMED",
      });
    }
  }
};