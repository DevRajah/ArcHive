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

  lastAnalysisAt: Date | null;
};
}