import { api } from "@/lib/api";

import type {
  DeleteReportResponse,
  EngineeringTrendAnalysis,
  ExecutiveKpis,
  ExecutiveReport,
  ExecutiveSummary,
  GenerateReportPayload,
  GenerateReportResponse,
  GetReportResponse,
  ListReportsResponse,
  NormalizedExecutiveReport,
  RepositoryHighlights,
  ReportStatusResponse,
  RiskBreakdown,
  TechnologyAnalysis,
} from "@/types/report.types";

const emptyExecutiveSummary: ExecutiveSummary = {
  headline: "",
  overallHealth: "",
  strengths: [],
  concerns: [],
  recommendations: [],
};

const emptyExecutiveKpis: ExecutiveKpis = {
  repositories: 0,
  averageArchitectureScore: 0,
  highRiskRepositories: 0,
  recommendations: 0,
  technologies: 0,
  engineeringEvents: 0,
};

const emptyRiskBreakdown: RiskBreakdown = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  unknown: 0,
  total: 0,
  highestSeverity: null,
};

const emptyTechnologyAnalysis: TechnologyAnalysis = {
  totalTechnologies: 0,
  topTechnologies: [],
  dominantTechnology: null,
  categories: {},
};

const emptyTrendAnalysis: EngineeringTrendAnalysis = {
  direction: "UNKNOWN",
  percentageChange: null,
  latestValue: null,
  previousValue: null,
  points: [],
};

