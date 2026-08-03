import {
  Activity,
  BarChart3,
  FileText,
  FolderGit2,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  TeamDetails,
} from "@/types/team.types";

interface TeamWorkspaceOverviewProps {
  team: TeamDetails;
}

interface OverviewCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}

function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
}: OverviewCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight">
              {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/40 p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamWorkspaceOverview({
  team,
}: TeamWorkspaceOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Workspace Overview
        </h2>

        <p className="mt-2 text-muted-foreground">
          Shared engineering intelligence for {team.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          title="Team Members"
          value={team.memberCount}
          description="People with access to this workspace."
          icon={Users}
        />

        <OverviewCard
          title="Repositories"
          value={team.repositoryCount}
          description="Repositories attached to this team."
          icon={FolderGit2}
        />

        <OverviewCard
          title="Current Role"
          value={team.currentUserRole}
          description="Your permission level in this workspace."
          icon={ShieldCheck}
        />

        <OverviewCard
          title="Workspace Status"
          value="Active"
          description="This workspace is available for collaboration."
          icon={Activity}
        />
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Intelligence Dashboard
          </CardTitle>
        </CardHeader>

        <CardContent className="py-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-lg font-semibold">
            Dashboard foundation ready
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The next batch will connect repository rankings,
            engineering health, technology inventory, risks, and
            recommendations from the Team Dashboard endpoint.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}