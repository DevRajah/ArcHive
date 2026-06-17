import { RepositoryType } from "../constants";

export type NegativeEvidenceRule = {
    source: RepositoryType;
    target: RepositoryType;
    penalty: number;
};

export const negativeEvidenceRules: NegativeEvidenceRule[] = [
    {
        source: "FINTECH_PLATFORM",
        target: "PACKAGE_LIBRARY",
        penalty: 25,
    },
    {
        source: "FINTECH_PLATFORM",
        target: "DOCUMENTATION_HEAVY_REPOSITORY",
        penalty: 30,
    },
    {
        source: "FINTECH_PLATFORM",
        target: "DESIGN_SYSTEM",
        penalty: 30,
    },

    {
        source: "BACKEND_SERVICE",
        target: "FRONTEND_APPLICATION",
        penalty: 15,
    },

    {
        source: "FRONTEND_APPLICATION",
        target: "BACKEND_SERVICE",
        penalty: 15,
    },

    {
        source: "DATA_ENGINEERING_PROJECT",
        target: "DESIGN_SYSTEM",
        penalty: 40,
    },

    {
        source: "ENGINEERING_INTELLIGENCE_PLATFORM",
        target: "PACKAGE_LIBRARY",
        penalty: 35,
    },

    {
        source: "DEVTOOL_PLATFORM",
        target: "DOCUMENTATION_HEAVY_REPOSITORY",
        penalty: 20,
    },

    {
        source: "SECURITY_PLATFORM",
        target: "DESIGN_SYSTEM",
        penalty: 40,
    },
];