const emptyRepositoryHighlights: RepositoryHighlights = {
  strongest: [],
  needsAttention: [],
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function asString(
  value: unknown,
  fallback = "",
) {
  return typeof value === "string"
    ? value
    : fallback;
}

function asNullableString(
  value: unknown,
) {
  return typeof value === "string"
    ? value
    : null;
}

function asNumber(
  value: unknown,
  fallback = 0,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function asNullableNumber(
  value: unknown,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function asStringArray(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function normalizeExecutiveSummary(
  value: unknown,
): ExecutiveSummary {
  if (!isRecord(value)) {
    return {
      ...emptyExecutiveSummary,
    };
  }

  return {
    headline: asString(
      value.headline,
    ),

    overallHealth: asString(
      value.overallHealth,
    ),

    strengths: asStringArray(
      value.strengths,
    ),

    concerns: asStringArray(
      value.concerns,
    ),

    recommendations: asStringArray(
      value.recommendations,
    ),
  };
}

function normalizeExecutiveKpis(
  value: unknown,
): ExecutiveKpis {
  if (!isRecord(value)) {
    return {
      ...emptyExecutiveKpis,
    };
  }

  return {
    repositories: asNumber(
      value.repositories,
    ),

    averageArchitectureScore:
      asNumber(
        value.averageArchitectureScore,
      ),

    highRiskRepositories:
      asNumber(
        value.highRiskRepositories,
      ),

    recommendations: asNumber(
      value.recommendations,
    ),

    technologies: asNumber(
      value.technologies,
    ),

    engineeringEvents: asNumber(
      value.engineeringEvents,
    ),
  };
}

function normalizeRiskBreakdown(
  value: unknown,
): RiskBreakdown {
  if (!isRecord(value)) {
    return {
      ...emptyRiskBreakdown,
    };
  }

  const highestSeverity =
    value.highestSeverity ===
      "CRITICAL" ||
    value.highestSeverity === "HIGH" ||
    value.highestSeverity === "MEDIUM" ||
    value.highestSeverity === "LOW"
      ? value.highestSeverity
      : null;

  return {
    critical: asNumber(
      value.critical,
    ),

    high: asNumber(
      value.high,
    ),

    medium: asNumber(
      value.medium,
    ),

    low: asNumber(
      value.low,
    ),

    unknown: asNumber(
      value.unknown,
    ),

    total: asNumber(
      value.total,
    ),

    highestSeverity,
  };
}

function normalizeTechnologyAnalysis(
  value: unknown,
): TechnologyAnalysis {
  if (!isRecord(value)) {
    return {
      ...emptyTechnologyAnalysis,
    };
  }

  const topTechnologies =
    Array.isArray(
      value.topTechnologies,
    )
      ? value.topTechnologies
          .filter(isRecord)
          .map((technology) => ({
            name: asString(
              technology.name,
              "Unknown technology",
            ),

            usageCount: asNumber(
              technology.usageCount,
            ),

            category:
              asNullableString(
                technology.category,
              ),

            percentage:
              asNullableNumber(
                technology.percentage,
              ),
          }))
      : [];

  const categories =
    isRecord(value.categories)
      ? Object.fromEntries(
          Object.entries(
            value.categories,
          ).map(
            ([category, count]) => [
              category,
              asNumber(count),
            ],
          ),
        )
      : {};

  return {
    totalTechnologies: asNumber(
      value.totalTechnologies,
    ),

    topTechnologies,

    dominantTechnology:
      asNullableString(
        value.dominantTechnology,
      ),

    categories,
  };
}

function normalizeTrendAnalysis(
  value: unknown,
): EngineeringTrendAnalysis {
  if (!isRecord(value)) {
    return {
      ...emptyTrendAnalysis,
    };
  }

  const direction =
    value.direction ===
      "IMPROVING" ||
    value.direction ===
      "DECLINING" ||
    value.direction ===
      "STABLE" ||
    value.direction ===
      "UNKNOWN"
      ? value.direction
      : "UNKNOWN";

  const points =
    Array.isArray(value.points)
      ? value.points
          .filter(isRecord)
          .map((point) => ({
            label: asString(
              point.label,
            ),

            value: asNumber(
              point.value,
            ),
          }))
      : [];

  return {
    direction,

    percentageChange:
      asNullableNumber(
        value.percentageChange,
      ),

    latestValue:
      asNullableNumber(
        value.latestValue,
      ),

    previousValue:
      asNullableNumber(
        value.previousValue,
      ),

    points,
  };
}

function normalizeRepositoryHighlights(
  value: unknown,
): RepositoryHighlights {
  if (!isRecord(value)) {
    return {
      ...emptyRepositoryHighlights,
    };
  }

  function normalizeItems(
    items: unknown,
  ) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter(isRecord)
      .map((repository) => ({
        repositoryId:
          asNullableString(
            repository.repositoryId,
          ),

        name: asString(
          repository.name,
          "Unknown repository",
        ),

        score: asNumber(
          repository.score,
        ),

        riskLevel:
          asNullableString(
            repository.riskLevel,
          ),
      }));
  }

  return {
    strongest: normalizeItems(
      value.strongest,
    ),

    needsAttention: normalizeItems(
      value.needsAttention,
    ),
  };
}

function normalizeReport(
  report: ExecutiveReport,
): NormalizedExecutiveReport {
  const reportData =
    report.reportData;

  if (!reportData) {
    return {
      ...report,
      schemaVersion: null,
      isLegacy: false,
      analytics: null,
    };
  }

  if (
    reportData.schemaVersion !== 2
  ) {
    return {
      ...report,
      schemaVersion:
        reportData.schemaVersion ===
        1
          ? 1
          : null,

      isLegacy: true,
      analytics: null,
    };
  }

  const rawSnapshot =
    reportData as unknown as Record<
      string,
      unknown
    >;

  return {
    ...report,

    schemaVersion: 2,

    isLegacy: false,

    analytics: {
      executiveSummary:
        normalizeExecutiveSummary(
          rawSnapshot.executiveSummary,
        ),

      executiveKpis:
        normalizeExecutiveKpis(
          rawSnapshot.executiveKpis,
        ),

      riskBreakdown:
        normalizeRiskBreakdown(
          rawSnapshot.riskBreakdown,
        ),

      technologyAnalysis:
        normalizeTechnologyAnalysis(
          rawSnapshot.technologyAnalysis,
        ),

      trendAnalysis:
        normalizeTrendAnalysis(
          rawSnapshot.trendAnalysis,
        ),

      repositoryHighlights:
        normalizeRepositoryHighlights(
          rawSnapshot.repositoryHighlights,
        ),
    },
  };
}

class ReportService {
  async getReports(
    userId: string,
  ): Promise<ListReportsResponse> {
    const { data } =
      await api.get<ListReportsResponse>(
        `/users/${userId}/reports`,
      );

    return data;
  }

  async generateReport(
    payload: GenerateReportPayload,
  ): Promise<GenerateReportResponse> {
    const { data } =
      await api.post<GenerateReportResponse>(
        "/reports/generate",
        payload,
      );

    return data;
  }

  async getReport(
    userId: string,
    reportId: string,
  ): Promise<NormalizedExecutiveReport> {
    const { data } =
      await api.get<GetReportResponse>(
        `/users/${userId}/reports/${reportId}`,
      );

    return normalizeReport(
      data.report,
    );
  }

  async getReportStatus(
    userId: string,
    reportId: string,
  ): Promise<ReportStatusResponse> {
    const { data } =
      await api.get<ReportStatusResponse>(
        `/users/${userId}/reports/${reportId}/status`,
      );

    return data;
  }

  async deleteReport(
    userId: string,
    reportId: string,
  ): Promise<DeleteReportResponse> {
    const { data } =
      await api.delete<DeleteReportResponse>(
        `/users/${userId}/reports/${reportId}`,
      );

    return data;
  }

  async downloadPdf(
    userId: string,
    reportId: string,
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(
      `/users/${userId}/reports/${reportId}/download/pdf`,
      {
        responseType: "blob",
      },
    );

    return data;
  }

  async downloadCsv(
    userId: string,
    reportId: string,
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(
      `/users/${userId}/reports/${reportId}/download/csv`,
      {
        responseType: "blob",
      },
    );

    return data;
  }
}

export const reportService =
  new ReportService();