import {
  Plus,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface TeamsHeaderProps {
  onCreateTeam: () => void;
}

export function TeamsHeader({
  onCreateTeam,
}: TeamsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-1 hidden rounded-xl border bg-muted/40 p-2.5 sm:block">
          <UsersRound className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teams
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create and manage shared engineering intelligence workspaces.
          </p>
        </div>
      </div>

      <Button onClick={onCreateTeam}>
        <Plus className="mr-2 h-4 w-4" />
        Create Team
      </Button>
    </header>
  );
}