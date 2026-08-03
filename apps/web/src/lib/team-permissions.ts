import type {
  TeamMemberRole,
} from "@/types/team.types";

export interface TeamPermissions {
  canViewWorkspace: boolean;
  canManageMembers: boolean;
  canManageRepositories: boolean;
  canGenerateReports: boolean;
  canDeleteReports: boolean;
  canManageSettings: boolean;
  canDeleteTeam: boolean;
}

export function getTeamPermissions(
  role: TeamMemberRole,
): TeamPermissions {
  switch (role) {
    case "OWNER":
      return {
        canViewWorkspace: true,
        canManageMembers: true,
        canManageRepositories: true,
        canGenerateReports: true,
        canDeleteReports: true,
        canManageSettings: true,
        canDeleteTeam: true,
      };

    case "ADMIN":
      return {
        canViewWorkspace: true,
        canManageMembers: true,
        canManageRepositories: true,
        canGenerateReports: true,
        canDeleteReports: true,
        canManageSettings: true,
        canDeleteTeam: false,
      };

    case "MEMBER":
      return {
        canViewWorkspace: true,
        canManageMembers: false,
        canManageRepositories: false,
        canGenerateReports: true,
        canDeleteReports: false,
        canManageSettings: false,
        canDeleteTeam: false,
      };

    case "VIEWER":
    default:
      return {
        canViewWorkspace: true,
        canManageMembers: false,
        canManageRepositories: false,
        canGenerateReports: false,
        canDeleteReports: false,
        canManageSettings: false,
        canDeleteTeam: false,
      };
  }
}