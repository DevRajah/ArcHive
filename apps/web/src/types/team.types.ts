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
  userId: string;
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