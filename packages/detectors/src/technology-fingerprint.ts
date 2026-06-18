import {
    createEvidenceContext,
    calculateEvidenceResults,
    detectFintechEvidence,
    detectDeveloperToolEvidence,
    detectDeveloperPlatformEvidence,
    detectObservabilityEvidence,
    EvidenceResult,
    detectSecurityEvidence,
    detectAiEvidence,
    detectMobileEvidence,
    detectTransportEvidence,
    detectDataEngineeringEvidence,
    detectBackendServiceEvidence,
    detectFrontendEvidence,
    detectDocumentationEvidence,
    detectDesignSystemEvidence,
    detectPackageSdkEvidence,
    detectInfrastructureEvidence,
    detectMessagingEvidence,
    detectHealthcareEvidence,
    detectEducationEvidence,
    detectEnergyEvidence,
    detectEcommerceEvidence,
    detectCollaborationEvidence
} from "./evidence";

import {
    ArchitectureDomains,
    EngineeringSignals,
    RepositoryTypes,
    RepositoryType,
    Technologies,
} from "./constants";

import {
    buildEngineeringQuality,
    createEngineeringQualityContext,
    EngineeringQualityResult,
    runQualityDetectors,
} from "./engineering-quality";

import { detectEngineeringCapabilities } from "./capabilities";
import {
    buildRepositoryDNA,
    RepositoryDNA
} from "./dna"

import {
    inferRepositoryPersona,
    RepositoryPersona,
} from "./persona";

import {
    buildRepositoryMaturity,
    RepositoryMaturity,
} from "./maturity";

import {
    buildProductionReadiness,
    ProductionReadiness,
} from "./production-readiness";

import {
    buildTechnicalDebtReport,
    TechnicalDebtReport,
} from "./technical-debt";

import {
    buildStrengthReport,
    StrengthReport,
} from "./strengths";

import {
    buildWeaknessReport,
    WeaknessReport,
} from "./weaknesses";

import {
    buildRecommendationReport,
    RecommendationReport,
} from "./recommendations";

import {
    buildRepositoryHealth,
    RepositoryHealth,
} from "./repository-health";

import {
    ArchitectureDriftReport,
    buildArchitectureDriftReport,
} from "./architecture-drift";

import {
    analyzeRepositoryEvolution,
    EvolutionInsightsReport,
} from "./repository-evolution";

import {
    buildRepositoryIntelligenceReport,
    RepositoryIntelligenceReport,
} from "./repository-intelligence";


import { runTechnologyDetectors } from "./technologies";

export type TechnologyFingerprintResult = {
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];
    reasoningSignals: string[];
    evidenceResults: EvidenceResult[];
    capabilities: ReturnType<typeof detectEngineeringCapabilities>;
    repositoryDNA: RepositoryDNA
    repositoryPersona: RepositoryPersona;
    engineeringQuality: EngineeringQualityResult;
    repositoryMaturity: RepositoryMaturity;
    productionReadiness: ProductionReadiness;
    technicalDebt: TechnicalDebtReport;
    strengthReport: StrengthReport;
    weaknessReport: WeaknessReport;
    recommendationReport: RecommendationReport;
    repositoryHealth: RepositoryHealth;
    architectureDrift: ArchitectureDriftReport;
    evolutionInsights: EvolutionInsightsReport;
    repositoryIntelligence: RepositoryIntelligenceReport;
    //repositoryIdentity: RepositoryIdentity;

    //rankedEvidence: RankedEvidence[];
};

const includesAny = (value: string, keywords: string[]) => {
    return keywords.some((keyword) =>
        value.toLowerCase().includes(keyword.toLowerCase())
    );
};

const add = (set: Set<string>, values: string[]) => {
    values.forEach((value) => set.add(value));
};

