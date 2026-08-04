import {
  FolderGit2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamRepositoriesEmptyStateProps {
  canManageRepositories: boolean;
  onAddRepository: () => void;
}

export function TeamRepositoriesEmptyState({
  canManageRepositories,
  onAddRepository,
}: TeamRepositoriesEmptyStateProps) {
  return (
    <Card className="flex min-h-[380px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/40">
          <FolderGit2 className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          No Team Repositories Yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Attach repositories to build shared engineering intelligence,
          rankings, technology inventory, risks, and recommendations.
        </p>

        {canManageRepositories ? (
          <Button
            className="mt-6"
            onClick={onAddRepository}
          >
            <Plus className="mr-2 h-4 w-4" />
            Attach Repository
          </Button>
        ) : null}
      </div>
    </Card>
  );
}