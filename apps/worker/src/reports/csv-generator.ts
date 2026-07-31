import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * One CSV row representing a value inside the Executive Report snapshot.
 */
interface CsvRow {
  section: string;
  metric: string;
  value: string;
}

/**
 * Escapes CSV values so commas, quotes, and line breaks do not corrupt
 * the generated file.
 */
const escapeCsvValue = (
  value: string,
): string => {
  const escaped = value.replace(/"/g, '""');

  return `"${escaped}"`;
};

/**
 * Converts deeply nested report JSON into a flat list of CSV rows.
 *
 * Example:
 *
 * organization.overview.totalRepositories = 82
 *
 * becomes:
 *
 * section: organization.overview
 * metric: totalRepositories
 * value: 82
 */
const flattenReportData = (
  value: unknown,
  currentPath = "report",
  rows: CsvRow[] = [],
): CsvRow[] => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      rows.push({
        section: currentPath,
        metric: "items",
        value: "[]",
      });

      return rows;
    }

    value.forEach((item, index) => {
      flattenReportData(
        item,
        `${currentPath}[${index}]`,
        rows,
      );
    });

    return rows;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const entries = Object.entries(
      value as Record<string, unknown>,
    );

    if (entries.length === 0) {
      rows.push({
        section: currentPath,
        metric: "value",
        value: "{}",
      });

      return rows;
    }

    for (const [key, nestedValue] of entries) {
      if (
        nestedValue !== null &&
        typeof nestedValue === "object"
      ) {
        flattenReportData(
          nestedValue,
          `${currentPath}.${key}`,
          rows,
        );

        continue;
      }

      rows.push({
        section: currentPath,
        metric: key,
        value:
          nestedValue === null ||
          nestedValue === undefined
            ? ""
            : String(nestedValue),
      });
    }

    return rows;
  }

  rows.push({
    section: currentPath,
    metric: "value",
    value:
      value === null || value === undefined
        ? ""
        : String(value),
  });

  return rows;
};

export const generateReportCsv = async ({
  reportId,
  reportSnapshot,
  outputDirectory,
}: {
  reportId: string;
  reportSnapshot: unknown;
  outputDirectory: string;
}): Promise<string> => {
  await mkdir(outputDirectory, {
    recursive: true,
  });

  const rows = flattenReportData(
    reportSnapshot,
  );

  const headers = [
    "Section",
    "Metric",
    "Value",
  ];

  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      [
        row.section,
        row.metric,
        row.value,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  const csvPath = path.join(
    outputDirectory,
    `${reportId}.csv`,
  );

  await writeFile(
    csvPath,
    lines.join("\n"),
    "utf8",
  );

  return csvPath;
};