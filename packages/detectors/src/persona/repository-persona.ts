import { RepositoryType } from "../constants";
import { RepositoryPersona } from "./persona-types";

export const inferRepositoryPersona = (
    repositoryTypes: RepositoryType[],
    capabilities: string[]
): RepositoryPersona => {

    if (
        repositoryTypes.includes("ENGINEERING_INTELLIGENCE_PLATFORM")
    ) {
        return "ENGINEERING_INTELLIGENCE_PLATFORM";
    }

    if (
        repositoryTypes.includes("DEVTOOL_PLATFORM") ||
        repositoryTypes.includes("DEVELOPER_PLATFORM")
    ) {
        return "DEVELOPER_TOOLCHAIN";
    }

    if (
        repositoryTypes.includes("FINTECH_PLATFORM")
    ) {
        return "ENTERPRISE_BACKEND_PLATFORM";
    }

    if (
        repositoryTypes.includes("DATA_ENGINEERING_PROJECT")
    ) {
        return "DATA_PLATFORM";
    }

    if (
        repositoryTypes.includes("AI_ML_PROJECT")
    ) {
        return "AI_PLATFORM";
    }

    if (
        repositoryTypes.includes("INFRASTRUCTURE_PLATFORM")
    ) {
        return "CLOUD_INFRASTRUCTURE_PLATFORM";
    }

    if (
        repositoryTypes.includes("MOBILE_APPLICATION")
    ) {
        return "MOBILE_APPLICATION";
    }

    if (
        repositoryTypes.includes("PACKAGE_LIBRARY")
    ) {
        return "OPEN_SOURCE_LIBRARY";
    }

    if (
        capabilities.includes("EXPERIMENTAL")
    ) {
        return "RESEARCH_PROJECT";
    }
    if (
        repositoryTypes.includes("DEVTOOL_PLATFORM") ||
        repositoryTypes.includes("DEVELOPER_PLATFORM")
    ) {
        return "DEVELOPER_TOOLCHAIN";
    }

    if (repositoryTypes.includes("ENGINEERING_INTELLIGENCE_PLATFORM")) {
        return "ENGINEERING_INTELLIGENCE_PLATFORM";
    }

    return "PRODUCT_SAAS";
};