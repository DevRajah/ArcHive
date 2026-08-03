export enum RepositoryScopeType {
  USER = "USER",
  TEAM = "TEAM",
}

export interface RepositoryScope {
  type: RepositoryScopeType;

  /**
   * Required when the scope is USER.
   */
  userId?: string;

  /**
   * Required when the scope is TEAM.
   */
  teamId?: string;
}