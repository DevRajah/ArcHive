import {
    CapabilityResult,
    RepositoryDNA,
    RepositoryPersona,
} from "../index";

import {
    EngineeringQualityArea,
    QualityContribution,
} from "./types";

export type EngineeringQualityContext = {
    technologies: string[];

    architectureDomains: string[];

    repositoryTypes: string[];

    capabilities: CapabilityResult[];

    repositoryDNA: RepositoryDNA;

    repositoryPersona: RepositoryPersona;

    contributions: QualityContribution[];

    addQuality: (
        area: EngineeringQualityArea,
        score: number,
        reason: string
    ) => void;
};

export const createEngineeringQualityContext = ({
    technologies,
    architectureDomains,
    repositoryTypes,
    capabilities,
    repositoryDNA,
    repositoryPersona,
}: Omit<EngineeringQualityContext, "contributions" | "addQuality">): EngineeringQualityContext => {

    const contributions: QualityContribution[] = [];

    const addQuality = (
        area: EngineeringQualityArea,
        score: number,
        reason: string
    ) => {

        contributions.push({
            area,
            score,
            reason,
        });

    };

    return {
        technologies,
        architectureDomains,
        repositoryTypes,
        capabilities,
        repositoryDNA,
        repositoryPersona,
        contributions,
        addQuality,
    };

};