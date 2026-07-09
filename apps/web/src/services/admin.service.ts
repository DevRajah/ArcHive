import { api } from "@/lib/api";
import {
  AdminDashboardResponse,
  AdminQueueResponse,
  AdminRepository,
  AdminSystemResponse,
  AdminUser,
} from "@/types/admin.types";

function unwrap<T>(response: { data: T | { data?: T } }): T {
  const payload = response.data;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

export const adminService = {
  async getDashboard() {
    const response = await api.get("/admin/dashboard");
    return unwrap<AdminDashboardResponse>(response);
  },

  async getUsers(params?: { search?: string; page?: number }) {
    const response = await api.get("/admin/users", { params });
    return unwrap<{ users: AdminUser[]; total?: number; page?: number }>(response);
  },

  async getUser(userId: string) {
    const response = await api.get(`/admin/users/${userId}`);
    return unwrap(response);
  },

  async getRepositories(params?: {
    search?: string;
    language?: string;
    tracked?: string;
    page?: number;
  }) {
    const response = await api.get("/admin/repositories", { params });
    return unwrap<{ repositories: AdminRepository[]; total?: number; page?: number }>(response);
  },

  async getRepository(repositoryId: string) {
    const response = await api.get(`/admin/repositories/${repositoryId}`);
    return unwrap(response);
  },

  async reprocessRepository(repositoryId: string) {
    const response = await api.post(`/admin/repositories/${repositoryId}/reprocess`);
    return response.data;
  },

  async deleteRepository(repositoryId: string) {
    const response = await api.delete(`/admin/repositories/${repositoryId}`);
    return response.data;
  },

  async getActivity() {
    const response = await api.get("/admin/activity");
    return unwrap(response);
  },

  async getAnalytics() {
    const response = await api.get("/admin/analytics");
    return unwrap(response);
  },

  async getQueue() {
    const response = await api.get("/admin/queue");
    return unwrap<AdminQueueResponse>(response);
  },

  async getSystem() {
    const response = await api.get("/admin/system");
    return unwrap<AdminSystemResponse>(response);
  },
};