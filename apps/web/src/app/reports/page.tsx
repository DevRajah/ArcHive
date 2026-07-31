"use client";

import { useState } from "react";

import {
  FileBarChart2,
  Plus,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsErrorState } from "@/components/reports/ReportsErrorState";
import { ReportsPageSkeleton } from "@/components/reports/ReportsPageSkeleton";
import { ReportsSummaryCards } from "@/components/reports/ReportsSummaryCards";
import { ReportsTable } from "@/components/reports/ReportsTable";

import { Button } from "@/components/ui/button";

import { useReports } from "@/hooks/useReports";

import type { ExecutiveReport } from "@/types/report.types";

export default function ReportsPage() {
  const reportsQuery = useReports();

  const [selectedReport, setSelectedReport] =
    useState<ExecutiveReport | null>(null);

  const [reportToDelete, setReportToDelete] =
    useState<ExecutiveReport | null>(null);

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] =
    useState(false);

  const [downloadingReportId, setDownloadingReportId] =
    useState<string | null>(null);

  const reports =
    reportsQuery.data?.reports ?? [];

  function handleGenerateReport() {
    setIsGenerateDialogOpen(true);
  }

  function handleViewReport(report: ExecutiveReport) {
    setSelectedReport(report);
  }

  async function handleDownloadPdf(
    report: ExecutiveReport,
  ) {
    setDownloadingReportId(report.id);

    /*
     * The download request and toast will be connected
     * when we complete the report actions batch.
     */
    setDownloadingReportId(null);
  }

  async function handleDownloadCsv(
    report: ExecutiveReport,
  ) {
    setDownloadingReportId(report.id);

    /*
     * The download request and toast will be connected
     * when we complete the report actions batch.
     */
    setDownloadingReportId(null);
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
            isRetrying={reportsQuery.isFetching}
            onRetry={() => reportsQuery.refetch()}
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
                    Generate professional engineering reports
                    for leadership.
                  </p>
                </div>
              </div>

              <Button
                className="w-full sm:w-auto"
                onClick={handleGenerateReport}
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </header>

            {reports.length === 0 ? (
              <ReportsEmptyState
                onGenerate={handleGenerateReport}
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
                  onView={handleViewReport}
                  onDownloadPdf={handleDownloadPdf}
                  onDownloadCsv={handleDownloadCsv}
                  onDelete={handleDeleteReport}
                />
              </>
            )}
          </>
        )}

        {/*
          Batch 3 will mount GenerateReportDialog here.

          <GenerateReportDialog
            open={isGenerateDialogOpen}
            onOpenChange={setIsGenerateDialogOpen}
          />
        */}

        {/*
          Later batches will mount:

          <ReportDetailsDrawer
            report={selectedReport}
            open={Boolean(selectedReport)}
            onOpenChange={(open) => {
              if (!open) setSelectedReport(null);
            }}
          />

          <DeleteReportDialog
            report={reportToDelete}
            open={Boolean(reportToDelete)}
            onOpenChange={(open) => {
              if (!open) setReportToDelete(null);
            }}
          />
        */}

        <span className="hidden">
          {String(isGenerateDialogOpen)}
          {selectedReport?.id}
          {reportToDelete?.id}
        </span>
      </main>
    </AppShell>
  );
}