import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { reportService } from "@/services/report.service";

import type {
  GenerateReportPayload,
  ReportsResponse,
} from "@/types/report.types";

export function useReports() {
  return useQuery<ReportsResponse>({
    queryKey: ["reports"],

    queryFn: () =>
      reportService.getReports(),

    /**
     * Poll every five seconds while
     * there are reports still being generated.
     */
    refetchInterval: (query) => {
      const reports =
        query.state.data?.reports ?? [];

      const shouldPoll =
        reports.some(
          (report) =>
            report.status ===
              "QUEUED" ||
            report.status ===
              "GENERATING",
        );

      return shouldPoll
        ? 5000
        : false;
    },
  });
}

export function useReport(
  reportId: string,
) {
  return useQuery({
    queryKey: ["report", reportId],

    queryFn: () =>
      reportService.getReport(
        reportId,
      ),

    enabled: !!reportId,
  });
}

export function useGenerateReport() {
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
        queryKey: ["reports"],
      });
    },
  });
}

export function useDeleteReport() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reportId,
    }: {
      userId: string;
      reportId: string;
    }) =>
      reportService.deleteReport(
        userId,
        reportId,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reports"],
      });
    },
  });
}