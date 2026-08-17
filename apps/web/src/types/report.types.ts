import type {
  EngineeringTrendAnalysis,
  ExecutiveKpis,
  ExecutiveReportAnalytics,
  ExecutiveReportSnapshotV3,
  ExecutiveSummary,
  ReportRiskSeverity,
  ReportSchemaVersion,
  ReportTrendDirection,
  RepositoryHighlight,
  RepositoryHighlights,
  RiskBreakdown,
  TechnologyAnalysis,
} from "@archive/types";

/*
 * Re-export the shared Executive Report types from this frontend module.
 *
 * Future me:
 * Existing web components import report types from "@/types/report.types".
 * Re-exporting them here preserves that frontend import boundary while
 * @archive/types remains the canonical source of truth for the persisted
 * Executive Report contract.
 */
export type {
  EngineeringTrendAnalysis,
  ExecutiveKpis,
  ExecutiveReportSnapshotV3,
  ExecutiveSummary,
  ReportRiskSeverity,
  ReportSchemaVersion,
  ReportTrendDirection,
  RepositoryHighlight,
  RepositoryHighlights,
  RiskBreakdown,
  TechnologyAnalysis,
} from "@archive/types";

export type ReportStatus =
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

/*
 * This represents the raw Organization Dashboard snapshot stored inside
 * personal Executive Reports.
 *
 * The dashboard itself remains a web/API-specific structure. The shared
 * @archive/types package owns the common Executive Report analytics
 * contract rather than this application-specific dashboard shape.
 */
export interface OrganizationDashboardSnapshot {
  overview: Record<string, unknown>;
  rankings: unknown[];
  technology: Record<string, unknown>;
  recommendations: unknown[];
  risks: Record<string, unknown>;
  activity: Record<string, unknown>;
  trends: Record<string, unknown>;
}

/**
 * Schema V1 is ArcHive's genuine legacy Executive Report format.
 *
 * Older reports may only contain the raw organization snapshot. We keep
 * this contract so historical reports remain visible without pretending
 * that they contain executive analytics that were introduced later.
 */
export interface ExecutiveReportSnapshotV1 {
  schemaVersion: 1;

  reportId: string;
  title: string;
  description?: string | null;
  generatedAt: string;

  organization: OrganizationDashboardSnapshot;
}

/**
 * Schema V2 is a supported historical Executive Report format.
 *
 * It contains the executive analytics used by the current report UI,
 * but it predates the explicit USER / TEAM source metadata introduced
 * by Schema V3.
 */
export interface ExecutiveReportSnapshotV2 {
  schemaVersion: 2;

  reportId: string;
  title: string;
  description: string | null;
  generatedAt: string;

  executiveSummary: ExecutiveSummary;
  executiveKpis: ExecutiveKpis;
  riskBreakdown: RiskBreakdown;
  technologyAnalysis: TechnologyAnalysis;
  trendAnalysis: EngineeringTrendAnalysis;
  repositoryHighlights: RepositoryHighlights;

  organization: OrganizationDashboardSnapshot;
}

/**
 * Schema V3 is the current Executive Report contract.
 *
 * The common V3 structure is owned by @archive/types. Personal reports
 * specialise only the stored Organization Dashboard snapshot.
 */
export type PersonalExecutiveReportSnapshotV3 =
  ExecutiveReportSnapshotV3<
    OrganizationDashboardSnapshot
  >;

/**
 * Executive Report schemas deliberately understood by this frontend.
 *
 * V1 is legacy.
 * V2 is supported historical.
 * V3 is supported current.
 */
export type ExecutiveReportSnapshot =
  | ExecutiveReportSnapshotV1
  | ExecutiveReportSnapshotV2
  | PersonalExecutiveReportSnapshotV3;

/**
 * Minimal representation of a persisted Executive Report whose schema
 * version this frontend does not understand.
 *
 * Future me:
 * Persisted data can outlive a particular frontend deployment. An older
 * frontend may therefore encounter a newer report, such as Schema V4.
 *
 * Preserve the numeric version instead of coercing that report into V1,
 * V2 or V3. Unknown future schemas are unsupported, not legacy.
 */
export interface UnsupportedExecutiveReportSnapshot {
  schemaVersion: number;

  [key: string]: unknown;
}

export interface ReportListItem {
  id: string;
  title: string;
  description: string | null;
  status: ReportStatus;

  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  hasPdf: boolean;
  hasCsv: boolean;
}

export interface ExecutiveReport
  extends ReportListItem {
  userId: string;

  /*
   * The API normally returns one of ArcHive's known report schemas.
   *
   * The unsupported shape is also accepted at this boundary because
   * stored reports may have been produced by a newer ArcHive version
   * than the frontend currently understands.
   */
  reportData:
    | ExecutiveReportSnapshot
    | UnsupportedExecutiveReportSnapshot
    | null;

  pdfPath: string | null;
  csvPath: string | null;

  error: string | null;
}

export interface ListReportsResponse {
  success: true;
  count: number;
  reports: ReportListItem[];
}

export interface GetReportResponse {
  success: true;
  report: ExecutiveReport;
}

export interface GenerateReportPayload {
  userId: string;
  title: string;
  description?: string;
}

export interface GenerateReportResponse {
  success: true;
  reportId: string;
  status: ReportStatus;
  message: string;
}

export interface DeleteReportResponse {
  success: true;
  reportId: string;
  message: string;
}

export interface ReportStatusResponse {
  success: true;

  report: {
    id: string;
    status: ReportStatus;
    generatedAt: string | null;
    error: string | null;
  };
}

/**
 * Describes whether this frontend understands the persisted report
 * contract it received.
 *
 * LEGACY:
 * Genuine Schema V1 historical data.
 *
 * SUPPORTED:
 * A report schema this frontend understands and can render correctly.
 *
 * UNSUPPORTED:
 * A schema version exists, but this frontend does not know its contract.
 */
export type ReportCompatibility =
  | "LEGACY"
  | "SUPPORTED"
  | "UNSUPPORTED";

/**
 * Single frontend model consumed by the report drawer.
 *
 * Future me:
 * The analytics themselves come from the shared Executive Report
 * contract. This frontend model adds only compatibility and
 * normalization state needed by the personal report UI.
 */
export interface NormalizedExecutiveReport
  extends ExecutiveReport {
  /*
   * Preserve the actual persisted schema number.
   *
   * Do not restrict this property to ReportSchemaVersion. If an older
   * frontend receives Schema V4, we still need to preserve "4" so the
   * UI can explain that V4 is unsupported.
   */
  schemaVersion: number | null;

  /*
   * null means there is no report snapshot available yet, so there is
   * no schema compatibility decision to make.
   */
  compatibility:
    | ReportCompatibility
    | null;

  /*
   * Temporary compatibility field for existing report UI code.
   *
   * Batch 4 will move presentation logic to `compatibility`.
   * Until then, keep this field so we do not break the existing drawer.
   */
  isLegacy: boolean;

  /*
   * Only supported analytical report schemas expose normalized analytics.
   *
   * V1 and unknown future schemas intentionally return null here rather
   * than manufacturing analytics that the persisted contract does not
   * contain or that this frontend does not understand.
   */
  analytics:
    ExecutiveReportAnalytics | null;
}