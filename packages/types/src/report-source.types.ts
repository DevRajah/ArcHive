/**
 * Identifies the entity an Executive Report belongs to.
 *
 * Future me:
 * This contract is shared by the API, queue infrastructure, and potentially
 * other ArcHive applications. Keep it in @archive/types rather than inside
 * any individual application.
 */
export enum ReportSourceType {
  USER = "USER",
  TEAM = "TEAM",
}

export interface ReportSource {
  type: ReportSourceType;

  userId?: string;

  teamId?: string;
}