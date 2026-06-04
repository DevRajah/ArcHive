export const mapArchitectureDomain = ({
    changeType,
    fallbackDomains,
}: {
    changeType: string;
    fallbackDomains?: string[];
}) => {
    const type = changeType.toUpperCase();

    /**
     * =========================================
     * REALTIME
     * =========================================
     */

    if (
        type.includes("REALTIME") ||
        type.includes("SOCKET") ||
        type.includes("LIVE")
    ) {
        return "REALTIME_SYSTEMS";
    }

    /**
     * =========================================
     * QUEUES / WORKERS
     * =========================================
     */

    if (
        type.includes("QUEUE") ||
        type.includes("WORKER") ||
        type.includes("BULLMQ") ||
        type.includes("JOB")
    ) {
        return "QUEUE_INFRASTRUCTURE";
    }

    /**
     * =========================================
     * AUTH
     * =========================================
     */

    if (
        type.includes("AUTH") ||
        type.includes("OAUTH") ||
        type.includes("TOKEN")
    ) {
        return "AUTHENTICATION";
    }

    /**
     * =========================================
     * API
     * =========================================
     */

    if (
        type.includes("API") ||
        type.includes("BACKEND")
    ) {
        return "API_LAYER";
    }

    /**
     * =========================================
     * FRONTEND
     * =========================================
     */

    if (
        type.includes("FRONTEND") ||
        type.includes("UI") ||
        type.includes("DASHBOARD")
    ) {
        return "FRONTEND_ARCHITECTURE";
    }

    /**
     * =========================================
     * STATE MANAGEMENT
     * =========================================
     */

    if (
        type.includes("STATE") ||
        type.includes("HOOK")
    ) {
        return "STATE_MANAGEMENT";
    }

    /**
     * =========================================
     * DATABASE
     * =========================================
     */

    if (
        type.includes("DATABASE") ||
        type.includes("PRISMA") ||
        type.includes("SCHEMA") ||
        type.includes("MIGRATION")
    ) {
        return "DATABASE_LAYER";
    }

    /**
     * =========================================
     * DEVOPS
     * =========================================
     */

    if (
        type.includes("DOCKER") ||
        type.includes("KUBERNETES") ||
        type.includes("TERRAFORM") ||
        type.includes("DEVOPS")
    ) {
        return "DEVOPS_INFRASTRUCTURE";
    }

    /**
     * =========================================
     * DEPENDENCIES
     * =========================================
     */

    if (
        type.includes("DEPENDENCY") ||
        type.includes("PACKAGE")
    ) {
        return "DEPENDENCY_MANAGEMENT";
    }

    /**
     * =========================================
     * TYPES / CONTRACTS
     * =========================================
     */

    if (
        type.includes("TYPE") ||
        type.includes("CONTRACT")
    ) {
        return "TYPE_CONTRACTS";
    }

    /**
     * =========================================
     * ARCHITECTURE INTELLIGENCE
     * =========================================
     */

    if (
        type.includes("ARCHITECTURE_INTELLIGENCE") ||
        type.includes("CLASSIFIER") ||
        type.includes("FINGERPRINT")
    ) {
        return "ARCHITECTURE_INTELLIGENCE";
    }

    if (
        fallbackDomains &&
        fallbackDomains.length > 0
    ) {
        return fallbackDomains[0];
    }

    return "GENERAL_ARCHITECTURE";
};