export const detectTechnologyFingerprint = (
    filesChanged: string[],
    commitMessages: string[]
): TechnologyFingerprintResult => {
    const joinedFiles = filesChanged.join(" ").toLowerCase();
    const joinedCommits = commitMessages.join(" ").toLowerCase();
    const combinedText = `${joinedFiles} ${joinedCommits}`;

    const technologies = new Set<string>();
    const architectureDomains = new Set<string>();
    const engineeringSignals = new Set<string>();
    const repositoryTypes = new Set<string>();
    const reasoningSignals: string[] = [];

    const addReasoningSignal = (signal: string) => {
        if (!reasoningSignals.includes(signal)) {
            reasoningSignals.push(signal);
        }
    };

    const evidenceContext = createEvidenceContext({
        filesChanged,
        commitMessages,
        repositoryContext: combinedText,
    });

    runTechnologyDetectors(evidenceContext);

    const addEvidence = (
        repositoryType: Parameters<typeof evidenceContext.addEvidence>[0],
        label: string,
        weight: number,
        category: Parameters<typeof evidenceContext.addEvidence>[3] = "DOMAIN_LANGUAGE",
        strength: Parameters<typeof evidenceContext.addEvidence>[4] = "MEDIUM"
    ) => {
        evidenceContext.addEvidence(
            repositoryType,
            label,
            weight,
            category,
            strength
        );
    };

    detectFintechEvidence(evidenceContext);
    detectDeveloperToolEvidence(evidenceContext);
    detectDeveloperPlatformEvidence(evidenceContext);
    detectObservabilityEvidence(evidenceContext);
    detectSecurityEvidence(evidenceContext);
    detectAiEvidence(evidenceContext);
    detectMobileEvidence(evidenceContext);
    detectTransportEvidence(evidenceContext);
    detectDataEngineeringEvidence(evidenceContext);
    detectBackendServiceEvidence(evidenceContext);
    detectFrontendEvidence(evidenceContext);
    detectDocumentationEvidence(evidenceContext);
    detectDesignSystemEvidence(evidenceContext);
    detectPackageSdkEvidence(evidenceContext);
    detectInfrastructureEvidence(evidenceContext);
    detectMessagingEvidence(evidenceContext);
    detectHealthcareEvidence(evidenceContext);
    detectEducationEvidence(evidenceContext);
    detectEnergyEvidence(evidenceContext);
    detectEcommerceEvidence(evidenceContext);
    detectCollaborationEvidence(evidenceContext);


    // JavaScript / TypeScript backend
    if (
        includesAny(combinedText, [
            "package.json",
            "tsconfig",
            "express",
            "fastify",
            "nestjs",
            "node",
            ".ts",
        ])
    ) {
        add(technologies, ["Node.js", "TypeScript"]);
        add(architectureDomains, ["BACKEND_SYSTEMS"]);
        add(repositoryTypes, ["JAVASCRIPT_TYPESCRIPT_PROJECT"]);
    }

    // Frontend / product UI
    if (
        includesAny(combinedText, [
            "react",
            "next",
            ".tsx",
            ".jsx",
            "components/",
            "app/",
            "pages/",
            "tailwind",
            "vite",
        ])
    ) {
        add(technologies, ["React / Frontend UI"]);
        add(architectureDomains, ["FRONTEND_ARCHITECTURE"]);
        add(repositoryTypes, ["FRONTEND_APPLICATION"]);
    }

    // Python
    if (
        includesAny(combinedText, [
            "requirements.txt",
            "pyproject.toml",
            "poetry.lock",
            "pipfile",
            ".py",
            "fastapi",
            "django",
            "flask",
        ])
    ) {
        add(technologies, ["Python"]);
        add(architectureDomains, ["PYTHON_SYSTEMS"]);
        add(repositoryTypes, ["PYTHON_PROJECT"]);

        addReasoningSignal(
            "Detected Python-specific frameworks and patterns"
        );
    }

    if (includesAny(combinedText, ["fastapi"])) {
        add(technologies, ["FastAPI"]);
        add(architectureDomains, ["API_LAYER"]);
        add(repositoryTypes, ["PYTHON_API_SERVICE"]);

        addReasoningSignal(
            "Detected FastAPI framework and API service patterns"
        );
    }

    if (includesAny(combinedText, ["django"])) {
        add(technologies, ["Django"]);
        add(architectureDomains, ["WEB_APPLICATION"]);
        add(repositoryTypes, ["PYTHON_WEB_APPLICATION"]);
        addReasoningSignal(
            "Detected Django framework and web application patterns"
        );
    }

    if (includesAny(combinedText, ["flask"])) {
        add(technologies, ["Flask"]);
        add(architectureDomains, ["API_LAYER"]);
        add(repositoryTypes, ["PYTHON_API_SERVICE"]);
        addReasoningSignal(
            "Detected Flask framework and API service patterns"
        );
    }


    // Go
    const hasGoProjectSignal =
        filesChanged.some((file) => {
            const normalizedFile = file.toLowerCase();

            return (
                normalizedFile === "go.mod" ||
                normalizedFile === "go.sum" ||
                normalizedFile.endsWith(".go")
            );
        }) ||
        includesAny(combinedText, ["golang", "go module"]);

    if (hasGoProjectSignal) {
        add(technologies, ["Go"]);
        add(architectureDomains, ["GO_SYSTEMS"]);
        add(repositoryTypes, ["GO_SERVICE"]);

        addReasoningSignal(
            "Detected Go-specific files and patterns"
        );
    }

    // Java / Spring
    if (
        includesAny(combinedText, [
            "pom.xml",
            "build.gradle",
            ".java",
            "spring",
            "springboot",
            "spring boot",
        ])
    ) {
        add(technologies, ["Java / Spring"]);
        add(architectureDomains, ["JAVA_SYSTEMS"]);
        add(repositoryTypes, ["JAVA_SERVICE"]);

        addReasoningSignal(
            "Detected Java and Spring framework patterns"
        );
    }

    // Rust
    if (
        includesAny(combinedText, [
            "cargo.toml",
            "cargo.lock",
            ".rs",
            "tokio",
            "axum",
            "actix",
        ])
    ) {
        add(technologies, ["Rust"]);
        add(architectureDomains, ["RUST_SYSTEMS"]);
        add(repositoryTypes, ["RUST_SERVICE"]);
        addReasoningSignal(
            "Detected Rust-specific files and patterns"
        );
    }

    // PHP / Laravel
    if (
        includesAny(combinedText, [
            "composer.json",
            ".php",
            "laravel",
            "symfony",
        ])
    ) {
        add(technologies, ["PHP"]);
        add(architectureDomains, ["WEB_APPLICATION"]);
        add(repositoryTypes, ["PHP_WEB_APPLICATION"]);
        addReasoningSignal(
            "Detected PHP-specific frameworks and patterns"
        );
    }

    // DevOps / Infrastructure
    if (
        includesAny(combinedText, [
            "dockerfile",
            "docker-compose",
            "docker",
        ])
    ) {
        add(technologies, ["Docker"]);
        add(architectureDomains, ["DEVOPS_INFRASTRUCTURE"]);
        add(engineeringSignals, ["CONTAINERIZATION"]);

        addReasoningSignal(
            "Detected Dockerfiles and containerization patterns"
        );
    }

    if (
        includesAny(combinedText, [
            "terraform",
            ".tf",
            "provider.tf",
            "variables.tf",
        ])
    ) {
        add(technologies, ["Terraform"]);
        add(architectureDomains, ["INFRASTRUCTURE_AS_CODE"]);
        add(repositoryTypes, ["INFRASTRUCTURE_REPOSITORY"]);
        addReasoningSignal(
            "Detected Terraform configuration files"
        );
    }

    if (
        includesAny(combinedText, [
            "kubernetes",
            "k8s",
            "deployment.yaml",
            "service.yaml",
            "helm",
            "chart.yaml",
        ])
    ) {
        add(technologies, ["Kubernetes / Helm"]);
        add(architectureDomains, ["CONTAINER_ORCHESTRATION"]);
        add(repositoryTypes, ["INFRASTRUCTURE_REPOSITORY"]);
        addReasoningSignal(
            "Detected Kubernetes and Helm configuration files"
        );
    }

    if (
        includesAny(combinedText, [
            ".github/workflows",
            "github actions",
            "ci.yml",
            "cd.yml",
            "pipeline.yml",
        ])
    ) {
        add(technologies, ["CI/CD"]);
        add(architectureDomains, ["CI_CD"]);
        add(engineeringSignals, ["AUTOMATED_DELIVERY"]);

        addReasoningSignal(
            "Detected CI/CD pipeline configuration files and patterns"
        );
    }

    // Realtime
    if (
        includesAny(combinedText, [
            "socket.io",
            "websocket",
            "realtime",
            "socket-emitter",
            "socket.on",
            "socket.emit",
        ])
    ) {
        add(technologies, ["Socket.IO / Realtime Events"]);
        add(architectureDomains, ["REALTIME_SYSTEMS"]);
        add(engineeringSignals, ["REALTIME_INFRASTRUCTURE"]);
        addReasoningSignal(
            "Detected realtime websocket infrastructure"
        );
    }

    // Queue / background jobs
    if (
        includesAny(combinedText, [
            "bullmq",
            "queue",
            "worker",
            "job",
            "celery",
            "sidekiq",
            "rq",
            "resque",
        ])
    ) {
        add(technologies, ["Background Jobs / Queue"]);
        add(architectureDomains, ["QUEUE_INFRASTRUCTURE"]);
        add(engineeringSignals, ["BACKGROUND_PROCESSING"]);

        addReasoningSignal(
            "Detected background job and queue processing patterns"
        );
    }

    // Cache / messaging
    if (includesAny(combinedText, ["redis", "ioredis", "cache"])) {
        add(technologies, ["Redis"]);
        add(architectureDomains, ["CACHING_LAYER"]);
    }

    if (
        includesAny(combinedText, [
            "rabbitmq",
            "nats",
            "sqs",
            "pubsub",
            "kafka",
        ])
    ) {
        add(technologies, ["Messaging / Event Streaming"]);
        add(architectureDomains, ["EVENT_STREAMING"]);
        add(engineeringSignals, ["EVENT_DRIVEN"]);

        addReasoningSignal(
            "Detected messaging and event streaming patterns"
        );
    }

    // Database
    if (
        includesAny(combinedText, [
            "prisma",
            "schema.prisma",
            "migration",
            "postgres",
            "mongodb",
            "mysql",
            "sqlite",
            "typeorm",
            "sequelize",
            "mongoose",
        ])
    ) {
        add(technologies, ["Database"]);
        add(architectureDomains, ["DATABASE_LAYER"]);

        addReasoningSignal(
            "Detected database schema and migration patterns"
        );
    }

    // Design systems / product design repos
    if (
        includesAny(combinedText, [
            "storybook",
            "design-system",
            "tokens",
            "figma",
            "theme",
            "component-library",
            "ui-kit",
        ])
    ) {
        add(technologies, ["Design System"]);
        add(architectureDomains, ["DESIGN_SYSTEM"]);
        add(repositoryTypes, ["DESIGN_SYSTEM_REPOSITORY"]);

        addReasoningSignal(
            "Detected design system and product design patterns"
        );
    }

    // Documentation-heavy repos
    if (
        includesAny(combinedText, [
            "docs/",
            "documentation",
            "mkdocs",
            "docusaurus",
            "readme",
        ])
    ) {
        add(technologies, ["Documentation"]);
        add(architectureDomains, ["DOCUMENTATION_SYSTEM"]);
        add(repositoryTypes, ["DOCUMENTATION_REPOSITORY"]);

        addReasoningSignal(
            "Detected documentation-focused repository patterns"
        );
    }

    if (
        includesAny(combinedText, [
            "crdt",
            "collaboration",
            "shared editing",
            "presence",
            "live cursor",
            "yjs",
            "collaborative",
        ])
    ) {
        add(technologies, ["Realtime Collaboration"]);
        add(architectureDomains, ["COLLABORATION_SYSTEMS"]);
        add(engineeringSignals, ["LIVE_COLLABORATION"]);
        add(repositoryTypes, ["COLLABORATION_PLATFORM"]);
        addReasoningSignal(
            "Detected realtime collaboration patterns"
        );
    }


    if (
        includesAny(combinedText, [
            "energy",
            "power",
            "electricity",
            "meter",
            "household",
            "consumption",
            "iot",
            "smart grid",
        ])
    ) {
        add(technologies, ["Energy Monitoring"]);
        add(architectureDomains, ["ENERGY_SYSTEMS"]);
        add(engineeringSignals, ["REALTIME_MONITORING"]);
        add(repositoryTypes, ["ENERGY_PLATFORM"]);
        addReasoningSignal(
            "Detected energy monitoring patterns"
        );
    }

    const hasEngineeringIntelligenceCoreSignal = includesAny(combinedText, [
        "repository intelligence",
        "engineering intelligence",
        "architecture evolution",
        "architecture radar",
        "architecture narrative",
        "repository fingerprint",
        "codebase intelligence",
    ]);

    const hasGithubRepositoryAnalysisSignal = includesAny(combinedText, [
        "github webhook",
        "github oauth",
        "repository import",
        "pull request analysis",
        "commit analysis",
        "engineering timeline",
        "architecture change",
    ]);

    if (hasEngineeringIntelligenceCoreSignal && hasGithubRepositoryAnalysisSignal) {
        add(technologies, ["Engineering Intelligence"]);
        add(architectureDomains, ["ENGINEERING_INTELLIGENCE"]);
        add(engineeringSignals, ["ARCHITECTURE_REASONING"]);
        add(repositoryTypes, ["ENGINEERING_INTELLIGENCE_PLATFORM"]);

        addReasoningSignal(
            "Detected core engineering intelligence concepts and GitHub repository analysis patterns"
        );
    }

    const evidenceResults = calculateEvidenceResults(evidenceContext.evidenceItems);

    // const {
    //     repositoryIdentity,
    //     rankedEvidence,
    // } = rankRepositoryEvidence(
    //     calculateEvidenceResults(evidenceContext.evidenceItems)
    // );

    for (const result of evidenceResults) {
        switch (result.repositoryType) {
            case RepositoryTypes.FINTECH_PLATFORM:
                add(technologies, [Technologies.FINANCIAL_INFRASTRUCTURE]);
                add(architectureDomains, [ArchitectureDomains.FINANCIAL_SYSTEMS]);
                add(engineeringSignals, [EngineeringSignals.FINANCIAL_PROCESSING]);
                break;

            case RepositoryTypes.DEVTOOL_PLATFORM:
                add(technologies, [Technologies.DEVELOPER_TOOLING]);
                add(architectureDomains, [ArchitectureDomains.DEVELOPER_INFRASTRUCTURE]);
                add(engineeringSignals, [EngineeringSignals.CODE_GENERATION]);
                break;

            case RepositoryTypes.DEVELOPER_PLATFORM:
                add(technologies, [Technologies.DEVELOPER_INFRASTRUCTURE]);
                add(architectureDomains, [ArchitectureDomains.DEVELOPER_INFRASTRUCTURE]);
                add(engineeringSignals, [EngineeringSignals.PLATFORM_ENGINEERING]);
                break;

            case RepositoryTypes.OBSERVABILITY_PLATFORM:
                add(technologies, [Technologies.OBSERVABILITY]);
                add(architectureDomains, [ArchitectureDomains.OBSERVABILITY_SYSTEMS]);
                add(engineeringSignals, [EngineeringSignals.SYSTEM_MONITORING]);
                break;

            case RepositoryTypes.SECURITY_PLATFORM:
                add(technologies, [Technologies.SECURITY_SYSTEMS]);
                add(architectureDomains, [ArchitectureDomains.SECURITY_SYSTEMS]);
                add(engineeringSignals, [EngineeringSignals.THREAT_DETECTION]);
                break;

            case RepositoryTypes.AI_ML_PROJECT:
                add(technologies, [Technologies.AI_ML]);
                add(architectureDomains, [ArchitectureDomains.AI_INFRASTRUCTURE]);
                add(engineeringSignals, [EngineeringSignals.MACHINE_LEARNING]);
                break;

            case RepositoryTypes.MOBILE_APPLICATION:
                add(technologies, [Technologies.MOBILE_APPLICATION]);
                add(architectureDomains, [ArchitectureDomains.MOBILE_ARCHITECTURE]);
                add(engineeringSignals, [EngineeringSignals.MOBILE_ENGINEERING]);
                break;

            case RepositoryTypes.DATA_ENGINEERING_PROJECT:
                add(technologies, [Technologies.DATA_ENGINEERING]);
                add(architectureDomains, [ArchitectureDomains.DATA_PIPELINES]);
                add(engineeringSignals, [EngineeringSignals.DATA_WORKFLOW]);
                break;

            case RepositoryTypes.SMART_TRANSPORT_PLATFORM:
                add(technologies, [Technologies.TRANSPORT_SYSTEMS]);
                add(architectureDomains, [ArchitectureDomains.MOBILITY_SYSTEMS]);
                add(engineeringSignals, [EngineeringSignals.ROUTE_OPTIMIZATION]);
                break;

            case RepositoryTypes.BACKEND_SERVICE:
                add(technologies, [Technologies.BACKEND_SERVICES]);
                add(architectureDomains, [ArchitectureDomains.SERVICE_ARCHITECTURE]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.BACKEND_APPLICATION_DEVELOPMENT]
                );
                break;

            case RepositoryTypes.FRONTEND_APPLICATION:
                add(technologies, [Technologies.FRONTEND_ENGINEERING]);
                add(architectureDomains, [ArchitectureDomains.FRONTEND_ARCHITECTURE]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.USER_INTERFACE_ENGINEERING]
                );
                break;

            case RepositoryTypes.DOCUMENTATION_HEAVY_REPOSITORY:
                add(technologies, [Technologies.TECHNICAL_DOCUMENTATION]);
                add(architectureDomains, [ArchitectureDomains.KNOWLEDGE_MANAGEMENT]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.DOCUMENTATION_ENGINEERING]
                );
                break;

            case RepositoryTypes.DESIGN_SYSTEM:
                add(technologies, [Technologies.DESIGN_SYSTEMS]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.DESIGN_SYSTEM_ARCHITECTURE]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.COMPONENT_DRIVEN_DEVELOPMENT]
                );
                break;

            case RepositoryTypes.PACKAGE_LIBRARY:
                add(technologies, [Technologies.PACKAGE_LIBRARIES]);
                add(architectureDomains, [ArchitectureDomains.LIBRARY_ARCHITECTURE]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.REUSABLE_SOFTWARE_COMPONENTS]
                );
                break;

            case RepositoryTypes.INFRASTRUCTURE_PLATFORM:
                add(technologies, [Technologies.INFRASTRUCTURE_AUTOMATION]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.PLATFORM_INFRASTRUCTURE]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.INFRASTRUCTURE_AS_CODE]
                );
                break;

            case RepositoryTypes.MESSAGING_PLATFORM:
                add(technologies, [Technologies.MESSAGING_SYSTEMS]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.EVENT_DRIVEN_ARCHITECTURE]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.ASYNCHRONOUS_COMMUNICATION]
                );
                break;

            case RepositoryTypes.ECOMMERCE_PLATFORM:
                add(technologies, [Technologies.COMMERCE_SYSTEMS]);
                add(architectureDomains, [ArchitectureDomains.DIGITAL_COMMERCE]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.TRANSACTION_PROCESSING]
                );
                break;

            case RepositoryTypes.EDUCATION_PLATFORM:
                add(technologies, [Technologies.EDUCATIONAL_TECHNOLOGY]);
                add(architectureDomains, [ArchitectureDomains.LEARNING_SYSTEMS]);
                add(
                    engineeringSignals,
                    [EngineeringSignals.DIGITAL_LEARNING]
                );
                break;

            case RepositoryTypes.HEALTHCARE_PLATFORM:
                add(technologies, [Technologies.HEALTHCARE_TECHNOLOGY]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.HEALTH_INFORMATION_SYSTEMS]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.CLINICAL_INFORMATION_MANAGEMENT]
                );
                break;

            case RepositoryTypes.ENERGY_PLATFORM:
                add(technologies, [Technologies.ENERGY_SYSTEMS]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.SMART_ENERGY_SYSTEMS]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.ENERGY_MONITORING]
                );
                break;

            case RepositoryTypes.COLLABORATION_PLATFORM:
                add(technologies, [Technologies.COLLABORATION_SYSTEMS]);
                add(
                    architectureDomains,
                    [ArchitectureDomains.COLLABORATIVE_COMPUTING]
                );
                add(
                    engineeringSignals,
                    [EngineeringSignals.REALTIME_COLLABORATION]
                );
                break;
        }

        add(repositoryTypes, [result.repositoryType]);

        for (const evidence of result.evidence) {
            addReasoningSignal(evidence);
        }
    }

    const capabilities = detectEngineeringCapabilities({
        filesChanged,
        commitMessages,
        repositoryContext: combinedText,
    });

    const repositoryPersona = inferRepositoryPersona(
        Array.from(repositoryTypes) as RepositoryType[],
        capabilities.map((capability) => capability.key)
    );

    const repositoryDNA = buildRepositoryDNA({
        repositoryTypes: Array.from(repositoryTypes),
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        capabilities,
    });

    const qualityContext = createEngineeringQualityContext({
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        repositoryTypes: Array.from(repositoryTypes),
        capabilities,
        repositoryDNA,
        repositoryPersona,
    });

    runQualityDetectors(qualityContext);

    const engineeringQuality = buildEngineeringQuality(qualityContext);

    for (const technology of evidenceContext.technologyEvidence) {
        add(technologies, [technology.name]);
        addReasoningSignal(technology.reason);
    }



    const productionReadiness =
        buildProductionReadiness({

            engineeringQuality,

        });

    const repositoryMaturity = buildRepositoryMaturity({
        engineeringQuality,
        productionReadiness,
        repositoryTypes: Array.from(repositoryTypes),
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        engineeringSignals: Array.from(engineeringSignals),
        reasoningSignals,
    });

    const technicalDebt = buildTechnicalDebtReport({
        engineeringQuality,
        productionReadiness,
        repositoryMaturity,
    });

    const strengthReport =
        buildStrengthReport({

            engineeringQuality,

            repositoryMaturity,

            productionReadiness,

        });

    const weaknessReport = buildWeaknessReport({
        engineeringQuality,
        repositoryMaturity,
        productionReadiness,
        technicalDebt,
    });



    const repositoryHealth = buildRepositoryHealth({
        engineeringQuality,
        productionReadiness,
        repositoryMaturity,
        technicalDebt,
        strengthReport,
        weaknessReport,
    });

    const architectureDrift = buildArchitectureDriftReport({
        architectureDomains: Array.from(architectureDomains),
        repositoryTypes: Array.from(repositoryTypes),
        technologies: Array.from(technologies),
        reasoningSignals,
    });

    const evolutionInsights = analyzeRepositoryEvolution({
        architectureDomains: Array.from(architectureDomains),
        repositoryTypes: Array.from(repositoryTypes),
        technologies: Array.from(technologies),
        reasoningSignals,
        repositoryDNA,
        engineeringQuality,
        repositoryMaturity,
        repositoryHealth,
        architectureDrift,
    });

    const recommendationReport = buildRecommendationReport({
        weaknessReport,
        technicalDebt,
        productionReadiness,
        engineeringQuality,
        repositoryMaturity,
        repositoryHealth,
        architectureDrift,
        evolutionInsights,
    });

    const finalTechnologies = Array.from(technologies);
    const finalArchitectureDomains = Array.from(architectureDomains);
    const finalEngineeringSignals = Array.from(engineeringSignals);
    const finalRepositoryTypes = Array.from(repositoryTypes);

    const repositoryIntelligence = buildRepositoryIntelligenceReport({
        technologies: finalTechnologies,
        architectureDomains: finalArchitectureDomains,
        engineeringSignals: finalEngineeringSignals,
        reasoningSignals,
        repositoryTypes: finalRepositoryTypes,
        repositoryPersona,
        repositoryDNA,
        capabilities,
        evidenceResults,
        engineeringQuality,
        productionReadiness,
        repositoryMaturity,
        repositoryHealth,
        technicalDebt,
        architectureDrift,
        evolutionInsights,
        strengthReport,
        weaknessReport,
        recommendationReport,
    });



    return {
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        engineeringSignals: Array.from(engineeringSignals),
        repositoryTypes: Array.from(repositoryTypes),
        reasoningSignals,
        evidenceResults,
        capabilities,
        repositoryDNA,
        repositoryPersona,
        engineeringQuality,
        repositoryMaturity,
        productionReadiness,
        technicalDebt,
        strengthReport,
        weaknessReport,
        recommendationReport,
        repositoryHealth,
        architectureDrift,
        evolutionInsights,
        repositoryIntelligence,
        //repositoryIdentity,
        //rankedEvidence,
    };
};