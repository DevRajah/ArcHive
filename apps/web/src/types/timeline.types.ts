/**
 * Every type of event that ArcHive can place on the repository timeline.
 *
 * The backend normalizes different database records into these five
 * frontend-friendly event types.
 */
export type TimelineEventType =
  | "ENGINEERING_EVENT"
  | "ARCHITECTURE_CHANGE"
  | "INTELLIGENCE_SNAPSHOT"
  | "ARCHITECTURE_ADVISOR"
  | "HEALTH_TREND";

/**
 * Severity tells us how important or risky a timeline event is.
 */
export type TimelineSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

/**
 * Supported timeline sorting fields.
 *
 * The backend currently supports timestamp sorting.
 */
export type TimelineSortField = "timestamp";

/**
 * Supported timeline sorting directions.
 */
export type TimelineSortOrder = "asc" | "desc";

/**
 * One normalized event returned by the Timeline API.
 *
 * We no longer need separate frontend types for commits,
 * architecture changes, health changes, or advisor snapshots.
 * The backend converts them all into this common structure.
 */
export interface TimelineEvent {
  id: string;

  timestamp: string;

  type: TimelineEventType;

  title: string;

  description: string;

  severity: TimelineSeverity;

  repositoryId: string;

  /**
   * Extra evidence that belongs to the event.
   *
   * Different event types may provide different metadata,
   * so we keep this flexible instead of assuming one exact shape.
   */
  metadata: Record<string, unknown>;
}

/**
 * Small repository identity object included in the timeline response.
 */
export interface TimelineRepository {
  id: string;
  name: string;
  fullName: string;
}

/**
 * Summary information shown in the cards at the top of the page.
 */
export interface TimelineSummary {
  totalEvents: number;
  architectureChanges: number;
  intelligenceSnapshots: number;
  advisorSnapshots: number;
  firstRecordedAt: string | null;
  lastRecordedAt: string | null;
}

/**
 * Pagination information returned by the backend.
 */
export interface TimelinePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Complete response returned by:
 *
 * GET /api/repositories/:repositoryId/timeline
 */
export interface RepositoryTimelineResponse {
  repository: TimelineRepository;

  summary: TimelineSummary;

  timeline: TimelineEvent[];

  pagination: TimelinePagination;

  generatedAt: string;
}

/**
 * Query options that can be sent to the backend.
 *
 * All properties are optional because the backend provides defaults.
 */
export interface RepositoryTimelineQuery {
  page?: number;
  limit?: number;

  type?: TimelineEventType;

  severity?: TimelineSeverity;

  from?: string;
  to?: string;

  search?: string;

  sort?: TimelineSortField;
  order?: TimelineSortOrder;
}

/**
 * Response returned after rebuilding the repository timeline.
 *
 * The exact message field may vary depending on the backend response,
 * so it is optional.
 */
export interface RefreshTimelineResponse {
  message?: string;
  rebuiltEvents?: number;
  generatedAt?: string;
}