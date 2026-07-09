import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const ADMIN_QUERY_KEYS = {
  dashboard: ["admin", "dashboard"],
  users: (params?: unknown) => ["admin", "users", params],
  user: (userId: string) => ["admin", "users", userId],
  repositories: (params?: unknown) => ["admin", "repositories", params],
  repository: (repositoryId: string) => ["admin", "repositories", repositoryId],
  activity: ["admin", "activity"],
  analytics: ["admin", "analytics"],
  queue: ["admin", "queue"],
  system: ["admin", "system"],
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard,
    queryFn: adminService.getDashboard,
  });
}

export function useAdminUsers(params?: { search?: string; page?: number }) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(params),
    queryFn: () => adminService.getUsers(params),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.user(userId),
    queryFn: () => adminService.getUser(userId),
    enabled: Boolean(userId),
  });
}

export function useAdminRepositories(params?: {
  search?: string;
  language?: string;
  tracked?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.repositories(params),
    queryFn: () => adminService.getRepositories(params),
  });
}

export function useAdminRepository(repositoryId: string) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.repository(repositoryId),
    queryFn: () => adminService.getRepository(repositoryId),
    enabled: Boolean(repositoryId),
  });
}

export function useAdminReprocessRepository(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminService.reprocessRepository(repositoryId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.repository(repositoryId) }),
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.repositories() }),
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.dashboard }),
      ]);
    },
  });
}

export function useAdminDeleteRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repositoryId: string) => adminService.deleteRepository(repositoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.repositories() });
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.activity,
    queryFn: adminService.getActivity,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.analytics,
    queryFn: adminService.getAnalytics,
  });
}

export function useAdminQueue() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.queue,
    queryFn: adminService.getQueue,
  });
}

export function useAdminSystem() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.system,
    queryFn: adminService.getSystem,
  });
}