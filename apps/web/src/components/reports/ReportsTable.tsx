import {
  Download,
  Eye,
  FileSpreadsheet,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

import type {
  ReportListItem,
} from "@/types/report.types";

interface ReportsTableProps {
  reports: ReportListItem[];
  onView: (report: ReportListItem) => void;
  onDownloadPdf: (report: ReportListItem) => void;
  onDownloadCsv: (report: ReportListItem) => void;
  onDelete: (report: ReportListItem) => void;
  downloadingReportId?: string | null;
}

function formatReportDate(report: ReportListItem) {
  const value =
    report.generatedAt ||
    report.createdAt;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ReportsTable({
  reports,
  onView,
  onDownloadPdf,
  onDownloadCsv,
  onDelete,
  downloadingReportId,
}: ReportsTableProps) {
  const orderedReports = [...reports].sort(
    (firstReport, secondReport) =>
      new Date(secondReport.createdAt).getTime() -
      new Date(firstReport.createdAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report History</CardTitle>

        <CardDescription>
          View, download and manage previously generated
          Executive Reports.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">
                  Title
                </TableHead>

                <TableHead>
                  Generated date
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orderedReports.map((report) => {
                const canDownload =
                  report.status === "COMPLETED";

                const isDownloading =
                  downloadingReportId === report.id;

                return (
                  <TableRow key={report.id}>
                    <TableCell className="max-w-[320px] pl-6">
                      <div>
                        <p className="truncate font-medium">
                          {report.title}
                        </p>

                        {report.description && (
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatReportDate(report)}
                    </TableCell>

                    <TableCell>
                      <ReportStatusBadge
                        status={report.status}
                      />
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="hidden justify-end gap-2 lg:flex">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !canDownload ||
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
                          variant="outline"
                          size="sm"
                          disabled={
                            !canDownload ||
                            isDownloading
                          }
                          onClick={() =>
                            onDownloadCsv(report)
                          }
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          CSV
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${report.title}`}
                          onClick={() => onDelete(report)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="lg:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${report.title}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onView(report)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View report
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              disabled={!canDownload}
                              onClick={() =>
                                onDownloadPdf(report)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              disabled={!canDownload}
                              onClick={() =>
                                onDownloadCsv(report)
                              }
                            >
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Download CSV
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(report)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}