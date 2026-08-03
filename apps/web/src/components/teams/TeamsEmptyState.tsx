import {
  Plus,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamsEmptyStateProps {
  onCreateTeam: () => void;
}

export function TeamsEmptyState({
  onCreateTeam,
}: TeamsEmptyStateProps) {
  return (
    <Card className="flex min-h-[420px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/50">
          <UsersRound className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-6 text-xl font-semibold">
          No Teams Yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create your first Team Workspace to collaborate across repositories.
        </p>

        <Button
          className="mt-6"
          onClick={onCreateTeam}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>
    </Card>
  );
}