"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FileBarChart2,
    Plus,
} from "lucide-react";

import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";

import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsErrorState } from "@/components/reports/ReportsErrorState";
import { ReportsPageSkeleton } from "@/components/reports/ReportsPageSkeleton";
import { ReportsSummaryCards } from "@/components/reports/ReportsSummaryCards";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { reportService } from "@/services/report.service";
import { Button } from "@/components/ui/button";

import {
    useDeleteReport,
    useReport,
    useReports,
} from "@/hooks/useReports";
import type {
    ReportListItem,
} from "@/types/report.types";


import { ReportDetailsDrawer } from "@/components/reports/ReportDetailsDrawer";

import { DeleteReportDialog } from "@/components/reports/DeleteReportDialog";


import {
    ReportsToolbar,
    type ReportSortOption,
    type ReportStatusFilter,
} from "@/components/reports/ReportsToolbar";

import { ReportsPagination } from "@/components/reports/ReportsPagination";
import { downloadBlob } from "@/utils/downloadReport";

interface ArcHiveSession {
    userId?: string;
    username?: string;
    avatarUrl?: string;
    token?: string;
}

function getStoredUserId() {
    if (typeof window === "undefined") {
        return "";
    }

    const storedSession =
        window.localStorage.getItem(
            "archive_session",
        );

    if (!storedSession) {
        return "";
    }

    try {
        const session =
            JSON.parse(
                storedSession,
            ) as ArcHiveSession;

        return session.userId ?? "";
    } catch {
        return "";
    }
}

