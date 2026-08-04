"use client";

import {
  useState,
} from "react";

import {
  FilePlus2,
  LockKeyhole,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { GenerateTeamReportDialog } from "@/components/teams/reports/GenerateTeamReportDialog";
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
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (
    reportsQuery.isError ||
    !reportsQuery.data
  ) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <h2 className="text-xl font-semibold">
          Unable to load Team Reports
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          ArcHive could not load reports for this workspace.
        </p>

        <Button
          variant="outline"
          className="mt-5"
          onClick={() =>
            reportsQuery.refetch()
          }
        >
          Retry
        </Button>
      </div>
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
            onDelete={(report) => {
              toast.warning(
                `Delete confirmation for "${report.title}" will be connected in the next Team Reports batch.`,
              );
            }}
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

      {selectedReportQuery.data ? (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                {selectedReportQuery.data.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Team Report detail loaded successfully. The Schema v3
                analytics drawer will be connected next.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setSelectedReport(null)
              }
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}