export interface TimelineEntry {
  id: string;
  title: string;
  summary?: string;
  eventType?: string;
  source?: string;
  createdAt: string;
}