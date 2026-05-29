import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { ArchitectureChange } from "@/types/architecture.types";

export const architectureService = {
  async getArchitectureChanges(repositoryId: string) {
    const response = await api.get<ApiResponse<ArchitectureChange[]>>(
      `/repositories/${repositoryId}/architecture-changes`
    );

    return response.data.data;
  },
};