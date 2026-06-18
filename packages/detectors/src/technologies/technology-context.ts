import { EvidenceContext } from "../evidence";

export const hasKeyword = (
  context: EvidenceContext,
  keywords: string[]
) => {
  const text = context.combinedText.toLowerCase();

  return keywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
};

export const hasFile = (
  context: EvidenceContext,
  matcher: (file: string) => boolean
) => {
  return context.filesChanged.some((file) =>
    matcher(file.toLowerCase())
  );
};