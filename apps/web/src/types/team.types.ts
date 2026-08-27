import type {
  ExecutiveReportSnapshotV3,
  ExecutiveReportSnapshotV4,
  ReportTrendDirection,
  RepositoryHighlight,
} from "@archive/types";

export type TeamMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export type TeamRepositoryAnalysisStatus =
  | "COMPLETED"
  | "PENDING";

export type TeamRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: TeamMemberRole;
  memberCount: number;
  repositoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListTeamsResponse {
  success: true;
  count: number;
  data: TeamSummary[];
}

export interface CreateTeamPayload {
  userId: string;
  name: string;
  description?: string;
}

export interface CreatedTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  role: "OWNER";
  memberCount: number;
  repositoryCount: number;
}

export interface CreateTeamResponse {
  success: true;
  message: string;
  data: CreatedTeam;
}

export interface TeamCreator {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface TeamDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currentUserRole: TeamMemberRole;
  createdBy: TeamCreator;
  memberCount: number;
  repositoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamDetailsResponse {
  success: true;
  data: TeamDetails;
}

export interface DeleteTeamResponse {
  success: true;
  message: string;
}

export interface TeamRepositoryRanking {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  language: string | null;

  analysisStatus: TeamRepositoryAnalysisStatus;

  architectureScore: number | null;
  engineeringQualityScore: number | null;
  productionReadinessScore: number | null;
  capabilityScore: number | null;
  maturityScore: number | null;
  confidenceScore: number | null;

  riskScore: number | null;
  overallScore: number | null;

  recommendationCount: number;
  architectureChangeCount: number;
  engineeringEventCount: number;
}

export interface TeamTechnologyRepositoryReference {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
}

export interface TeamTechnologyItem {
  technology: string;
  repositoryCount: number;
  repositories: TeamTechnologyRepositoryReference[];
}

export interface TeamTechnologyInventory {
  totalTechnologies: number;
  technologies: TeamTechnologyItem[];
}

export interface TeamRepositoryRisk {
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  overallRiskScore: number;
  overallAssessment: string;
  maturityLabel: string;
  riskLevel: TeamRiskLevel;
  generatedAt: string;
}

export interface TeamRiskSummary {
  totalRepositories: number;
  criticalRepositories: number;
  highRiskRepositories: number;
  mediumRiskRepositories: number;
  lowRiskRepositories: number;
  repositories: TeamRepositoryRisk[];
}

export interface TeamRecommendation {
  id: string;
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  recommendationKey: string;
  title: string;
  description: string;
  status: string;
  evidence: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamDashboard {
  team: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };

  members: {
    total: number;
    owners: number;
    admins: number;
    members: number;
    viewers: number;
  };

  repositories: {
    total: number;
    tracked: number;
    untracked: number;
  };

  engineering: {
    averageArchitecture: number;
    averageEngineeringQuality: number;
    averageProductionReadiness: number;
    averageCapability: number;
    averageMaturity: number;
    averageConfidence: number;
    repositoryCoverage: number;
    lastAnalysisAt: string | null;
  };

