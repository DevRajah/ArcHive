import { TeamRepositoryCard } from "@/components/teams/repositories/TeamRepositoryCard";

import type {
  TeamRepository,
} from "@/types/team.types";

interface TeamRepositoriesGridProps {
  repositories: TeamRepository[];
  canManageRepositories: boolean;
  onRemove: (
    repository: TeamRepository,
  ) => void;
}

export function TeamRepositoriesGrid({
  repositories,
  canManageRepositories,
  onRemove,
}: TeamRepositoriesGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {repositories.map(
        (repository) => (
          <TeamRepositoryCard
            key={repository.id}
            repository={repository}
            canManageRepositories={
              canManageRepositories
            }
            onRemove={onRemove}
          />
        ),
      )}
    </div>
  );
}