export const normalizeText = (value: string) => {
  return value.toLowerCase().trim();
};

export const includesAny = (text: string, values: string[]) => {
  const normalizedText = normalizeText(text);

  return values.some((value) =>
    normalizedText.includes(normalizeText(value))
  );
};

export const fileMatchesAny = (files: string[], matchers: string[]) => {
  return files.some((file) => {
    const normalizedFile = normalizeText(file);

    return matchers.some((matcher) =>
      normalizedFile.includes(normalizeText(matcher))
    );
  });
};

export const fileEndsWithAny = (files: string[], extensions: string[]) => {
  return files.some((file) => {
    const normalizedFile = normalizeText(file);

    return extensions.some((extension) =>
      normalizedFile.endsWith(normalizeText(extension))
    );
  });
};

export const fileEqualsAny = (files: string[], names: string[]) => {
  return files.some((file) => {
    const normalizedFile = normalizeText(file);

    return names.some((name) => normalizedFile === normalizeText(name));
  });
};

export const humanizeSignal = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};