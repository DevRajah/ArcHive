import { api } from "@/lib/api";

import type {
    DeleteReportResponse,
    ExecutiveReport,
    ExecutiveReportSnapshot,
    GenerateReportPayload,
    GenerateReportResponse,
    GetReportResponse,
    ReportsResponse,
    ReportStatusResponse,
} from "@/types/report.types";

class ReportService {
    /**
     * Fetch every Executive Report belonging to one user.
     *
     * Backend:
     * GET /api/users/:userId/reports
     *
     * The shared Axios client already includes /api in its base URL,
     * so service paths must not add another /api prefix.
     */
    async getReports(
        userId: string,
    ): Promise<ReportsResponse> {
        const { data } =
            await api.get<ReportsResponse>(
                `/users/${userId}/reports`,
            );

        return data;
    }

    /**
     * Queue a new Executive Report.
     *
     * Backend:
     * POST /api/reports/generate
     */
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

    /**
     * Fetch one completed or in-progress report.
     *
     * The backend stores analytics inside reportData, while the
     * existing frontend drawer reads snapshot. We normalize that
     * here so the UI does not need duplicate backend-specific logic.
     */
    async getReport(
        userId: string,
        reportId: string,
    ): Promise<ExecutiveReport> {
        const { data } =
            await api.get<GetReportResponse>(
                `/users/${userId}/reports/${reportId}`,
            );

        const report = data.report;
        const reportData = report.reportData;

        if (!reportData) {
            return {
                ...report,
                snapshot: null,
                failureReason:
                    report.error ?? null,
            };
        }

        const rawSummary =
            reportData.executiveSummary;

        const executiveSummary =
            Array.isArray(rawSummary)
                ? rawSummary.map(String)
                : typeof rawSummary === "string"
                    ? [rawSummary]
                    : rawSummary &&
                        typeof rawSummary ===
                        "object"
                        ? Object.values(
                            rawSummary,
                        )
                            .filter(
                                (
                                    value,
                                ): value is string =>
                                    typeof value ===
                                    "string",
                            )
                        : [];
        const snapshot =
            reportData as unknown as Record<
                string,
                unknown
            >;

        return {
            ...report,

            failureReason:
                report.error ?? null,

            snapshot: {
                schemaVersion:
                    typeof snapshot.schemaVersion ===
                        "number"
                        ? snapshot.schemaVersion
                        : undefined,

                reportId:
                    typeof snapshot.reportId ===
                        "string"
                        ? snapshot.reportId
                        : report.id,

                title:
                    typeof snapshot.title ===
                        "string"
                        ? snapshot.title
                        : report.title,

                description:
                    typeof snapshot.description ===
                        "string" ||
                        snapshot.description === null
                        ? snapshot.description
                        : report.description,

                generatedAt:
                    typeof snapshot.generatedAt ===
                        "string"
                        ? snapshot.generatedAt
                        : report.generatedAt ??
                        undefined,

                executiveSummary,

                kpis:
                    (snapshot.executiveKpis ??
                        snapshot.kpis ??
                        {}) as ExecutiveReportSnapshot["kpis"],

                riskBreakdown:
                    (snapshot.riskBreakdown ??
                        {}) as ExecutiveReportSnapshot["riskBreakdown"],

                technologyAnalysis:
                    (snapshot.technologyAnalysis ??
                        {}) as ExecutiveReportSnapshot["technologyAnalysis"],

                engineeringTrend:
                    (snapshot.trendAnalysis ??
                        snapshot.engineeringTrend ??
                        {}) as ExecutiveReportSnapshot["engineeringTrend"],

                repositoryHighlights:
                    (snapshot.repositoryHighlights ??
                        {}) as ExecutiveReportSnapshot["repositoryHighlights"],

                organization:
                    snapshot.organization &&
                        typeof snapshot.organization ===
                        "object"
                        ? (snapshot.organization as Record<
                            string,
                            unknown
                        >)
                        : undefined,
            },
        };
    }

    /**
     * Fetch only the current generation state of one report.
     */
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

    /**
     * Delete a report and its generated files.
     */
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

    /**
     * Download a completed report as PDF.
     */
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

    /**
     * Download a completed report as CSV.
     */
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