import { api } from "@/lib/api";
import {
    AdminAnalyticsDatum,
    AdminAnalyticsResponse,
    AdminActivityAction,
    AdminDashboardResponse,
    AdminQueueResponse,
    AdminRepository,
    AdminSystemResponse,
    AdminUser,
    AdminUserDetails,
    AdminRepositoryDetails,
    AdminActivityResponse,
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

function normalizeAnalyticsGroup(value: unknown): AdminAnalyticsDatum[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (!item || typeof item !== "object") return null;

                const record = item as Record<string, unknown>;

                const name =
                    record.name ||
                    record.label ||
                    record.type ||
                    record.category ||
                    record.key;

                const count =
                    record.value ||
                    record.count ||
                    record.total;

                if (typeof name !== "string") return null;

                const numericValue = Number(count);

                if (!Number.isFinite(numericValue)) return null;

                return {
                    name,
                    value: numericValue,
                };
            })
            .filter((item): item is AdminAnalyticsDatum => Boolean(item));
    }

    if (value && typeof value === "object") {
        return Object.entries(value as Record<string, unknown>)
            .map(([name, count]) => ({
                name,
                value: Number(count),
            }))
            .filter((item) => Number.isFinite(item.value));
    }

    return [];
}

export const adminService = {
    async getDashboard() {
        const response = await api.get("/admin/dashboard");
        return unwrap<AdminDashboardResponse>(response);
    },

    async getUsers(params?: {
        search?: string;
        page?: number;
        limit?: number;
        sort?: string;
    }) {
        const response = await api.get("/admin/users", {
            params,
        });

        return unwrap<{
            users: AdminUser[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
        }>(response);
    },

    async getUser(userId: string): Promise<AdminUserDetails> {
        const response = await api.get(`/admin/users/${userId}`);
        return unwrap<AdminUserDetails>(response);
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

    async getRepository(repositoryId: string): Promise<AdminRepositoryDetails> {
        const response = await api.get(`/admin/repositories/${repositoryId}`);
        return unwrap<AdminRepositoryDetails>(response);
    },

    async reprocessRepository(repositoryId: string) {
        const response = await api.post(`/admin/repositories/${repositoryId}/reprocess`);
        return response.data;
    },

    async deleteRepository(repositoryId: string) {
        const response = await api.delete(`/admin/repositories/${repositoryId}`);
        return response.data;
    },

    async getActivity(): Promise<AdminActivityResponse> {
        const response = await api.get("/admin/activity");
        return unwrap<AdminActivityResponse>(response);
    },

    async getAnalytics(): Promise<AdminAnalyticsResponse> {
        const response = await api.get("/admin/analytics");

        const payload = unwrap<Record<string, unknown>>(response);

        return {
            repositoryTypes: normalizeAnalyticsGroup(payload.repositoryTypes),
            languages: normalizeAnalyticsGroup(payload.languages),
            architectureDomains: normalizeAnalyticsGroup(
                payload.architectureDomains
            ),
            technologies: normalizeAnalyticsGroup(payload.technologies),
            engineeringProfiles: normalizeAnalyticsGroup(
                payload.engineeringProfiles
            ),
        };
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