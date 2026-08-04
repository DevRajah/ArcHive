import {
  Activity,
  BriefcaseBusiness,
  FileBarChart2,
  FolderGit2,
  GitCompareArrows,
  LayoutDashboard,
  Radar,
  Settings,
  UsersRound,
} from "lucide-react";

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Repositories",
    href: "/repositories",
    icon: FolderGit2,
  },
  {
    label: "Teams",
    href: "/teams",
    icon: UsersRound,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: BriefcaseBusiness,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileBarChart2,
  },
  {
    label: "Compare",
    href: "/compare",
    icon: GitCompareArrows,
  },
  {
    label: "Intelligence Diff",
    href: "/intelligence-diff",
    icon: Radar,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];