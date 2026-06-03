export function matchesSearch(
  value: string | undefined | null,
  query: string
) {
  if (!value) return false;

  return value.toLowerCase().includes(query.toLowerCase());
}

export function formatFilterLabel(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => {
      if (word === "ui") return "UI";
      if (word === "api") return "API";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}