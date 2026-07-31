import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";

import PDFDocument from "pdfkit";

import type {
  ExecutiveSummary,
} from "./executive-summary";

type OrganizationDashboard =
  Record<string, any>;

const addSectionHeading = (
  document: PDFKit.PDFDocument,
  heading: string,
): void => {
  document
    .moveDown(1)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(heading)
    .moveDown(0.4);
};

const addBulletList = (
  document: PDFKit.PDFDocument,
  values: string[],
): void => {
  for (const value of values) {
    document
      .font("Helvetica")
      .fontSize(10)
      .text(`• ${value}`, {
        indent: 12,
        paragraphGap: 5,
      });
  }
};

const getArrayLength = (
  value: unknown,
): number => {
  return Array.isArray(value)
    ? value.length
    : 0;
};

const getOverviewMetric = (
  overview: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = overview[key];

    if (
      value !== undefined &&
      value !== null
    ) {
      return String(value);
    }
  }

  return "Not available";
};

export const generateReportPdf = async ({
  reportId,
  title,
  description,
  generatedAt,
  executiveSummary,
  organization,
  outputDirectory,
}: {
  reportId: string;
  title: string;
  description: string | null;
  generatedAt: Date;
  executiveSummary: ExecutiveSummary;
  organization: OrganizationDashboard;
  outputDirectory: string;
}): Promise<string> => {
  await mkdir(outputDirectory, {
    recursive: true,
  });

  const pdfPath = path.join(
    outputDirectory,
    `${reportId}.pdf`,
  );

  const document = new PDFDocument({
    size: "A4",
    margins: {
      top: 55,
      bottom: 55,
      left: 55,
      right: 55,
    },
    info: {
      Title: title,
      Author: "ArcHive",
      Subject:
        "Executive Engineering Intelligence Report",
      Creator: "ArcHive",
    },
  });

  const output = createWriteStream(
    pdfPath,
  );

  document.pipe(output);

  /**
   * Cover section
   */
  document
    .font("Helvetica-Bold")
    .fontSize(28)
    .text("ArcHive", {
      align: "center",
    })
    .moveDown(0.5)
    .fontSize(21)
    .text(title, {
      align: "center",
    })
    .moveDown(0.8);

  if (description) {
    document
      .font("Helvetica")
      .fontSize(11)
      .text(description, {
        align: "center",
      })
      .moveDown(1);
  }

  document
    .fontSize(10)
    .text(
      `Generated: ${generatedAt.toLocaleString(
        "en-GB",
      )}`,
      {
        align: "center",
      },
    )
    .moveDown(0.3)
    .text(`Report ID: ${reportId}`, {
      align: "center",
    });

  document.addPage();

  /**
   * Executive summary
   */
  addSectionHeading(
    document,
    "Executive Summary",
  );

  document
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(executiveSummary.headline)
    .moveDown(0.5)
    .font("Helvetica")
    .fontSize(11)
    .text(
      executiveSummary.overallHealth,
    );

  addSectionHeading(
    document,
    "Key Strengths",
  );

  addBulletList(
    document,
    executiveSummary.strengths,
  );

  addSectionHeading(
    document,
    "Areas of Concern",
  );

  addBulletList(
    document,
    executiveSummary.concerns,
  );

  addSectionHeading(
    document,
    "Recommended Actions",
  );

  addBulletList(
    document,
    executiveSummary.recommendations,
  );

  /**
   * Portfolio overview
   */
  const overview =
    organization.overview ?? {};

  addSectionHeading(
    document,
    "Portfolio Overview",
  );

  document
    .font("Helvetica")
    .fontSize(11)
    .text(
      `Repositories: ${getOverviewMetric(
        overview,
        [
          "totalRepositories",
          "repositories",
        ],
      )}`,
    )
    .moveDown(0.3)
    .text(
      `Average architecture score: ${getOverviewMetric(
        overview,
        [
          "averageArchitectureScore",
          "architectureScore",
          "averageHealthScore",
        ],
      )}`,
    )
    .moveDown(0.3)
    .text(
      `Repositories at risk: ${getOverviewMetric(
        overview,
        [
          "highRiskRepositories",
          "repositoriesAtRisk",
        ],
      )}`,
    );

  /**
   * Intelligence section counts
   */
  addSectionHeading(
    document,
    "Engineering Intelligence",
  );

  document
    .font("Helvetica")
    .fontSize(11)
    .text(
      `Repository rankings: ${getArrayLength(
        organization.rankings,
      )}`,
    )
    .moveDown(0.3)
    .text(
      `Recommendations: ${getArrayLength(
        organization.recommendations,
      )}`,
    )
    .moveDown(0.3)
    .text(
      `Identified risks: ${getArrayLength(
        organization.risks,
      )}`,
    )
    .moveDown(0.3)
    .text(
      `Activity records: ${getArrayLength(
        organization.activity,
      )}`,
    );

  document
    .moveDown(2)
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text(
      "This report represents an immutable snapshot of ArcHive Organization Intelligence at the time of generation.",
      {
        align: "center",
      },
    );

  document.end();

  /**
   * Do not return until the complete PDF has been written.
   */
  await new Promise<void>(
    (resolve, reject) => {
      output.on("finish", resolve);
      output.on("error", reject);
      document.on("error", reject);
    },
  );

  return pdfPath;
};