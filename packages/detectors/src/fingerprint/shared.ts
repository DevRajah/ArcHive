import {
    RepositoryType,
} from "../constants";

export type FingerprintState = {
    technologies: Set<string>;

    architectureDomains: Set<string>;

    engineeringSignals: Set<string>;

    repositoryTypes: Set<string>;

    reasoningSignals: string[];

    addReasoningSignal(
        signal: string,
    ): void;
};

export const add = (
    set: Set<string>,
    values: string[],
) => {
    values.forEach(
        (value) => set.add(
            value,
        ),
    );
};

export const includesAny = (
    value: string,
    keywords: string[],
) => {

    const normalized =
        value.toLowerCase();

    return keywords.some(
        (keyword) =>
            normalized.includes(
                keyword.toLowerCase(),
            ),
    );

};

export const repositoryTypePriority = [

    "ENGINEERING_INTELLIGENCE_PLATFORM",

    "DEVTOOL_PLATFORM",

    "FINTECH_PLATFORM",

    "OBSERVABILITY_PLATFORM",

    "SECURITY_PLATFORM",

    "AI_ML_PROJECT",

    "DEVELOPER_PLATFORM",

    "DATA_ENGINEERING_PROJECT",

    "SMART_TRANSPORT_PLATFORM",

    "ENERGY_PLATFORM",

    "HEALTHCARE_PLATFORM",

    "ECOMMERCE_PLATFORM",

    "EDUCATION_PLATFORM",

    "COLLABORATION_PLATFORM",

    "INFRASTRUCTURE_PLATFORM",

    "MOBILE_APPLICATION",

    "BACKEND_SERVICE",

    "FRONTEND_APPLICATION",

    "JAVASCRIPT_TYPESCRIPT_PROJECT",

    "GENERAL_ENGINEERING_PROJECT",

];

export const sortRepositoryTypesByPurpose = (
    types: string[],
) => {

    return [...types].sort(
        (a, b) => {

            const aIndex =
                repositoryTypePriority.indexOf(
                    a,
                );

            const bIndex =
                repositoryTypePriority.indexOf(
                    b,
                );

            return (
                (aIndex === -1
                    ? 999
                    : aIndex) -

                (bIndex === -1
                    ? 999
                    : bIndex)
            );

        },
    );

};