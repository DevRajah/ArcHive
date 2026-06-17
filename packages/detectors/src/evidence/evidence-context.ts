import {
  EvidenceCategory,
  EvidenceContext,
  EvidenceContextInput,
  EvidenceStrength,
  EvidenceItem 
} from "./evidence-types";
import { RepositoryType } from "../constants";

export const createEvidenceContext = ({
  filesChanged,
  commitMessages,
  repositoryContext,
}: EvidenceContextInput): EvidenceContext => {
  const evidenceItems: EvidenceItem[] = [];

  const combinedText = [
    ...filesChanged,
    ...commitMessages,
    repositoryContext,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const addEvidence = (
    repositoryType: RepositoryType,
    label: string,
    weight: number,
    category: EvidenceCategory,
    strength: EvidenceStrength
  ) => {
    evidenceItems.push({
      repositoryType,
      label,
      weight,
      category,
      strength,
    });
  };

  return {
    filesChanged,
    commitMessages,
    combinedText,
    evidenceItems,
    addEvidence,
  };
};