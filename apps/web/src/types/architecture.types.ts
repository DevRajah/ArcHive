export interface ArchitectureChange {
  id: string;

  title?: string;
  description?: string;

  changeType?: string;
  severity?: string;

  summary?: string | null;

  detectedTechnology?: string | null;

  fileAffected?: string | null;

  createdAt: string;
}