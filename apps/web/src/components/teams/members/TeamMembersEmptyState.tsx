import {
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TeamMembersEmptyStateProps {
  canManageMembers: boolean;
  onAddMember: () => void;
}

export function TeamMembersEmptyState({
  canManageMembers,
  onAddMember,
}: TeamMembersEmptyStateProps) {
  return (
    <Card className="flex min-h-[360px] items-center justify-center border-dashed">
      <div className="max-w-md px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/40">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          No team members found
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Add ArcHive users to begin collaborating inside this workspace.
        </p>

        {canManageMembers ? (
          <Button
            className="mt-6"
            onClick={onAddMember}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        ) : null}
      </div>
    </Card>
  );
}