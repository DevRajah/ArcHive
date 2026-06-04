export const detectArchitectureStyle = ({
    domains,
    technologies,
    signals,
    repositoryTypes = [],
}: {
    domains: string[];
    technologies: string[];
    signals: string[];
    repositoryTypes?: string[];
}) => {
    const styles = new Set<string>();

    if (
        domains.includes("REALTIME_SYSTEMS")
    ) {
        styles.add("REALTIME_PLATFORM");
    }

    if (
        domains.includes("QUEUE_INFRASTRUCTURE")
    ) {
        styles.add("QUEUE_DRIVEN");
    }

    if (
        signals.includes("BACKGROUND_PROCESSING")
    ) {
        styles.add("EVENT_DRIVEN");
    }

    if (
        domains.includes("API_LAYER")
    ) {
        styles.add("API_PLATFORM");
    }

    if (
        domains.includes("ARCHITECTURE_INTELLIGENCE")
    ) {
        styles.add("ENGINEERING_INTELLIGENCE");
    }

    if (
        styles.size === 0
    ) {
        styles.add("GENERAL_APPLICATION");
    }

    if (
        repositoryTypes.includes("AI_ML_PROJECT")
    ) {
        styles.add("AI_PLATFORM");
    }

    if (
        repositoryTypes.includes("DATA_ENGINEERING_PROJECT")
    ) {
        styles.add("DATA_PIPELINE_PLATFORM");
    }

    if (
        repositoryTypes.includes("MOBILE_APPLICATION")
    ) {
        styles.add("MOBILE_PLATFORM");
    }

    if (
        repositoryTypes.includes("INFRASTRUCTURE_REPOSITORY")
    ) {
        styles.add("INFRASTRUCTURE_PLATFORM");
    }

    return Array.from(styles);
};