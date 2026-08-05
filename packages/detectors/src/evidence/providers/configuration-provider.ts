import type {
  EvidenceContext,
} from "../evidence-types";

/**
 * Framework configuration files.
 */
const CONFIG_PATTERNS = [

  /^next\.config/i,

  /^vite\.config/i,

  /^nuxt\.config/i,

  /^astro\.config/i,

  /^docker-compose/i,

  /^dockerfile/i,

  /^tsconfig/i,

  /^eslint/i,

  /^prettier/i,

];

export function collectConfigurationEvidence(
  context: EvidenceContext,
): void {

  for (
    const file of context.filesChanged
  ) {

    const name =
      file.split("/").pop() ??
      "";

    const matched =
      CONFIG_PATTERNS.some(
        (pattern) =>
          pattern.test(
            name.toLowerCase(),
          ),
      );

    if (
      matched
    ) {

      context.configurationFiles.add(
        file,
      );

    }

  }

}