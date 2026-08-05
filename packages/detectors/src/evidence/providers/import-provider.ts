import type {
  EvidenceContext,
} from "../evidence-types";

/**
 * Files worth scanning for imports.
 */
const SOURCE_FILE_PATTERN =
  /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

/**
 * Collect implementation files that may later be parsed
 * for import statements.
 *
 * Parsing comes later.
 */
export function collectImportEvidence(
  context: EvidenceContext,
): void {

  for (
    const file of context.filesChanged
  ) {

    if (
      !SOURCE_FILE_PATTERN.test(
        file,
      )
    ) {
      continue;
    }

    context.importFiles.add(
      file,
    );

  }

}