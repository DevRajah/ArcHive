"use client";

import { useEffect, useState } from "react";

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

import { useReports } from "@/hooks/useReports";

import type { ExecutiveReport } from "@/types/report.types";
import { ReportDetailsDrawer } from "@/components/reports/ReportDetailsDrawer";

import { DeleteReportDialog } from "@/components/reports/DeleteReportDialog";

import { useDeleteReport } from "@/hooks/useReports";

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
    const reportsQuery = useReports();

    const [userId, setUserId] =
        useState("");

    const [selectedReport, setSelectedReport] =
        useState<ExecutiveReport | null>(null);

    const [reportToDelete, setReportToDelete] =
        useState<ExecutiveReport | null>(null);

    const [
        isGenerateDialogOpen,
        setIsGenerateDialogOpen,
    ] = useState(false);

    const [
        downloadingReportId,
        setDownloadingReportId,
    ] = useState<string | null>(null);

    useEffect(() => {
        setUserId(getStoredUserId());
    }, []);

    const deleteReportMutation =
        useDeleteReport();

    const reports =
        reportsQuery.data?.reports ?? [];

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
        report: ExecutiveReport,
    ) {
        setSelectedReport(report);
    }

    async function handleDownloadPdf(
        report: ExecutiveReport,
    ) {
        if (!userId) {
            return;
        }

        try {
            setDownloadingReportId(report.id);

            await reportService.downloadPdf(
                userId,
                report.id,
            );
        } finally {
            setDownloadingReportId(null);
        }
    }

    async function handleDownloadCsv(
        report: ExecutiveReport,
    ) {
        if (!userId) {
            return;
        }

        try {
            setDownloadingReportId(report.id);

            await reportService.downloadCsv(
                userId,
                report.id,
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
                userId,
                reportId: reportToDelete.id,
            });

            setReportToDelete(null);

            toast.success("Report deleted successfully.");
        } catch {
            toast.error("Failed to delete report.");

        }
    }

    function handleDeleteReport(
        report: ExecutiveReport,
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

                                <ReportsTable
                                    reports={reports}
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
                    report={selectedReport}
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