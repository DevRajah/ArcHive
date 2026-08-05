import type {
  EvidenceContext,
} from "../evidence-types";

const EXTENSION_LANGUAGE_MAP =
  new Map<string, string>([
    [".ts", "TypeScript"],
    [".tsx", "TypeScript"],
    [".js", "JavaScript"],
    [".jsx", "JavaScript"],
    [".py", "Python"],
    [".go", "Go"],
    [".java", "Java"],
    [".rs", "Rust"],
    [".php", "PHP"],
    [".cs", "C#"],
    [".kt", "Kotlin"],
    [".swift", "Swift"],
  ]);

export function collectLanguageEvidence(
  context: EvidenceContext,
): void {

  for (
    const file of context.filesChanged
  ) {

    const extension =
      file.substring(
        file.lastIndexOf("."),
      );

    const language =
      EXTENSION_LANGUAGE_MAP.get(
        extension.toLowerCase(),
      );

    if (
      language
    ) {

      context.languages.add(
        language,
      );

    }

  }

}