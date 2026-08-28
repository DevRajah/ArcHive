/*
|--------------------------------------------------------------------------
| Repository Timeline Types
|--------------------------------------------------------------------------
|
| These types define the stable contract consumed by the ArcHive frontend.
|
| The database contains several different forms of repository evidence.
| The Timeline service converts them into one consistent TimelineEvent shape
| so the frontend does not need to understand every Prisma model.
|--------------------------------------------------------------------------
*/

export type TimelineEventType =
  | "ENGINEERING_EVENT"
  | "ARCHITECTURE_CHANGE"
  | "INTELLIGENCE_SNAPSHOT"
  | "ARCHITECTURE_ADVISOR"
  | "HEALTH_TREND"
  | "TIMELINE_ENTRY";

export type TimelineSeverity =
  | "INFO"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TimelineSortOrder = "asc" | "desc";

export type TimelineEvent = {
  id: string;

  repositoryId: string;

  type: TimelineEventType;

  title: string;

  description: string;

  severity: TimelineSeverity;

  timestamp: string;

  metadata: Record<string, unknown>;
};

export type TimelineSummary = {
  totalEvents: number;

  engineeringEvents: number;

  architectureChanges: number;

  intelligenceSnapshots: number;

  advisorSnapshots: number;

  healthTrendEvents: number;

  timelineEntries: number;

  firstRecordedAt: string | null;

  lastRecordedAt: string | null;
};

export type TimelinePagination = {
  page: number;

  limit: number;

  totalItems: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
};

export type TimelineRepository = {
  id: string;

  name: string;

  fullName: string | null;
};

export type RepositoryTimelineResponse = {
  repository: TimelineRepository;

  summary: TimelineSummary;

  timeline: TimelineEvent[];

  pagination: TimelinePagination;

  generatedAt: string;
};

export type TimelineFilters = {
  page?: number;

  limit?: number;

  type?: TimelineEventType;

  severity?: TimelineSeverity;

  search?: string;

  from?: string;

  to?: string;

  order?: TimelineSortOrder;
};