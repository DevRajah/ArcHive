import { TeamCard } from "@/components/teams/TeamCard";

import type {
  TeamSummary,
} from "@/types/team.types";

interface TeamGridProps {
  teams: TeamSummary[];
}

export function TeamGrid({
  teams,
}: TeamGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
        />
      ))}
    </div>
  );
}