export type TechnologyFingerprintResult = {
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];
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
    }

    if (includesAny(combinedText, ["fastapi"])) {
        add(technologies, ["FastAPI"]);
        add(architectureDomains, ["API_LAYER"]);
        add(repositoryTypes, ["PYTHON_API_SERVICE"]);
    }

    if (includesAny(combinedText, ["django"])) {
        add(technologies, ["Django"]);
        add(architectureDomains, ["WEB_APPLICATION"]);
        add(repositoryTypes, ["PYTHON_WEB_APPLICATION"]);
    }

    if (includesAny(combinedText, ["flask"])) {
        add(technologies, ["Flask"]);
        add(architectureDomains, ["API_LAYER"]);
        add(repositoryTypes, ["PYTHON_API_SERVICE"]);
    }

    // AI / ML
    if (
        includesAny(combinedText, [
            "tensorflow",
            "torch",
            "pytorch",
            "sklearn",
            "scikit",
            "transformers",
            "langchain",
            "openai",
            "llm",
            "model",
            "inference",
            "notebook",
            ".ipynb",
        ])
    ) {
        add(technologies, ["AI / ML"]);
        add(architectureDomains, ["AI_INFRASTRUCTURE"]);
        add(engineeringSignals, ["MACHINE_LEARNING"]);
        add(repositoryTypes, ["AI_ML_PROJECT"]);
    }

    // Data engineering
    if (
        includesAny(combinedText, [
            "airflow",
            "dag",
            "dbt",
            "spark",
            "kafka",
            "etl",
            "pipeline",
            "warehouse",
            "snowflake",
            "bigquery",
        ])
    ) {
        add(technologies, ["Data Engineering"]);
        add(architectureDomains, ["DATA_PIPELINES"]);
        add(engineeringSignals, ["DATA_WORKFLOW"]);
        add(repositoryTypes, ["DATA_ENGINEERING_PROJECT"]);
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
    }

    // Mobile
    if (
        includesAny(combinedText, [
            "flutter",
            "pubspec.yaml",
            ".dart",
            "android/",
            "ios/",
        ])
    ) {
        add(technologies, ["Flutter"]);
        add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
        add(repositoryTypes, ["MOBILE_APPLICATION"]);
    }

    if (
        includesAny(combinedText, [
            "react-native",
            "expo",
            "metro.config",
        ])
    ) {
        add(technologies, ["React Native"]);
        add(architectureDomains, ["MOBILE_ARCHITECTURE"]);
        add(repositoryTypes, ["MOBILE_APPLICATION"]);
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
    }

    return {
        technologies: Array.from(technologies),
        architectureDomains: Array.from(architectureDomains),
        engineeringSignals: Array.from(engineeringSignals),
        repositoryTypes: Array.from(repositoryTypes),
    };
};