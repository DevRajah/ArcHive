export interface RepositoryIntelligenceAuditResponse {
  auditStatus?: string;
  strengths?: string[];
  warnings?: string[];
  improvementAreas?: string[];
  signals?: string[];
}