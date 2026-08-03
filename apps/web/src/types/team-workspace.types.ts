export type TeamWorkspaceTab =
  | "overview"
  | "repositories"
  | "members"
  | "reports"
  | "settings";

export interface TeamWorkspaceNavigationItem {
  value: TeamWorkspaceTab;
  label: string;
  description: string;
}