export interface TimelineEntry {
  id: string;
  title: string;
  summary?: string;
  eventType?: string;
  createdAt: string;
  repositoryId: string;
}