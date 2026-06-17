import { RepositoryType } from "../../constants";

export const NegativeEvidence: Partial<Record<RepositoryType, RepositoryType[]>> =
{
    FINTECH_PLATFORM: [
        "DOCUMENTATION_HEAVY_REPOSITORY",
        "DESIGN_SYSTEM",
    ],

    DESIGN_SYSTEM: [
        "FINTECH_PLATFORM",
        "DATA_ENGINEERING_PROJECT",
    ],

    FRONTEND_APPLICATION: [
        "BACKEND_SERVICE",
    ],

    BACKEND_SERVICE: [
        "DESIGN_SYSTEM",
    ],

    PACKAGE_LIBRARY: [
        "FINTECH_PLATFORM",
        "SMART_TRANSPORT_PLATFORM",
        "ENERGY_PLATFORM",
    ],
};