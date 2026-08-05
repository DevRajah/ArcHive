import path from "node:path";

import type {
  EvidenceContext,
} from "../evidence-types";

/**
 * Dependency manifests that ArcHive currently understands.
 *
 * Additional ecosystems can be added here later without changing
 * any detector.
 */
const SUPPORTED_MANIFESTS = new Set([
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",

  "composer.json",

  "requirements.txt",

  "go.mod",

  "cargo.toml",

  "pom.xml",
]);

/**
 * Reads repository files and records dependency manifest locations.
 *
 * NOTE:
 * This provider DOES NOT classify technologies.
 * It only discovers evidence for later stages.
 */
export function collectDependencyEvidence(
  context: EvidenceContext,
): void {

  const files =
    context.filesChanged;

  for (const changedFile of files) {

    const fileName =
      path.basename(
        changedFile,
      ).toLowerCase();

    if (
      !SUPPORTED_MANIFESTS.has(
        fileName,
      )
    ) {
      continue;
    }

    context.dependencyFiles.add(
      changedFile,
    );

  }

}