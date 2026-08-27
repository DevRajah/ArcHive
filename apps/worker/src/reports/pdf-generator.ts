import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";

import PDFDocument from "pdfkit";

import type {
    ExecutiveSummary,
} from "./executive-summary";

import type {
    ExecutiveKpis,
} from "./kpi-builder";

import type {
    RiskAssessmentContext,
} from "@archive/types";

import type {
    RiskBreakdown,
} from "./risk-analysis";

import type {
    TechnologyAnalysis,
} from "./technology-analysis";

import type {
    EngineeringTrendAnalysis,
} from "./trend-analysis";

import type {
    RepositoryHighlights,
} from "./repository-highlights";

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

const addMetric = (
    document: PDFKit.PDFDocument,
    label: string,
    value: string | number,
): void => {
    document
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`${label}: `, {
            continued: true,
        })
        .font("Helvetica")
        .text(String(value))
        .moveDown(0.25);
};

const formatPercentageChange = (
    value: number | null,
): string => {
    if (value === null) {
        return "Not available";
    }

    const prefix =
        value > 0 ? "+" : "";

    return `${prefix}${value}%`;
};

export const generateReportPdf = async ({
    reportId,
    title,
    description,
    generatedAt,
    executiveSummary,
    executiveKpis,
    riskBreakdown,
    riskAssessment,
    technologyAnalysis,
    trendAnalysis,
    repositoryHighlights,
    organization,
    outputDirectory,
}: {
    reportId: string;
    title: string;
    description: string | null;
    generatedAt: Date;
    executiveSummary: ExecutiveSummary;
    executiveKpis: ExecutiveKpis;
    riskBreakdown: RiskBreakdown;
    riskAssessment: RiskAssessmentContext;
    technologyAnalysis: TechnologyAnalysis;
    trendAnalysis: EngineeringTrendAnalysis;
    repositoryHighlights: RepositoryHighlights;
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
     * Executive Summary
     *
     * Keep the human-readable assessment together before moving
     * into the numerical report sections.
     */
    addSectionHeading(
        document,
        "Executive Summary",
    );

    document
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
            executiveSummary.headline ||
            "Executive summary not available",
        )
        .moveDown(0.5)
        .font("Helvetica")
        .fontSize(11)
        .text(
            executiveSummary.overallHealth ||
            "No overall engineering-health summary was stored for this report.",
        );

    /**
     * Executive KPIs
     */
    addSectionHeading(
        document,
        "Executive KPIs",
    );

    addMetric(
        document,
        "Repositories analysed",
        executiveKpis.repositories,
    );

    addMetric(
        document,
        "Average architecture score",
        `${executiveKpis.averageArchitectureScore}%`,
    );

    addMetric(
        document,
        "High-risk repositories",
        executiveKpis.highRiskRepositories,
    );

    addMetric(
        document,
        "Engineering recommendations",
        executiveKpis.recommendations,
    );

    addMetric(
        document,
        "Technologies identified",
        executiveKpis.technologies,
    );

    addMetric(
        document,
        "Recent engineering events",
        executiveKpis.engineeringEvents,
    );

    /**
     * Schema V4 Risk Assessment Coverage
     *
     * Important semantics:
     *
     * assessment coverage tells us how much of the repository
     * population could actually receive a canonical risk assessment.
     *
     * averageRiskScore and overallRiskLevel apply ONLY to that
     * assessed population.
     *
     * null must remain unavailable. It must never become 0 or LOW.
     */
    addSectionHeading(
        document,
        "Risk Assessment Coverage",
    );

    addMetric(
        document,
        "Total repositories",
        riskAssessment.totalRepositories,
    );

    addMetric(
        document,
        "Repositories assessed for risk",
        riskAssessment.assessedRepositories,
    );

    addMetric(
        document,
        "Repositories unassessed for risk",
        riskAssessment.unassessedRepositories,
    );

    addMetric(
        document,
        "Risk assessment coverage",
        `${riskAssessment.assessmentCoveragePercentage}%`,
    );

    addMetric(
        document,
        "Average assessed risk",
        riskAssessment.averageRiskScore === null
            ? "Not assessed"
            : riskAssessment.averageRiskScore,
    );

    addMetric(
        document,
        "Assessed risk level",
        riskAssessment.overallRiskLevel ??
        "Not assessed",
    );

    /**
     * Risk Breakdown
     *
     * This breakdown contains only repositories admitted to the
     * backend-owned canonical risk population.
     */
    addSectionHeading(
        document,
        "Risk Breakdown",
    );

    addMetric(
        document,
        "Critical",
        riskBreakdown.critical,
    );

    addMetric(
        document,
        "High",
        riskBreakdown.high,
    );

    addMetric(
        document,
        "Medium",
        riskBreakdown.medium,
    );

    addMetric(
        document,
        "Low",
        riskBreakdown.low,
    );

    addMetric(
        document,
        "Unclassified",
        riskBreakdown.unknown,
    );

    addMetric(
        document,
        "Total assessed repositories",
        riskBreakdown.total,
    );

    addMetric(
        document,
        "Highest assessed severity",
        riskBreakdown.highestSeverity ??
        "Not assessed",
    );

    // document
    //     .font("Helvetica-Bold")
    //     .fontSize(12)
    //     .text(executiveSummary.headline)
    //     .moveDown(0.5)
    //     .font("Helvetica")
    //     .fontSize(11)
    //     .text(
    //         executiveSummary.overallHealth,
    //     );

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

    addSectionHeading(
        document,
        "Technology Analysis",
    );

    addMetric(
        document,
        "Technologies identified",
        technologyAnalysis.totalTechnologies,
    );

    addMetric(
        document,
        "Dominant technology",
        technologyAnalysis
            .dominantTechnology ??
        "Not available",
    );

    addSectionHeading(
        document,
        "Engineering Trend",
    );

    addMetric(
        document,
        "Direction",
        trendAnalysis.direction,
    );

    addMetric(
        document,
        "Latest value",
        trendAnalysis.latestValue ??
        "Not available",
    );

    addMetric(
        document,
        "Previous value",
        trendAnalysis.previousValue ??
        "Not available",
    );

    addMetric(
        document,
        "Percentage change",
        formatPercentageChange(
            trendAnalysis.percentageChange,
        ),
    );

    addSectionHeading(
        document,
        "Repository Highlights",
    );

    document
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Strongest repositories")
        .moveDown(0.4);

    if (
        repositoryHighlights
            .strongest.length === 0
    ) {
        document
            .font("Helvetica")
            .fontSize(10)
            .text(
                "No repository ranking data was available.",
            );
    } else {
        for (
            const repository of
            repositoryHighlights.strongest
        ) {
            document
                .font("Helvetica")
                .fontSize(10)
                .text(
                    `• ${repository.name}: ${repository.score}`,
                    {
                        indent: 12,
                        paragraphGap: 4,
                    },
                );
        }
    }

    document
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "Repositories requiring attention",
        )
        .moveDown(0.4);

    if (
        repositoryHighlights
            .needsAttention.length === 0
    ) {
        document
            .font("Helvetica")
            .fontSize(10)
            .text(
                "No repository ranking data was available.",
            );
    } else {
        for (
            const repository of
            repositoryHighlights
                .needsAttention
        ) {
            const riskInformation =
                repository.riskLevel
                    ? `, risk: ${repository.riskLevel}`
                    : "";

            document
                .font("Helvetica")
                .fontSize(10)
                .text(
                    `• ${repository.name}: ${repository.score}${riskInformation}`,
                    {
                        indent: 12,
                        paragraphGap: 4,
                    },
                );
        }
    }

    if (
        technologyAnalysis
            .topTechnologies.length > 0
    ) {
        document
            .moveDown(0.4)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text("Top technologies")
            .moveDown(0.3);

        for (
            const technology of
            technologyAnalysis.topTechnologies
        ) {
            const details = [
                technology.usageCount > 0
                    ? `${technology.usageCount} repositories`
                    : null,

                technology.percentage !== null
                    ? `${technology.percentage}%`
                    : null,

                technology.category,
            ]
                .filter(Boolean)
                .join(", ");

            document
                .font("Helvetica")
                .fontSize(10)
                .text(
                    `• ${technology.name}${details
                        ? `: ${details}`
                        : ""
                    }`,
                    {
                        indent: 12,
                        paragraphGap: 4,
                    },
                );
        }
    } else {
        document
            .font("Helvetica")
            .fontSize(10)
            .text(
                "No technology inventory was available for this report.",
            );
    }

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
            `Risk assessment coverage: ${riskAssessment.assessmentCoveragePercentage}% (${riskAssessment.assessedRepositories} of ${riskAssessment.totalRepositories} repositories assessed)`,
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
            `Repositories with assessed risk: ${riskAssessment.assessedRepositories}`,
        )
        .moveDown(0.3)
        .text(
            `Activity records: ${getArrayLength(
                organization.activity?.items ??
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