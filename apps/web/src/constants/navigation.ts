import {
  LayoutDashboard,
  FolderGit2,
  Settings,
  Activity,
  BriefcaseBusiness,
  GitCompareArrows,
  Radar,
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
    label: "Portfolio",
    href: "/portfolio",
    icon: BriefcaseBusiness,
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
  }
];