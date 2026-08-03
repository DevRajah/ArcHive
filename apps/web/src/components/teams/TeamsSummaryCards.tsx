import {
  Crown,
  FolderGit2,
  Users,
  Workflow,
} from "lucide-react";

import { TeamStatsCard } from "@/components/teams/TeamStatsCard";

import type {
  TeamSummary,
} from "@/types/team.types";

interface TeamsSummaryCardsProps {
  teams: TeamSummary[];
}

export function TeamsSummaryCards({
  teams,
}: TeamsSummaryCardsProps) {
  const ownedTeams = teams.filter(
    (team) =>
      team.role === "OWNER",
  ).length;

  const totalMembers =
    teams.reduce(
      (total, team) =>
        total + team.memberCount,
      0,
    );

  const totalRepositories =
    teams.reduce(
      (total, team) =>
        total +
        team.repositoryCount,
      0,
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <TeamStatsCard
        title="Total Teams"
        value={teams.length}
        description="Shared workspaces you currently belong to."
        icon={Workflow}
      />

      <TeamStatsCard
        title="Owned Teams"
        value={ownedTeams}
        description="Workspaces where you have full owner control."
        icon={Crown}
      />

      <TeamStatsCard
        title="Shared Repositories"
        value={totalRepositories}
        description="Repository connections across your teams."
        icon={FolderGit2}
      />

      <TeamStatsCard
        title="Team Memberships"
        value={totalMembers}
        description="Combined members across available workspaces."
        icon={Users}
      />
    </div>
  );
}