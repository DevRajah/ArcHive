"use client";

import {
  Download,
  Eye,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TeamReportStatusBadge } from "@/components/teams/reports/TeamReportStatusBadge";

import type {
  TeamReportListItem,
} from "@/types/team.types";

interface TeamReportsTableProps {
  reports: TeamReportListItem[];
  canDeleteReports: boolean;
  downloadingReportId: string | null;
  onView: (
    report: TeamReportListItem,
  ) => void;
  onDownloadPdf: (
    report: TeamReportListItem,
  ) => void;
  onDownloadCsv: (
    report: TeamReportListItem,
  ) => void;
  onDelete: (
    report: TeamReportListItem,
  ) => void;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function TeamReportsTable({
  reports,
  canDeleteReports,
  downloadingReportId,
  onView,
  onDownloadPdf,
  onDownloadCsv,
  onDelete,
}: TeamReportsTableProps) {
  const orderedReports =
    [...reports].sort(
      (first, second) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Team Report History
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          View, download, and manage reports generated for this workspace.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {orderedReports.map((report) => {
          const isDownloading =
            downloadingReportId ===
            report.id;

          const canDownloadPdf =
            report.status === "COMPLETED" &&
            report.hasPdf;

          const canDownloadCsv =
            report.status === "COMPLETED" &&
            report.hasCsv;

          return (
            <div
              key={report.id}
              className="flex flex-col gap-5 rounded-xl border p-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    {report.title}
                  </h3>

                  <TeamReportStatusBadge
                    status={report.status}
                  />
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {report.description ||
                    "No report description was provided."}
                </p>

                {report.error ? (
                  <p className="mt-2 text-sm text-destructive">
                    {report.error}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDate(
                      report.createdAt,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Generated
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDate(
                      report.generatedAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    report.hasPdf
                      ? "secondary"
                      : "outline"
                  }
                >
                  PDF{" "}
                  {report.hasPdf
                    ? "Ready"
                    : "Unavailable"}
                </Badge>

                <Badge
                  variant={
                    report.hasCsv
                      ? "secondary"
                      : "outline"
                  }
                >
                  CSV{" "}
                  {report.hasCsv
                    ? "Ready"
                    : "Unavailable"}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onView(report)
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    !canDownloadPdf ||
                    isDownloading
                  }
                  onClick={() =>
                    onDownloadPdf(report)
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    !canDownloadCsv ||
                    isDownloading
                  }
                  onClick={() =>
                    onDownloadCsv(report)
                  }
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  CSV
                </Button>

                {canDeleteReports ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${report.title}`}
                    onClick={() =>
                      onDelete(report)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}