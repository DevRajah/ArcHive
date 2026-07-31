"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { reportService } from "@/services/report.service";

import type {
  GenerateReportPayload,
  ListReportsResponse,
} from "@/types/report.types";

const REPORT_QUERY_KEYS = {
  all: (userId: string) =>
    ["reports", userId] as const,

  detail: (
    userId: string,
    reportId: string,
  ) =>
    [
      "reports",
      userId,
      reportId,
    ] as const,

  status: (
    userId: string,
    reportId: string,
  ) =>
    [
      "reports",
      userId,
      reportId,
      "status",
    ] as const,
};

/**
 * Fetch the current user's report history.
 *
 * Poll every five seconds only while at least one report is
 * QUEUED or GENERATING.
 */
export function useReports(
  userId: string,
) {
  return useQuery<ListReportsResponse>({
    queryKey:
      REPORT_QUERY_KEYS.all(userId),

    queryFn: () =>
      reportService.getReports(
        userId,
      ),

    enabled: Boolean(userId),

    refetchInterval: (query) => {
      const reports =
        query.state.data?.reports ??
        [];

      const hasActiveReport =
        reports.some(
          (report) =>
            report.status ===
              "QUEUED" ||
            report.status ===
              "GENERATING",
        );

      return hasActiveReport
        ? 5000
        : false;
    },

    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch one full report, including its stored analytics snapshot.
 */
export function useReport(
  userId: string,
  reportId: string,
) {
  return useQuery({
    queryKey:
      REPORT_QUERY_KEYS.detail(
        userId,
        reportId,
      ),

    queryFn: () =>
      reportService.getReport(
        userId,
        reportId,
      ),

    enabled:
      Boolean(userId) &&
      Boolean(reportId),
  });
}

/**
 * Fetch only the lightweight generation status.
 */
export function useReportStatus(
  userId: string,
  reportId: string,
) {
  return useQuery({
    queryKey:
      REPORT_QUERY_KEYS.status(
        userId,
        reportId,
      ),

    queryFn: () =>
      reportService.getReportStatus(
        userId,
        reportId,
      ),

    enabled:
      Boolean(userId) &&
      Boolean(reportId),

    refetchInterval: (query) => {
      const status =
        query.state.data?.report
          .status;

      return status === "QUEUED" ||
        status === "GENERATING"
        ? 5000
        : false;
    },
  });
}

export function useGenerateReport(
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: GenerateReportPayload,
    ) =>
      reportService.generateReport(
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          REPORT_QUERY_KEYS.all(
            userId,
          ),
      });
    },
  });
}

export function useDeleteReport(
  userId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
    }: {
      reportId: string;
    }) =>
      reportService.deleteReport(
        userId,
        reportId,
      ),

    onSuccess: (
      _response,
      variables,
    ) => {
      queryClient.removeQueries({
        queryKey:
          REPORT_QUERY_KEYS.detail(
            userId,
            variables.reportId,
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          REPORT_QUERY_KEYS.all(
            userId,
          ),
      });
    },
  });
}