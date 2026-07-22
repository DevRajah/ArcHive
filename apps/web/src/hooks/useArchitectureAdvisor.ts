import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { architectureAdvisorService } from "@/services/architecture-advisor.service";

export const architectureAdvisorKeys = {
    all: ["architecture-advisor"] as const,

    assessment: (repositoryId: string) =>
        [
            ...architectureAdvisorKeys.all,
            "assessment",
            repositoryId,
        ] as const,

    history: (repositoryId: string) =>
        [
            ...architectureAdvisorKeys.all,
            "history",
            repositoryId,
        ] as const,
};

export function useArchitectureAdvisor(
    repositoryId: string
) {
    return useQuery({
        queryKey:
            architectureAdvisorKeys.assessment(
                repositoryId
            ),

        queryFn: () =>
            architectureAdvisorService.getAssessment(
                repositoryId
            ),

        enabled: Boolean(repositoryId),

        /*
         * The assessment does not need to refetch every time the
         * browser window receives focus. Users can refresh it using
         * the explicit Refresh Assessment action.
         */
        refetchOnWindowFocus: false,
    });
}

export function useArchitectureAdvisorHistory(
    repositoryId: string
) {
    return useQuery({
        queryKey:
            architectureAdvisorKeys.history(
                repositoryId
            ),

        queryFn: () =>
            architectureAdvisorService.getHistory(
                repositoryId
            ),

        enabled: Boolean(repositoryId),

        refetchOnWindowFocus: false,
    });
}

export function useRefreshArchitectureAdvisor(
    repositoryId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            architectureAdvisorService.refreshAssessment(
                repositoryId
            ),

        onSuccess: async (assessment) => {
            /*
             * Update the visible assessment immediately using the
             * response returned by the refresh endpoint.
             */
            queryClient.setQueryData(
                architectureAdvisorKeys.assessment(
                    repositoryId
                ),
                assessment
            );

            /*
             * Refresh both queries so history receives the newly
             * generated assessment.
             */
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey:
                        architectureAdvisorKeys.assessment(
                            repositoryId
                        ),
                }),

                queryClient.invalidateQueries({
                    queryKey:
                        architectureAdvisorKeys.history(
                            repositoryId
                        ),
                }),
            ]);
        },
    });
}