import { RepositoryType } from "../constants";
import { EvidenceResult } from "../evidence";

export type ClassifiedRepositoryIdentity = {
  repositoryType: RepositoryType;
  confidence: number;
  totalScore: number;
  evidence: string[];
  role: "PRIMARY" | "SECONDARY" | "REJECTED";
  rejectionReason?: string;
};

export type RepositoryClassification = {
  primary: ClassifiedRepositoryIdentity | null;
  secondary: ClassifiedRepositoryIdentity[];
  rejected: ClassifiedRepositoryIdentity[];
  rankedEvidence: ClassifiedRepositoryIdentity[];
  repositoryTypes: RepositoryType[];
};