  rankings: TeamRepositoryRanking[];
  technology: TeamTechnologyInventory;
  risks: TeamRiskSummary;
  recommendations: TeamRecommendation[];
}

export interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface ListTeamMembersResponse {
  success: true;
  count: number;
  data: TeamMember[];
}

export type AddTeamMemberRole =
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface AddTeamMemberPayload {
  actorUserId: string;

  /*
   * The person being added is identified by their GitHub username.
   *
   * The backend handles case-insensitive matching and an optional
   * leading @ character.
   */
  username: string;

  role: AddTeamMemberRole;
}

export interface AddTeamMemberResponse {
  success: true;
  message: string;
  data: TeamMember;
}

export interface UpdateTeamMemberRolePayload {
  actorUserId: string;
  role: AddTeamMemberRole;
}

export interface UpdateTeamMemberRoleResponse {
  success: true;
  message: string;
  data: TeamMember;
}

export interface RemoveTeamMemberResponse {
  success: true;
  message: string;
  memberId: string;
}

export interface TeamRepositoryAddedBy {
  id: string;
  username: string;
}

export interface TeamRepository {
  id: string;
  repositoryId: string;
  name: string;
  owner: string;
  fullName: string;
  description: string | null;
  language: string | null;
  isTracked: boolean;
  addedAt: string;
  addedBy: TeamRepositoryAddedBy;
}

export interface ListTeamRepositoriesResponse {
  success: true;
  count: number;
  data: TeamRepository[];
}

export interface AddTeamRepositoryPayload {
  actorUserId: string;
  repositoryId: string;
}

export interface AddTeamRepositoryResponse {
  success: true;
  message: string;
  data: TeamRepository;
}

export interface RemoveTeamRepositoryResponse {
  success: true;
  message: string;
  repositoryId: string;
}

/*
 * --------------------------------------------------------------------------
 * Team Executive Reports
 * --------------------------------------------------------------------------
 *
 * Future me:
 * Team Executive Reports use the same persisted Executive Report contract
 * as personal USER reports.
 *
 * Do not recreate ExecutiveSummary, ExecutiveKpis, RiskBreakdown,
 * TechnologyAnalysis, EngineeringTrendAnalysis or RepositoryHighlights
 * inside this file.
 *
 * Those contracts are owned by @archive/types so USER reports, TEAM
 * reports and the report worker all compile against one shared schema.
 */

export type TeamReportStatus =
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export interface TeamReportListItem {
  id: string;
  teamId: string | null;

  title: string;
  description: string | null;

  status: TeamReportStatus;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  error: string | null;

  hasPdf: boolean;
  hasCsv: boolean;
}

export interface ListTeamReportsResponse {
  success: true;
  count: number;
  reports: TeamReportListItem[];
}

export interface GenerateTeamReportPayload {
  actorUserId: string;
  title: string;
  description?: string;
}

export interface GenerateTeamReportResponse {
  success: true;
  reportId: string;
  teamId: string;
  status: "QUEUED";
  message: string;
}

/*
 * Compatibility alias retained because TeamReportDetailsDrawer currently
 * imports the old team-specific name.
 *
 * RepositoryHighlight itself is now owned by @archive/types.
 */
export type TeamReportRepositoryHighlight =
  RepositoryHighlight;


/*
 * Compatibility alias retained for existing team-report UI code.
 *
 * The canonical trend-direction contract is owned by @archive/types.
 */
export type TeamReportTrendDirection =
  ReportTrendDirection;

/*
 * Team Executive Reports use the same persisted shared report schemas
 * as USER Executive Reports.
 *
 * V3:
 * Shared USER / TEAM Executive Report contract with source metadata.
 *
 * V4:
 * Adds explicit risk-assessment coverage semantics while preserving the
 * same Team Dashboard snapshot in the `organization` field.
 *
 * Historical V3 Team reports remain readable. Newly generated reports
 * use V4.
 */
export type TeamExecutiveReportSnapshotV3 =
  ExecutiveReportSnapshotV3<
    TeamDashboard
  >;

export type TeamExecutiveReportSnapshotV4 =
  ExecutiveReportSnapshotV4<
    TeamDashboard
  >;

export type TeamExecutiveReportSnapshot =
  | TeamExecutiveReportSnapshotV3
  | TeamExecutiveReportSnapshotV4;

export interface TeamExecutiveReport {
  id: string;
  teamId: string | null;

  title: string;
  description: string | null;

  status: TeamReportStatus;

  reportData:
    | TeamExecutiveReportSnapshot
    | null;

  pdfPath: string | null;
  csvPath: string | null;
  error: string | null;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  hasPdf: boolean;
  hasCsv: boolean;
}

export interface GetTeamReportResponse {
  success: true;
  report: TeamExecutiveReport;
}

export interface DeleteTeamReportResponse {
  success: true;
  message: string;
  reportId: string;
}

/*
 * --------------------------------------------------------------------------
 * Team Invitations
 * --------------------------------------------------------------------------
 */

export type TeamInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type TeamInvitationRole =
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface TeamInvitationTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface TeamInvitationActor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface TeamInvitationInvitee {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface TeamInvitation {
  id: string;
  teamId: string;

  role: TeamInvitationRole;
  status: TeamInvitationStatus;

  team: TeamInvitationTeam;
  invitedBy: TeamInvitationActor;
  invitee: TeamInvitationInvitee;

  createdAt: string;
  updatedAt: string;
  expiresAt: string;

  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
}

export interface ListTeamInvitationsResponse {
  success: true;
  count: number;
  data: TeamInvitation[];
}

export interface CreateTeamInvitationPayload {
  actorUserId: string;

  /*
   * The invitee is selected using their GitHub username.
   *
   * The backend handles whitespace, an optional leading @ character,
   * and case-insensitive matching.
   */
  username: string;

  role: TeamInvitationRole;
}

export interface CreateTeamInvitationResponse {
  success: true;
  message: string;
  data: TeamInvitation;
}

export interface CancelTeamInvitationResponse {
  success: true;
  message: string;
  invitationId: string;
}

export interface ListUserTeamInvitationsResponse {
  success: true;
  count: number;
  data: TeamInvitation[];
}

export interface RespondToTeamInvitationPayload {
  actorUserId: string;
}

export interface RespondToTeamInvitationResponse {
  success: true;
  message: string;
  invitationId: string;
  teamId: string;
}