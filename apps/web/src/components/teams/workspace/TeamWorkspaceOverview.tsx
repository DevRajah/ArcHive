import {
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { TeamDashboardMetrics } from "@/components/teams/dashboard/TeamDashboardMetrics";
import { TeamDashboardSkeleton } from "@/components/teams/dashboard/TeamDashboardSkeleton";
import { TeamRecommendations } from "@/components/teams/dashboard/TeamRecommendations";
import { TeamRepositoryRankings } from "@/components/teams/dashboard/TeamRepositoryRankings";
import { TeamRiskSummary } from "@/components/teams/dashboard/TeamRiskSummary";
import { TeamTechnologyInventory } from "@/components/teams/dashboard/TeamTechnologyInventory";

import { useTeamDashboard } from "@/hooks/useTeams";

interface TeamWorkspaceOverviewProps {
  teamId: string;
  teamName: string;
}

export function TeamWorkspaceOverview({
  teamId,
  teamName,
}: TeamWorkspaceOverviewProps) {
  const dashboardQuery =
    useTeamDashboard(teamId);

  if (dashboardQuery.isLoading) {
    return (
      <TeamDashboardSkeleton />
    );
  }

  if (
    dashboardQuery.isError ||
    !dashboardQuery.data
  ) {
    return (
      <Card className="flex min-h-[360px] items-center justify-center border-dashed">
        <div className="max-w-md px-6 py-14 text-center">
          <TriangleAlert className="mx-auto h-10 w-10 text-destructive" />

          <h2 className="mt-4 text-xl font-semibold">
            Unable to load Team Intelligence
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            ArcHive could not load this team&apos;s engineering dashboard.
          </p>

          <Button
            variant="outline"
            className="mt-6"
            disabled={
              dashboardQuery.isFetching
            }
            onClick={() =>
              dashboardQuery.refetch()
            }
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                dashboardQuery.isFetching
                  ? "animate-spin"
                  : ""
              }`}
            />

            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const dashboard =
    dashboardQuery.data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          Team Intelligence
        </h2>

        <p className="mt-2 text-muted-foreground">
          Engineering health, technology, risks, and recommendations for {teamName}.
        </p>
      </div>

      <TeamDashboardMetrics
        dashboard={dashboard}
      />

      <TeamRepositoryRankings
        rankings={dashboard.rankings}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TeamTechnologyInventory
          inventory={dashboard.technology}
        />

        <TeamRiskSummary
          risks={dashboard.risks}
        />
      </div>

      <TeamRecommendations
        recommendations={
          dashboard.recommendations
        }
      />
    </div>
  );
}