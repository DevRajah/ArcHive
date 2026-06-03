import {
  LayoutDashboard,
  FolderGit2,
  Settings,
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
    label: "Settings",
    href: "/settings",
    icon: Settings,
  }
];