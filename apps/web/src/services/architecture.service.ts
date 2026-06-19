import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { ArchitectureChange } from "@/types/architecture.types";
import { ArchitectureEvolutionResponse } from "@/types/architecture-evolution.types";

export const architectureService = {
  async getRepositoryArchitecture(
    repositoryId: string
  ): Promise<ArchitectureChange[]> {
    const response = await api.get<ApiResponse<ArchitectureChange[]>>(
      `/repositories/${repositoryId}/architecture`
    );

    return response.data.data;
  },

  async getRepositoryArchitectureEvolution(
    repositoryId: string
  ): Promise<ArchitectureEvolutionResponse> {
    const response = await api.get<ApiResponse<ArchitectureEvolutionResponse>>(
      `/repositories/${repositoryId}/architecture-evolution`
    );

    return response.data.data;
  },

   async getRepositoryArchitectureRadar(repositoryId: string) {
    const response = await api.get(
      `/repositories/${repositoryId}/architecture-radar`
    );

    return response.data.data;
  },
};