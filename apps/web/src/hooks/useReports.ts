import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { reportService } from "@/services/report.service";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      reportService.getReports(),
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
  return useMutation({
    mutationFn: () =>
      reportService.generateReport(),
  });
}