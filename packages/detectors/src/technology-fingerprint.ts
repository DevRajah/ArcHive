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
  Technologies,
} from "./constants";

import { detectEngineeringCapabilities } from "./capabilities";
import { buildRepositoryDNA,
    RepositoryDNA } from "./dna"

export type TechnologyFingerprintResult = {
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];
    reasoningSignals: string[];
    evidenceResults: EvidenceResult[];
    capabilities: ReturnType<typeof detectEngineeringCapabilities>;
    repositoryDNA: RepositoryDNA
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

    for (const result of evidenceResults) {
        switch (result.repositoryType) {
            case "FINTECH_PLATFORM":
                add(technologies, ["Financial Infrastructure"]);
                add(architectureDomains, ["FINANCIAL_SYSTEMS"]);
                add(engineeringSignals, ["FINANCIAL_PROCESSING"]);
                break;

            case "DEVTOOL_PLATFORM":
                add(technologies, ["Developer Tooling"]);
                add(architectureDomains, ["DEVELOPER_INFRASTRUCTURE"]);
                add(engineeringSignals, ["CODE_GENERATION"]);
                break;

            case "DEVELOPER_PLATFORM":
                add(technologies, ["Developer Infrastructure"]);
                add(architectureDomains, ["DEVELOPER_INFRASTRUCTURE"]);
                add(engineeringSignals, ["PLATFORM_ENGINEERING"]);
                break;

            case "OBSERVABILITY_PLATFORM":
                add(technologies, ["Observability"]);
                add(architectureDomains, ["OBSERVABILITY_SYSTEMS"]);
                add(engineeringSignals, ["SYSTEM_MONITORING"]);
                break;

            case "AI_ML_PROJECT":
                add(technologies, ["AI / ML"]);
                add(architectureDomains, ["AI_INFRASTRUCTURE"]);
                add(engineeringSignals, ["MACHINE_LEARNING"]);
                break;

            case "SECURITY_PLATFORM":
                add(technologies, ["Security Systems"]);
                add(architectureDomains, ["SECURITY_SYSTEMS"]);
                add(engineeringSignals, ["THREAT_DETECTION"]);
                break;

            case "MOBILE_APPLICATION":
                add(technologies, ["Mobile Application"]);
                add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
                add(engineeringSignals, ["MOBILE_ENGINEERING"]);
                break;

            case "DATA_ENGINEERING_PROJECT":
                add(technologies, ["Data Engineering"]);
                add(architectureDomains, ["DATA_PIPELINES"]);
                add(engineeringSignals, ["DATA_WORKFLOW"]);
                break;
            case "SECURITY_PLATFORM":
                add(technologies, ["Security Systems"]);
                add(architectureDomains, ["SECURITY_SYSTEMS"]);
                add(engineeringSignals, ["THREAT_DETECTION"]);
                break;

            case "AI_ML_PROJECT":
                add(technologies, ["AI / ML"]);
                add(architectureDomains, ["AI_INFRASTRUCTURE"]);
                add(engineeringSignals, ["MACHINE_LEARNING"]);
                break;

            case "MOBILE_APPLICATION":
                add(technologies, ["Mobile Application"]);
                add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
                add(engineeringSignals, ["MOBILE_ENGINEERING"]);
                break;

            case "SMART_TRANSPORT_PLATFORM":
                add(technologies, ["Transport Systems"]);
                add(architectureDomains, ["MOBILITY_SYSTEMS"]);
                add(engineeringSignals, ["ROUTE_OPTIMIZATION"]);
                break;

            case "DATA_ENGINEERING_PROJECT":
                add(technologies, ["Data Engineering"]);
                add(architectureDomains, ["DATA_PIPELINES"]);
                add(engineeringSignals, ["DATA_WORKFLOW"]);
                break;

            case "BACKEND_SERVICE":
                add(technologies, ["Backend Services"]);
                add(architectureDomains, ["SERVICE_ARCHITECTURE"]);
                add(engineeringSignals, ["BACKEND_APPLICATION_DEVELOPMENT"]);
                break;

            case "FRONTEND_APPLICATION":
                add(technologies, ["Frontend Engineering"]);
                add(architectureDomains, ["FRONTEND_ARCHITECTURE"]);
                add(engineeringSignals, ["USER_INTERFACE_ENGINEERING"]);
                break;

            case "DOCUMENTATION_HEAVY_REPOSITORY":
                add(technologies, ["Technical Documentation"]);
                add(architectureDomains, ["KNOWLEDGE_MANAGEMENT"]);
                add(engineeringSignals, ["DOCUMENTATION_ENGINEERING"]);
                break;

            case "DESIGN_SYSTEM":
                add(technologies, ["Design Systems"]);
                add(architectureDomains, ["DESIGN_SYSTEM_ARCHITECTURE"]);
                add(engineeringSignals, ["COMPONENT_DRIVEN_DEVELOPMENT"]);
                break;

            case "PACKAGE_LIBRARY":
                add(technologies, ["Package Libraries"]);
                add(architectureDomains, ["LIBRARY_ARCHITECTURE"]);
                add(engineeringSignals, ["REUSABLE_SOFTWARE_COMPONENTS"]);
                break;

            case "INFRASTRUCTURE_PLATFORM":
                add(technologies, ["Infrastructure Automation"]);
                add(architectureDomains, ["PLATFORM_INFRASTRUCTURE"]);
                add(engineeringSignals, ["INFRASTRUCTURE_AS_CODE"]);
                break;

            case "MESSAGING_PLATFORM":
                add(technologies, ["Messaging Systems"]);
                add(architectureDomains, ["EVENT_DRIVEN_ARCHITECTURE"]);
                add(engineeringSignals, ["ASYNCHRONOUS_COMMUNICATION"]);
                break;

            case "ECOMMERCE_PLATFORM":
                add(technologies, ["Commerce Systems"]);
                add(architectureDomains, ["DIGITAL_COMMERCE"]);
                add(engineeringSignals, ["TRANSACTION_PROCESSING"]);
                break;

            case "EDUCATION_PLATFORM":
                add(technologies, ["Educational Technology"]);
                add(architectureDomains, ["LEARNING_SYSTEMS"]);
                add(engineeringSignals, ["DIGITAL_LEARNING"]);
                break;

            case "HEALTHCARE_PLATFORM":
                add(technologies, ["Healthcare Technology"]);
                add(architectureDomains, ["HEALTH_INFORMATION_SYSTEMS"]);
                add(engineeringSignals, ["CLINICAL_INFORMATION_MANAGEMENT"]);
                break;

            case "ENERGY_PLATFORM":
                add(technologies, ["Energy Systems"]);
                add(architectureDomains, ["SMART_ENERGY_SYSTEMS"]);
                add(engineeringSignals, ["ENERGY_MONITORING"]);
                break;

            case "COLLABORATION_PLATFORM":
                add(technologies, ["Collaboration Systems"]);
                add(architectureDomains, ["COLLABORATIVE_COMPUTING"]);
                add(engineeringSignals, ["REALTIME_COLLABORATION"]);
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

    const repositoryDNA = buildRepositoryDNA({
        repositoryTypes: Array.from(repositoryTypes),
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        capabilities,
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
    };
};