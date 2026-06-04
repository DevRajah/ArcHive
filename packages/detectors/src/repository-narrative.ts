type GenerateRepositoryNarrativeInput = {
    repositoryName: string;
    repositoryTypes: string[];
    technologies: string[];
    domains: string[];
    capabilities: Record<string, boolean>;
    architectureStyles: string[];
    architectureChangeCount?: number;
    repositoryDescription?: string | null;
    repositoryLanguage?: string | null;
};

const humanize = (value: string) => {
    return value.replaceAll("_", " ").toLowerCase();
};

export const generateRepositoryNarrative = ({
    repositoryName,
    repositoryTypes,
    technologies,
    domains,
    capabilities,
    architectureStyles,
    architectureChangeCount,
    repositoryDescription,
    repositoryLanguage,
}: GenerateRepositoryNarrativeInput) => {
    const strengths: string[] = [];
    const dominantPatterns: string[] = [];
    const detectedSpecializations: string[] = [];

    const historyCount = architectureChangeCount || 0;

    const hasStrongEvolutionHistory =
        historyCount >= 5 || domains.length >= 3;

    const hasSomeHistory =
        historyCount > 0 || domains.length > 0;

    const describePlatform = (platformDescription: string) => {
        if (hasStrongEvolutionHistory) {
            return `${repositoryName} is evolving into ${platformDescription}.`;
        }

        if (hasSomeHistory) {
            return `${repositoryName} is developing as ${platformDescription}.`;
        }

        return `${repositoryName} appears to be ${platformDescription}.`;
    };

    if (capabilities.realtimeSystems) strengths.push("Realtime infrastructure");
    if (capabilities.queueInfrastructure) strengths.push("Background job processing");
    if (capabilities.architectureIntelligence) strengths.push("Repository intelligence systems");
    if (capabilities.apiLayer) strengths.push("API platform engineering");
    if (capabilities.frontendArchitecture) strengths.push("Frontend architecture");
    if (capabilities.databaseLayer) strengths.push("Database-backed persistence");

    if (architectureStyles.includes("REALTIME_PLATFORM")) {
        dominantPatterns.push("Realtime synchronization");
    }

    if (architectureStyles.includes("QUEUE_DRIVEN")) {
        dominantPatterns.push("Queue-driven processing");
    }

    if (architectureStyles.includes("EVENT_DRIVEN")) {
        dominantPatterns.push("Event-driven architecture");
    }

    if (architectureStyles.includes("ENGINEERING_INTELLIGENCE")) {
        dominantPatterns.push("Repository intelligence analysis");
    }

    if (repositoryTypes.includes("FINTECH_PLATFORM")) {
        detectedSpecializations.push("Financial infrastructure");
        dominantPatterns.push("Transaction lifecycle processing");
        strengths.push("Financial workflow orchestration");
    }

    if (repositoryTypes.includes("DEVTOOL_PLATFORM")) {
        detectedSpecializations.push("Developer tooling");
        dominantPatterns.push("Code generation and scaffolding");
        strengths.push("Developer experience automation");
    }

    if (repositoryTypes.includes("OBSERVABILITY_PLATFORM")) {
        detectedSpecializations.push("Observability systems");
        dominantPatterns.push("Monitoring and operational visibility");
        strengths.push("System health intelligence");
    }

    if (repositoryTypes.includes("SECURITY_PLATFORM")) {
        detectedSpecializations.push("Security systems");
        dominantPatterns.push("Risk and anomaly detection");
        strengths.push("Security intelligence");
    }

    if (repositoryTypes.includes("COLLABORATION_PLATFORM")) {
        detectedSpecializations.push("Realtime collaboration");
        dominantPatterns.push("Shared editing and live presence");
        strengths.push("Collaborative system design");
    }

    if (repositoryTypes.includes("SMART_TRANSPORT_PLATFORM")) {
        detectedSpecializations.push("Smart transport systems");
        dominantPatterns.push("Route intelligence and delay-aware workflows");
        strengths.push("Mobility intelligence");
    }

    if (repositoryTypes.includes("ENERGY_PLATFORM")) {
        detectedSpecializations.push("Energy monitoring systems");
        dominantPatterns.push("Realtime consumption monitoring");
        strengths.push("Operational energy analytics");
    }

    if (repositoryTypes.includes("AI_ML_PROJECT")) {
        detectedSpecializations.push("AI / Machine Learning");
        dominantPatterns.push("Model-driven processing");
        strengths.push("AI-enabled processing");
    }

    if (repositoryTypes.includes("DATA_ENGINEERING_PROJECT")) {
        detectedSpecializations.push("Data engineering");
        dominantPatterns.push("Data pipeline orchestration");
        strengths.push("Data workflow engineering");
    }

    if (repositoryTypes.includes("MOBILE_APPLICATION")) {
        detectedSpecializations.push("Mobile systems");
        dominantPatterns.push("Mobile application architecture");
        strengths.push("Mobile product delivery");
    }

    if (repositoryTypes.includes("INFRASTRUCTURE_REPOSITORY")) {
        detectedSpecializations.push("Infrastructure engineering");
        dominantPatterns.push("Infrastructure-as-code and deployment automation");
        strengths.push("Infrastructure automation");
    }

    if (repositoryTypes.includes("ENGINEERING_INTELLIGENCE_PLATFORM")) {
        detectedSpecializations.push("Engineering intelligence");
        dominantPatterns.push("Architecture analysis and repository reasoning");
        strengths.push("Architecture intelligence");
    }

    if (repositoryTypes.includes("JAVASCRIPT_TYPESCRIPT_PROJECT")) {
        detectedSpecializations.push("TypeScript engineering");
    }

    let headline = describePlatform("an engineering platform");

    if (repositoryTypes.includes("FINTECH_PLATFORM")) {
        headline = describePlatform("an event-driven financial infrastructure platform");
    } else if (repositoryTypes.includes("DEVTOOL_PLATFORM")) {
        headline = describePlatform("a developer tooling and scaffolding platform");
    } else if (repositoryTypes.includes("OBSERVABILITY_PLATFORM")) {
        headline = describePlatform("an observability and operational intelligence platform");
    } else if (repositoryTypes.includes("SECURITY_PLATFORM")) {
        headline = describePlatform("a security intelligence and risk detection platform");
    } else if (repositoryTypes.includes("SMART_TRANSPORT_PLATFORM")) {
        headline = describePlatform("a smart transport intelligence platform");
    } else if (repositoryTypes.includes("ENERGY_PLATFORM")) {
        headline = describePlatform("a realtime energy monitoring platform");
    } else if (repositoryTypes.includes("ENGINEERING_INTELLIGENCE_PLATFORM")) {
        headline = describePlatform("a repository engineering intelligence platform");
    } else if (architectureStyles.includes("ENGINEERING_INTELLIGENCE")) {
        headline = describePlatform("a realtime engineering intelligence platform");
    } else if (architectureStyles.includes("REALTIME_PLATFORM")) {
        headline = describePlatform("a realtime distributed platform");
    } else if (architectureStyles.includes("API_PLATFORM")) {
        headline = describePlatform("a backend service platform");
    }

    const uniqueStrengths = Array.from(new Set(strengths));
    const uniquePatterns = Array.from(new Set(dominantPatterns));
    const uniqueSpecializations = Array.from(new Set(detectedSpecializations));

    const summary =
        `${repositoryName} demonstrates architectural evolution across ${domains.length} engineering domains` +
        (technologies.length > 0
            ? ` with detected technologies including ${technologies.slice(0, 6).join(", ")}.`
            : ".") +
        (uniqueStrengths.length > 0
            ? ` Key strengths include ${uniqueStrengths.slice(0, 5).join(", ")}.`
            : "");

    const engineeringProfile =
        `${repositoryName} currently exhibits ${architectureStyles.length > 0
            ? architectureStyles.map(humanize).join(", ")
            : "general application"
        } engineering patterns with emphasis on ${uniquePatterns.length > 0
            ? uniquePatterns.slice(0, 5).join(", ").toLowerCase()
            : "modern software architecture"
        }.`;

    return {
        headline,
        summary,
        strengths: uniqueStrengths,
        engineeringProfile,
        dominantPatterns: uniquePatterns,
        detectedSpecializations: uniqueSpecializations,
    };
};