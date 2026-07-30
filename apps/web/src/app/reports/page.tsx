"use client";

import Link from "next/link";

import {
  FileText,
  Plus,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

import ExecutiveReportHero from "@/components/reports/ExecutiveReportHero";
import ExportActions from "@/components/reports/ExportActions";
import ExecutiveReportPreview from "@/components/reports/ExecutiveReportPreview";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGenerateReport,
  useReports,
} from "@/hooks/useReports";

export default function ReportsPage() {
  const reportsQuery =
    useReports();

  const generateMutation =
    useGenerateReport();

  const reports =
    reportsQuery.data?.reports ??
    [];

  function handleGenerateReport() {
    generateMutation.mutate();
  }

  return (
    <AppShell>
      <div className="space-y-8 p-6">
        <ExecutiveReportHero />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Executive Reports
            </h2>

            <p className="mt-2 text-muted-foreground">
              Generate downloadable
              engineering reports for
              your organization.
            </p>
          </div>

          <Button
            onClick={
              handleGenerateReport
            }
            disabled={
              generateMutation.isPending
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            {generateMutation.isPending
              ? "Generating..."
              : "Generate Report"}
          </Button>
        </div>

        <ExportActions />

        {reportsQuery.isLoading && (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <Skeleton
                  key={item}
                  className="h-64 rounded-xl"
                />
              ),
            )}
          </div>
        )}

        {reportsQuery.isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
            <p className="font-medium text-destructive">
              Failed to load reports.
            </p>
          </div>
        )}

        {!reportsQuery.isLoading &&
          !reports.length && (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />

              <h3 className="mt-4 text-xl font-semibold">
                No reports yet
              </h3>

              <p className="mt-2 text-muted-foreground">
                Generate your first
                executive engineering
                report.
              </p>

              <Button
                className="mt-6"
                onClick={
                  handleGenerateReport
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate First
                Report
              </Button>
            </div>
          )}

        {reports.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {reports.map(
              (report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                >
                  <ExecutiveReportPreview
                    report={report}
                  />
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}