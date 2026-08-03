export enum ReportSourceType {
  USER = "USER",
  TEAM = "TEAM",
}

export interface ReportSource {
  type: ReportSourceType;

  userId?: string;

  teamId?: string;
}