export default function ReportsPage() {
    //const reportsQuery = useReports();

    const [userId, setUserId] =
        useState("");
    const reportsQuery =
        useReports(userId);

    const deleteReportMutation =
        useDeleteReport(userId);
    const [selectedReport, setSelectedReport] =
        useState<ReportListItem | null>(null);

    const selectedReportQuery = useReport(
        userId,
        selectedReport?.id ?? "",
    );
    const [reportToDelete, setReportToDelete] =
        useState<ReportListItem | null>(null);

    const [
        isGenerateDialogOpen,
        setIsGenerateDialogOpen,
    ] = useState(false);

    const [
        downloadingReportId,
        setDownloadingReportId,
    ] = useState<string | null>(null);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<ReportStatusFilter>("ALL");

    const [sortOption, setSortOption] =
        useState<ReportSortOption>("NEWEST");

    const [page, setPage] =
        useState(1);

    const pageSize = 8;



    useEffect(() => {
        setUserId(getStoredUserId());
    }, []);

    useEffect(() => {
        setPage(1);
    }, [
        search,
        statusFilter,
        sortOption,
    ]);
    const reports: ReportListItem[] =
        reportsQuery.data?.reports ?? [];

    const filteredReports: ReportListItem[] =
        useMemo(() => {
            const normalisedSearch =
                search.trim().toLowerCase();

            const matchingReports =
                reports.filter(
                    (report: ReportListItem) => {
                        const matchesSearch =
                            normalisedSearch.length === 0 ||
                            report.title
                                .toLowerCase()
                                .includes(normalisedSearch) ||
                            Boolean(
                                report.description
                                    ?.toLowerCase()
                                    .includes(
                                        normalisedSearch,
                                    ),
                            );

                        const matchesStatus =
                            statusFilter === "ALL" ||
                            report.status ===
                            statusFilter;

                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    },
                );

            return [...matchingReports].sort(
                (
                    firstReport: ReportListItem,
                    secondReport: ReportListItem,
                ) => {
                    switch (sortOption) {
                        case "OLDEST":
                            return (
                                new Date(
                                    firstReport.createdAt,
                                ).getTime() -
                                new Date(
                                    secondReport.createdAt,
                                ).getTime()
                            );

                        case "TITLE_ASC":
                            return firstReport.title.localeCompare(
                                secondReport.title,
                            );

                        case "TITLE_DESC":
                            return secondReport.title.localeCompare(
                                firstReport.title,
                            );

                        case "NEWEST":
                        default:
                            return (
                                new Date(
                                    secondReport.createdAt,
                                ).getTime() -
                                new Date(
                                    firstReport.createdAt,
                                ).getTime()
                            );
                    }
                },
            );
        }, [
            reports,
            search,
            statusFilter,
            sortOption,
        ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredReports.length / pageSize,
        ),
    );

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedReports = useMemo(() => {
        const startIndex =
            (page - 1) * pageSize;

        return filteredReports.slice(
            startIndex,
            startIndex + pageSize,
        );
    }, [
        filteredReports,
        page,
        pageSize,
    ]);


    function handleGenerateReport() {
        if (!userId) {
            toast.error(
                "Your ArcHive session could not be found. Please reconnect your account.",
                {
                    duration: 5000,
                },
            );

            return;
        }

        setIsGenerateDialogOpen(true);
    }

    function handleViewReport(
        report: ReportListItem,
    ) {
        setSelectedReport(report);
    }

    async function handleDownloadPdf(
        report: ReportListItem,
    ) {
        if (!userId) {
            toast.error(
                "Your ArcHive session could not be found.",
            );

            return;
        }

        try {
            setDownloadingReportId(
                report.id,
            );

            const blob =
                await reportService.downloadPdf(
                    userId,
                    report.id,
                );

            downloadBlob(
                blob,
                `${report.title
                    .trim()
                    .replaceAll(/\s+/g, "-")
                    .toLowerCase()}.pdf`,
            );

            toast.success(
                "PDF downloaded successfully.",
            );
        } catch {
            toast.error(
                "The PDF could not be downloaded. It may still be generating.",
            );
        } finally {
            setDownloadingReportId(null);
        }
    }

    async function handleDownloadCsv(
        report: ReportListItem,
    ) {
        if (!userId) {
            toast.error(
                "Your ArcHive session could not be found.",
            );

            return;
        }

        try {
            setDownloadingReportId(
                report.id,
            );

            const blob =
                await reportService.downloadCsv(
                    userId,
                    report.id,
                );

            downloadBlob(
                blob,
                `${report.title
                    .trim()
                    .replaceAll(/\s+/g, "-")
                    .toLowerCase()}.csv`,
            );

            toast.success(
                "CSV downloaded successfully.",
            );
        } catch {
            toast.error(
                "The CSV could not be downloaded. It may still be generating.",
            );
        } finally {
            setDownloadingReportId(null);
        }
    }

    async function confirmDeleteReport() {
        if (!reportToDelete) {
            return;
        }

        if (!userId) {
            return;
        }

        try {
            await deleteReportMutation.mutateAsync({
                reportId: reportToDelete.id,
            });

            setReportToDelete(null);

            toast.success("Report deleted successfully.");
        } catch {
            toast.error("Failed to delete report.");

        }
    }

    function handleDeleteReport(
        report: ReportListItem,
    ) {
        setReportToDelete(report);
    }

    return (
        <AppShell>
            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                {reportsQuery.isLoading ? (
                    <ReportsPageSkeleton />
                ) : reportsQuery.isError ? (
                    <ReportsErrorState
                        isRetrying={
                            reportsQuery.isFetching
                        }
                        onRetry={() =>
                            reportsQuery.refetch()
                        }
                    />
                ) : (
                    <>
                        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 hidden rounded-xl border bg-muted/40 p-2.5 sm:block">
                                    <FileBarChart2 className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        Executive Reports
                                    </h1>

                                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                        Generate professional
                                        engineering reports
                                        for leadership.
                                    </p>
                                </div>
                            </div>

                            <Button
                                className="w-full sm:w-auto"
                                onClick={
                                    handleGenerateReport
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </header>

                        {reports.length === 0 ? (
                            <ReportsEmptyState
                                onGenerate={
                                    handleGenerateReport
                                }
                            />
                        ) : (
                            <>
                                <ReportsSummaryCards
                                    reports={reports}
                                />

                                <ReportsToolbar
                                    search={search}
                                    status={statusFilter}
                                    sort={sortOption}
                                    resultCount={
                                        filteredReports.length
                                    }
                                    onSearchChange={setSearch}
                                    onStatusChange={
                                        setStatusFilter
                                    }
                                    onSortChange={
                                        setSortOption
                                    }
                                    onReset={() => {
                                        setSearch("");
                                        setStatusFilter("ALL");
                                        setSortOption("NEWEST");
                                        setPage(1);
                                    }}
                                />

                                {filteredReports.length === 0 ? (
                                    <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                                        <h3 className="text-lg font-semibold">
                                            No matching reports
                                        </h3>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Try changing your search term
                                            or status filter.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-5"
                                            onClick={() => {
                                                setSearch("");
                                                setStatusFilter("ALL");
                                                setSortOption("NEWEST");
                                            }}
                                        >
                                            Clear filters
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ReportsTable
                                            reports={
                                                paginatedReports
                                            }
                                            downloadingReportId={
                                                downloadingReportId
                                            }
                                            onView={
                                                handleViewReport
                                            }
                                            onDownloadPdf={
                                                handleDownloadPdf
                                            }
                                            onDownloadCsv={
                                                handleDownloadCsv
                                            }
                                            onDelete={
                                                handleDeleteReport
                                            }
                                        />

                                        <ReportsPagination
                                            page={page}
                                            totalPages={totalPages}
                                            totalItems={
                                                filteredReports.length
                                            }
                                            pageSize={pageSize}
                                            onPageChange={(nextPage) => {
                                                setPage(nextPage);

                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth",
                                                });
                                            }}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                <GenerateReportDialog
                    userId={userId}
                    open={isGenerateDialogOpen}
                    onOpenChange={
                        setIsGenerateDialogOpen
                    }
                    onSuccess={() => {
                        toast.success(
                            "Executive Report generation started successfully.",
                            {
                                duration: 5000,
                            },
                        );
                    }}
                    onError={(message) => {
                        toast.error(message, {
                            duration: 5000,
                        });
                    }}
                />

                <ReportDetailsDrawer
                    report={selectedReportQuery.data ?? null}
                    open={Boolean(selectedReport)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedReport(null);
                        }
                    }}
                />

                <DeleteReportDialog
                    report={reportToDelete}
                    open={Boolean(reportToDelete)}
                    loading={deleteReportMutation.isPending}
                    onConfirm={confirmDeleteReport}
                    onOpenChange={(open) => {
                        if (!open) {
                            setReportToDelete(null);
                        }
                    }}
                />

                <span className="hidden">
                    {selectedReport?.id}
                    {reportToDelete?.id}
                </span>
            </main>
        </AppShell>
    );
}