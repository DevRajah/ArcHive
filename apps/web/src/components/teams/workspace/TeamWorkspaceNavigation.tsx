"use client";

import {
  BarChart3,
  FileText,
  FolderGit2,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
  TeamWorkspaceTab,
} from "@/types/team-workspace.types";

interface TeamWorkspaceNavigationProps {
  activeTab: TeamWorkspaceTab;
  canViewSettings: boolean;
  onTabChange: (
    tab: TeamWorkspaceTab,
  ) => void;
}

const navigationItems = [
  {
    value: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    value: "repositories",
    label: "Repositories",
    icon: FolderGit2,
  },
  {
    value: "members",
    label: "Members",
    icon: Users,
  },
  {
    value: "reports",
    label: "Reports",
    icon: FileText,
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings,
  },
] satisfies Array<{
  value: TeamWorkspaceTab;
  label: string;
  icon: React.ElementType;
}>;

export function TeamWorkspaceNavigation({
  activeTab,
  canViewSettings,
  onTabChange,
}: TeamWorkspaceNavigationProps) {
  const visibleItems =
    navigationItems.filter(
      (item) =>
        item.value !== "settings" ||
        canViewSettings,
    );

  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-2">
      <div className="flex min-w-max gap-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.value;

          return (
            <Button
              key={item.value}
              type="button"
              variant={
                isActive
                  ? "secondary"
                  : "ghost"
              }
              className={
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : ""
              }
              onClick={() =>
                onTabChange(item.value)
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}