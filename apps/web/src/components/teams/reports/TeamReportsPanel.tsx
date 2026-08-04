"use client";

import {
  useState,
} from "react";

import {
  FilePlus2,
  LockKeyhole,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DeleteTeamReportDialog } from "@/components/teams/reports/DeleteTeamReportDialog";
import { GenerateTeamReportDialog } from "@/components/teams/reports/GenerateTeamReportDialog";
import { TeamReportDetailsDrawer } from "@/components/teams/reports/TeamReportDetailsDrawer";
import { TeamReportsEmptyState } from "@/components/teams/reports/TeamReportsEmptyState";
import { TeamReportsSummaryCards } from "@/components/teams/reports/TeamReportsSummaryCards";
import { TeamReportsTable } from "@/components/teams/reports/TeamReportsTable";

import {
  useTeamReport,
  useTeamReports,
} from "@/hooks/useTeams";

import { teamService } from "@/services/team.service";

import { downloadBlob } from "@/utils/downloadReport";

import type {
  TeamReportListItem,
} from "@/types/team.types";

interface TeamReportsPanelProps {
  teamId: string;
  userId: string;
  canGenerateReports: boolean;
  canDeleteReports: boolean;
}

export function TeamReportsPanel({
  teamId,
  userId,
  canGenerateReports,
  canDeleteReports,
}: TeamReportsPanelProps) {
  const reportsQuery =
    useTeamReports(
      teamId,
      userId,
    );

  const [
    isGenerateOpen,
    setIsGenerateOpen,
  ] = useState(false);

  const [
    selectedReport,
    setSelectedReport,
  ] =
    useState<TeamReportListItem | null>(
      null,
    );

  const [
    reportToDelete,
    setReportToDelete,
  ] =
    useState<TeamReportListItem | null>(
      null,
    );

  const [
    downloadingReportId,
    setDownloadingReportId,
  ] = useState<string | null>(null);

  const selectedReportQuery =
    useTeamReport(
      teamId,
      selectedReport?.id ?? "",
      userId,
    );

  const reports =
    reportsQuery.data?.reports ?? [];

  async function handleDownloadPdf(
    report: TeamReportListItem,
  ) {
    try {
      setDownloadingReportId(
        report.id,
      );

      const blob =
        await teamService.downloadTeamReportPdf(
          teamId,
          report.id,
          userId,
        );

      downloadBlob(
        blob,
        `${report.title
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`,
      );

      toast.success(
        "Team Report PDF downloaded successfully.",
      );
    } catch {
      toast.error(
        "The Team Report PDF could not be downloaded.",
      );
    } finally {
      setDownloadingReportId(null);
    }
  }

  async function handleDownloadCsv(
    report: TeamReportListItem,
  ) {
    try {
      setDownloadingReportId(
        report.id,
      );

      const blob =
        await teamService.downloadTeamReportCsv(
          teamId,
          report.id,
          userId,
        );

      downloadBlob(
        blob,
        `${report.title
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase()}.csv`,
      );

      toast.success(
        "Team Report CSV downloaded successfully.",
      );
    } catch {
      toast.error(
        "The Team Report CSV could not be downloaded.",
      );
    } finally {
      setDownloadingReportId(null);
    }
  }

  if (reportsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-36 rounded-xl"
            />
          ))}
        </div>

        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (
    reportsQuery.isError ||
    !reportsQuery.data
  ) {
    return (
      <Card className="flex min-h-[380px] items-center justify-center border-dashed">
        <div className="max-w-md px-6 py-14 text-center">
          <TriangleAlert className="mx-auto h-10 w-10 text-destructive" />

          <h2 className="mt-4 text-xl font-semibold">
            Unable to load Team Reports
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            ArcHive could not load reports for this workspace.
          </p>

          <Button
            variant="outline"
            className="mt-5"
            disabled={
              reportsQuery.isFetching
            }
            onClick={() =>
              reportsQuery.refetch()
            }
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                reportsQuery.isFetching
                  ? "animate-spin"
                  : ""
              }`}
            />

            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Team Executive Reports
          </h2>

          <p className="mt-2 text-muted-foreground">
            Generate shared engineering reports for this workspace.
          </p>
        </div>

        {canGenerateReports ? (
          <Button
            onClick={() =>
              setIsGenerateOpen(true)
            }
          >
            <FilePlus2 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
            Viewer access
          </div>
        )}
      </div>

      {!reports.length ? (
        <TeamReportsEmptyState
          canGenerateReports={
            canGenerateReports
          }
          onGenerate={() =>
            setIsGenerateOpen(true)
          }
        />
      ) : (
        <>
          <TeamReportsSummaryCards
            reports={reports}
          />

          <TeamReportsTable
            reports={reports}
            canDeleteReports={
              canDeleteReports
            }
            downloadingReportId={
              downloadingReportId
            }
            onView={setSelectedReport}
            onDownloadPdf={
              handleDownloadPdf
            }
            onDownloadCsv={
              handleDownloadCsv
            }
            onDelete={
              setReportToDelete
            }
          />
        </>
      )}

      <GenerateTeamReportDialog
        teamId={teamId}
        actorUserId={userId}
        open={isGenerateOpen}
        onOpenChange={
          setIsGenerateOpen
        }
      />

      <TeamReportDetailsDrawer
        report={
          selectedReportQuery.data ??
          null
        }
        open={Boolean(selectedReport)}
        isLoading={
          selectedReportQuery.isLoading ||
          selectedReportQuery.isFetching
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null);
          }
        }}
      />

      <DeleteTeamReportDialog
        teamId={teamId}
        actorUserId={userId}
        report={reportToDelete}
        open={Boolean(reportToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setReportToDelete(null);
          }
        }}
      />
    </div>
  );
}