import {
  FileText,
  FolderGit2,
  Settings,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type {
  TeamWorkspaceTab,
} from "@/types/team-workspace.types";

interface TeamWorkspacePlaceholderProps {
  tab: Exclude<
    TeamWorkspaceTab,
    "overview"
  >;
}

const placeholderConfig = {
  repositories: {
    title: "Team Repositories",
    description:
      "Attach, review, and manage repositories shared with this workspace.",
    icon: FolderGit2,
  },

  members: {
    title: "Team Members",
    description:
      "Invite members, assign roles, and manage workspace access.",
    icon: Users,
  },

  reports: {
    title: "Team Executive Reports",
    description:
      "Generate and manage leadership-ready reports for this workspace.",
    icon: FileText,
  },

  settings: {
    title: "Workspace Settings",
    description:
      "Manage workspace configuration and owner-level actions.",
    icon: Settings,
  },
};

export function TeamWorkspacePlaceholder({
  tab,
}: TeamWorkspacePlaceholderProps) {
  const config =
    placeholderConfig[tab];

  const Icon = config.icon;

  return (
    <Card className="flex min-h-[380px] items-center justify-center border-dashed">
      <div className="max-w-lg px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/40">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          {config.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {config.description}
        </p>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Coming in the next workspace batch
        </p>
      </div>
    </Card>
  );
}