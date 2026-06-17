import { calculateEvidenceResults, EvidenceItem, EvidenceResult } from "./evidence-engine";
export type TechnologyFingerprintResult = {
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];
    reasoningSignals: string[];
    evidenceResults: EvidenceResult[];
};

const includesAny = (value: string, keywords: string[]) => {
    return keywords.some((keyword) =>
        value.toLowerCase().includes(keyword.toLowerCase())
    );
};

const add = (set: Set<string>, values: string[]) => {
    values.forEach((value) => set.add(value));
};

const reasoningSignals: string[] = [];

const addReasoningSignal = (signal: string) => {
    if (!reasoningSignals.includes(signal)) {
        reasoningSignals.push(signal);
    }
};

const evidenceItems: EvidenceItem[] = [];

const addEvidence = (
    repositoryType: string,
    label: string,
    weight: number
) => {
    evidenceItems.push({
        repositoryType,
        label,
        weight,
    });
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

    // AI / ML
    if (
        includesAny(combinedText, [
            "tensorflow",
            "pytorch",
            "torch",
            "scikit-learn",
            "sklearn",
        ])
    ) {
        addEvidence(
            "AI_ML_PROJECT",
            "Detected machine learning framework dependency",
            35
        );
    }

    if (
        includesAny(combinedText, [
            "huggingface",
            "transformers",
            "langchain",
            "llamaindex",
        ])
    ) {
        addEvidence(
            "AI_ML_PROJECT",
            "Detected AI framework or LLM application tooling",
            35
        );
    }

    if (
        includesAny(combinedText, [
            "model inference",
            "inference pipeline",
            "train model",
            "model training",
            "ml pipeline",
        ])
    ) {
        addEvidence(
            "AI_ML_PROJECT",
            "Detected model training or inference pipeline evidence",
            30
        );
    }

    if (filesChanged.some((file) => file.toLowerCase().endsWith(".ipynb"))) {
        addEvidence(
            "AI_ML_PROJECT",
            "Detected notebook-based AI/ML workflow",
            20
        );
    }

    // Data engineering
    if (
        includesAny(combinedText, [
            "airflow",
            "dag",
            "dbt",
            "spark",
            "pyspark",
            "kafka",
        ])
    ) {
        addEvidence(
            "DATA_ENGINEERING_PROJECT",
            "Detected data engineering framework or workflow orchestration dependency",
            35
        );
    }

    if (
        includesAny(combinedText, [
            "etl",
            "elt",
            "data warehouse",
            "snowflake",
            "bigquery",
            "data lake",
        ])
    ) {
        addEvidence(
            "DATA_ENGINEERING_PROJECT",
            "Detected ETL, warehouse, or data lake architecture evidence",
            30
        );
    }

    if (
        includesAny(combinedText, [
            "batch pipeline",
            "stream processing",
        ])
    ) {
        addEvidence(
            "DATA_ENGINEERING_PROJECT",
            "Detected batch or stream processing pipeline evidence",
            25
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

    // MOBILE_APPLICATION
    const hasStrongFlutterSignal =
        filesChanged.some((file) => {
            const normalizedFile = file.toLowerCase();

            return (
                normalizedFile === "pubspec.yaml" ||
                normalizedFile.endsWith(".dart") ||
                normalizedFile.startsWith("android/") ||
                normalizedFile.startsWith("ios/")
            );
        }) || includesAny(combinedText, ["flutter sdk"]);

    if (hasStrongFlutterSignal) {
        add(technologies, ["Flutter"]);
        add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
        add(repositoryTypes, ["MOBILE_APPLICATION"]);

        addReasoningSignal(
            "Detected Flutter/Dart mobile application structure"
        );
    }

    const hasStrongReactNativeSignal =
        filesChanged.some((file) => {
            const normalizedFile = file.toLowerCase();

            return (
                normalizedFile.includes("react-native.config") ||
                normalizedFile.includes("metro.config") ||
                normalizedFile.includes("app.json") ||
                normalizedFile.startsWith("android/") ||
                normalizedFile.startsWith("ios/")
            );
        }) || includesAny(combinedText, ["react-native", "expo"]);

    if (hasStrongReactNativeSignal) {
        add(technologies, ["React Native"]);
        add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
        add(repositoryTypes, ["MOBILE_APPLICATION"]);

        addReasoningSignal(
            "Detected React Native-specific files and patterns"
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

    // Fintech
    if (includesAny(combinedText, ["ledger", "double-entry"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected ledger or double-entry accounting terminology",
            30
        );
    }

    if (includesAny(combinedText, ["reconciliation", "reconcile"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected reconciliation workflow terminology",
            30
        );
    }

    if (includesAny(combinedText, ["settlement", "settlements"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected settlement workflow terminology",
            25
        );
    }

    if (includesAny(combinedText, ["payment webhook", "webhook signature"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected payment webhook or webhook signature evidence",
            25
        );
    }

    if (includesAny(combinedText, ["idempotency", "idempotency key"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected idempotency or payment safety evidence",
            25
        );
    }

    if (
        includesAny(combinedText, [
            "transaction processing",
            "financial transaction",
        ])
    ) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected financial transaction processing",
            20
        );
    }

    if (includesAny(combinedText, ["audit trail", "audit ledger"])) {
        addEvidence(
            "FINTECH_PLATFORM",
            "Detected financial audit trail",
            20
        );
    }


    // Observability platform
    const hasStrongObservabilitySignal =
        includesAny(combinedText, [
            "observability",
            "telemetry",
            "traces",
            "opentelemetry",
            "prometheus",
            "grafana",
            "metrics pipeline",
            "system monitoring",
            "queue monitoring",
            "worker health",
            "runtime metrics",
        ]) ||
        (
            includesAny(combinedText, [
                "monitoring",
                "metrics",
                "health",
            ]) &&
            includesAny(combinedText, [
                "queue",
                "worker",
                "service",
                "infrastructure",
                "system",
                "runtime",
            ])
        );

    if (hasStrongObservabilitySignal) {
        add(technologies, ["Observability"]);
        add(architectureDomains, ["OBSERVABILITY_SYSTEMS"]);
        add(engineeringSignals, ["SYSTEM_MONITORING"]);
        add(repositoryTypes, ["OBSERVABILITY_PLATFORM"]);

        addReasoningSignal(
            "Detected observability terminology including monitoring/metrics/telemetry"
        );
    }

    //Security Platform
    if (
        includesAny(combinedText, [
            "threat detection",
            "fraud detection",
            "anomaly detection",
            "intrusion detection",
        ])
    ) {
        addEvidence(
            "SECURITY_PLATFORM",
            "Detected threat, fraud, anomaly, or intrusion detection evidence",
            35
        );
    }

    if (
        includesAny(combinedText, [
            "vulnerability scanning",
            "malware",
            "security event",
            "security audit",
        ])
    ) {
        addEvidence(
            "SECURITY_PLATFORM",
            "Detected security scanning, malware, audit, or security event evidence",
            30
        );
    }

    if (
        includesAny(combinedText, [
            "risk scoring",
            "access policy",
            "rbac policy",
            "permission policy",
        ])
    ) {
        addEvidence(
            "SECURITY_PLATFORM",
            "Detected risk scoring or security policy evidence",
            25
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

    //Dev Tool Platform
    const hasStrongDevtoolSignal =
        includesAny(combinedText, [
            "scaffold",
            "scaffolding",
            "generator",
            "template",
            "codegen",
            "cli",
            "commander",
            "inquirer",
            "boilerplate generator",
            "create-app",
            "create app",
            "plugin",
            "developer tooling",
        ]) ||
        (
            includesAny(combinedText, ["template", "boilerplate"]) &&
            includesAny(combinedText, ["generator", "scaffold", "cli", "codegen"])
        )

    if (hasStrongDevtoolSignal) {
        add(technologies, ["Developer Tooling"]);
        add(architectureDomains, ["DEVELOPER_INFRASTRUCTURE"]);
        add(engineeringSignals, ["CODE_GENERATION"]);
        add(repositoryTypes, ["DEVTOOL_PLATFORM"]);

        addReasoningSignal("Detected CLI and scaffolding tooling patterns");
    }

    if (
        includesAny(combinedText, [
            "sdk",
            "platform",
            "developer platform",
            "tooling",
            "runtime",
            "service orchestration",
            "service composition",
            "infra tooling",
            "worker platform",
        ])
    ) {
        add(technologies, ["Developer Infrastructure"]);
        add(architectureDomains, ["DEVELOPER_INFRASTRUCTURE"]);
        add(engineeringSignals, ["PLATFORM_ENGINEERING"]);
        add(repositoryTypes, ["DEVELOPER_PLATFORM"]);

        addReasoningSignal(
            "Detected developer platform and infrastructure patterns"
        );
    }
    
    // Transport Platform
    const hasStrongTransportSignal =
        includesAny(combinedText, [
            "transit",
            "delay prediction",
            "public transport",
            "station",
            "bus",
            "train",
            "mobility",
        ]) ||
        (
            includesAny(combinedText, ["route", "journey"]) &&
            includesAny(combinedText, [
                "transport",
                "transit",
                "bus",
                "train",
            ])
        );

    if (hasStrongTransportSignal) {
        add(technologies, ["Transport Systems"]);
        add(architectureDomains, ["MOBILITY_SYSTEMS"]);
        add(engineeringSignals, ["ROUTE_OPTIMIZATION"]);
        add(repositoryTypes, ["SMART_TRANSPORT_PLATFORM"]);

        addReasoningSignal(
            "Detected transport or mobility terminology including transit/routes/stations"
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

    const evidenceResults = calculateEvidenceResults(evidenceItems);

    for (const result of evidenceResults) {
        if (result.repositoryType === "FINTECH_PLATFORM") {
            add(technologies, ["Financial Infrastructure"]);
            add(architectureDomains, ["FINANCIAL_SYSTEMS"]);
            add(engineeringSignals, ["FINANCIAL_PROCESSING"]);
        }

        add(repositoryTypes, [result.repositoryType]);

        for (const evidence of result.evidence) {
            addReasoningSignal(evidence);
        }
    }



    return {
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        engineeringSignals: Array.from(engineeringSignals),
        repositoryTypes: Array.from(repositoryTypes),
        reasoningSignals,
        evidenceResults,
    };
};