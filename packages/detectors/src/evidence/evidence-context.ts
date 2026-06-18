import {
    EvidenceCategory,
    EvidenceContext,
    EvidenceContextInput,
    EvidenceStrength,
    EvidenceItem,
    TechnologyEvidence,
} from "./evidence-types";
import { RepositoryType } from "../constants";

export const createEvidenceContext = ({
    filesChanged,
    commitMessages,
    repositoryContext,
}: EvidenceContextInput): EvidenceContext => {
    const evidenceItems: EvidenceItem[] = [];
    const technologyEvidence: TechnologyEvidence[] = [];



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

    const addTechnology = (
        name: string,
        reason: string,
        weight: number,
        strength: EvidenceStrength
    ) => {
        const alreadyExists = technologyEvidence.some(
            (technology) => technology.name === name
        );

        if (alreadyExists) {
            return;
        }

        technologyEvidence.push({
            name,
            reason,
            weight,
            strength,
        });
    };

    return {
        filesChanged,
        commitMessages,
        combinedText,
        evidenceItems,
        technologyEvidence,
        addEvidence,
        addTechnology,
    };
};