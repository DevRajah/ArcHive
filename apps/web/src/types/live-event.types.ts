export type LiveEventType =
  | "engineering-event:processed"
  | "architecture-change:detected"
  | "queue-job:completed"
  | "repository:updated";

export interface LiveNotification {
  id: string;
  type: LiveEventType;
  title: string;
  description?: string;
  repositoryId?: string;
  repositoryFullName?: string;
  createdAt: string;
}