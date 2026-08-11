import type { EvidenceContext } from "../evidence";
import { ProductionReadiness } from "./types";
import type {
    CapabilityResult,
} from "../capabilities";

const determineLevel = (
    score: number
): ProductionReadiness["level"] => {
    if (score >= 90) return "ENTERPRISE_READY";
    if (score >= 75) return "PRODUCTION_READY";
    if (score >= 50) return "PARTIALLY_READY";

    return "NOT_READY";
};

const determineSummary = (
    level: ProductionReadiness["level"]
) => {
    switch (level) {
        case "ENTERPRISE_READY":
            return "Repository demonstrates strong operational evidence for mature production environments.";

        case "PRODUCTION_READY":
            return "Repository shows substantial production-readiness evidence with only limited operational gaps.";

        case "PARTIALLY_READY":
            return "Repository has some production-oriented infrastructure, but important operational concerns remain.";

        default:
            return "Repository has limited evidence that it is currently prepared for reliable production operation.";
    }
};



const includesAny = (
    values: string[],
    expected: string[]
) => {
    return values.some((value) => {
        const normalizedValue = value.toLowerCase();

        return expected.some((candidate) =>
            normalizedValue.includes(
                candidate.toLowerCase()
            )
        );
    });
};

const textIncludesAny = (
    value: string,
    expected: string[]
) => {
    const normalizedValue = value.toLowerCase();

    return expected.some((candidate) =>
        normalizedValue.includes(
            candidate.toLowerCase()
        )
    );
};

export const buildProductionReadiness = ({
    evidenceContext,
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    reasoningSignals,
    capabilities,
}: {
    evidenceContext: EvidenceContext;
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];
    reasoningSignals: string[];
    capabilities: CapabilityResult[];
}): ProductionReadiness => {
    let score = 0;

    const blockers: string[] = [];
    const strengths: string[] = [];

    /**
   * Check canonical capability evidence produced by ArcHive's capability
   * detectors.
   *
   * Future me:
   * Production Readiness should not have to rediscover capabilities that the
   * intelligence pipeline has already established from repository evidence.
   */
    const hasCapability = (key: string) =>
        capabilities.some(
            (capability) =>
                capability.key === key
        );

    /**
     * ============================================================
     * BUILD ONE SEARCHABLE BODY OF STRUCTURAL EVIDENCE
     * ============================================================
     *
     * Future me:
     * Production readiness must be grounded in repository evidence,
     * not in the Engineering Quality score.
     *
     * These values come from actual repository paths, configuration
     * files, parsed dependencies, imports, and detector reasoning.
     */
    const repositoryPaths = [
        ...evidenceContext.filesChanged,
        ...evidenceContext.dependencyFiles,
        ...evidenceContext.configurationFiles,
        ...evidenceContext.repositoryFiles.map(
            (file) => file.path
        ),
    ];

    const configurationText = Array.from(
        evidenceContext.configurationContents.entries()
    )
        .map(([path, content]) => `${path} ${content}`)
        .join(" ");

    const operationalText = [
        ...repositoryPaths,
        ...reasoningSignals,
        ...engineeringSignals,
        configurationText,
    ]
        .filter(Boolean)
        .join(" ");

    /**
     * ============================================================
     * 1. DEPLOYMENT AND INFRASTRUCTURE, MAX 25
     * ============================================================
     */

    const hasContainerisation =
        includesAny(technologies, [
            "Docker",
            "Docker Compose",
        ]) ||
        textIncludesAny(operationalText, [
            "dockerfile",
            "docker-compose",
        ]);

    if (hasContainerisation) {
        score += 10;

        strengths.push(
            "Containerisation or container orchestration evidence was detected."
        );
    }

    const hasDeploymentInfrastructure =
        includesAny(technologies, [
            "Kubernetes",
            "Terraform",
            "Helm",
            "AWS",
            "Azure",
            "Google Cloud",
            "GCP",
            "Railway",
            "Render",
            "Vercel",
        ]) ||
        textIncludesAny(operationalText, [
            "deployment.yaml",
            "deployment.yml",
            "railway.json",
            "render.yaml",
            "vercel.json",
            "terraform",
            "kubernetes",
            "helm",
        ]);

    if (hasDeploymentInfrastructure) {
        score += 10;

        strengths.push(
            "Deployment platform or infrastructure configuration was detected."
        );
    } else {
        blockers.push(
            "Deployment or production infrastructure evidence is weak or missing."
        );
    }

    const hasEnvironmentConfiguration =
        textIncludesAny(operationalText, [
            ".env",
            "environment",
            "config",
            "configuration",
        ]);

    if (hasEnvironmentConfiguration) {
        score += 5;

        strengths.push(
            "Environment or runtime configuration evidence was detected."
        );
    }

    /**
     * ============================================================
     * 2. DELIVERY AUTOMATION, MAX 20
     * ============================================================
     */

    const hasCiCd =
        includesAny(technologies, [
            "GitHub Actions",
            "GitLab CI",
            "Azure Pipelines",
            "CI/CD",
        ]) ||
        textIncludesAny(operationalText, [
            ".github/workflows",
            "gitlab-ci",
            "azure-pipelines",
            "circleci",
            "ci/cd",
            "continuous integration",
            "continuous deployment",
        ]);

    if (hasCiCd) {
        score += 20;

        strengths.push(
            "Automated CI/CD or delivery pipeline evidence was detected."
        );
    } else {
        blockers.push(
            "Automated build, test, or deployment pipeline evidence is weak."
        );
    }

    /**
     * ============================================================
     * 3. OBSERVABILITY AND HEALTH VISIBILITY, MAX 20
     * ============================================================
     */

    const hasObservability =
        hasCapability("OBSERVABILITY") ||
        architectureDomains.includes(
            "OBSERVABILITY_SYSTEMS"
        ) ||
        includesAny(technologies, [
            "Observability",
            "OpenTelemetry",
            "Prometheus",
            "Grafana",
        ]);

    if (hasObservability) {
        score += 10;

        strengths.push(
            "Monitoring, metrics, tracing, or observability infrastructure was detected."
        );
    } else {
        blockers.push(
            "Operational observability evidence is weak or missing."
        );
    }

    const hasHealthChecks =
        textIncludesAny(operationalText, [
            "healthcheck",
            "health check",
            "/health",
            "health endpoint",
            "readiness",
            "liveness",
        ]);

    if (hasHealthChecks) {
        score += 5;

        strengths.push(
            "Application or infrastructure health-check evidence was detected."
        );
    }

    const hasOperationalVisibility =
        textIncludesAny(operationalText, [
            "metrics",
            "monitoring",
            "structured log",
            "logging",
            "tracing",
            "telemetry",
            "worker health",
        ]);

    if (hasOperationalVisibility) {
        score += 5;

        strengths.push(
            "Operational visibility signals such as metrics, logging, or monitoring were detected."
        );
    }

    /**
     * ============================================================
     * 4. SECURITY READINESS, MAX 15
     * ============================================================
     */

    const hasAuthentication =
        hasCapability("AUTHENTICATION") ||
        architectureDomains.includes(
            "AUTHENTICATION"
        ) ||
        includesAny(technologies, [
            "JWT",
            "OAuth",
            "Role-Based Access Control",
            "API Key Authentication",
        ]);

    if (hasAuthentication) {
        score += 8;

        strengths.push(
            "Authentication or authorization controls were detected."
        );
    }

    const hasSecurityHardening =
        includesAny(technologies, [
            "Rate Limiting",
            "Encryption",
        ]) ||
        textIncludesAny(operationalText, [
            "rate limit",
            "rate-limit",
            "encryption",
            "helmet",
            "csrf",
            "secure headers",
        ]);

    if (hasSecurityHardening) {
        score += 7;

        strengths.push(
            "Security hardening or request-protection evidence was detected."
        );
    }

    const isServiceLikeRepository =
        repositoryTypes.some((repositoryType) =>
            [
                "BACKEND_SERVICE",
                "FINTECH_PLATFORM",
                "OBSERVABILITY_PLATFORM",
                "SECURITY_PLATFORM",
                "ENGINEERING_INTELLIGENCE_PLATFORM",
                "ENERGY_PLATFORM",
                "SMART_TRANSPORT_PLATFORM",
            ].includes(repositoryType)
        );

    if (
        isServiceLikeRepository &&
        !hasAuthentication &&
        !hasSecurityHardening
    ) {
        blockers.push(
            "Security controls are weakly represented for a service-oriented repository."
        );
    }

    /**
     * ============================================================
     * 5. RESILIENCE, MAX 10
     * ============================================================
     */

    const hasAsyncInfrastructure =
        hasCapability("QUEUE_INFRASTRUCTURE") ||
        includesAny(technologies, [
            "BullMQ",
            "Kafka",
            "RabbitMQ",
        ]) ||
        architectureDomains.includes(
            "QUEUE_INFRASTRUCTURE"
        );

    if (hasAsyncInfrastructure) {
        score += 3;

        strengths.push(
            "Asynchronous processing or messaging infrastructure was detected."
        );
    }

    const hasResilienceSignals =
        textIncludesAny(operationalText, [
            "retry",
            "retries",
            "dead-letter",
            "dead letter",
            "failed job",
            "backoff",
            "graceful shutdown",
            "worker health",
        ]);

    if (hasResilienceSignals) {
        score += 7;

        strengths.push(
            "Retry, failure-handling, or operational resilience signals were detected."
        );
    }

    /**
     * ============================================================
     * 6. DATABASE / CHANGE MANAGEMENT, MAX 10
     * ============================================================
     */

    const hasMigrationStrategy =
        textIncludesAny(operationalText, [
            "/migrations/",
            "prisma/migrations",
            "migration.sql",
            "typeorm migration",
            "sequelize migration",
            "knex migration",
            "drizzle",
        ]);

    if (hasMigrationStrategy) {
        score += 5;

        strengths.push(
            "Database migration or schema-change management evidence was detected."
        );
    }

    const hasPersistentDataInfrastructure =
        hasCapability("DATABASE_LAYER") ||
        architectureDomains.includes(
            "DATABASE_LAYER"
        ) ||
        includesAny(technologies, [
            "PostgreSQL",
            "MongoDB",
            "MySQL",
            "Prisma",
            "Redis",
        ]);

    if (hasPersistentDataInfrastructure) {
        score += 5;

        strengths.push(
            "Persistent data or database infrastructure was detected."
        );
    }

    /**
     * Production readiness is now independently calculated from operational
     * evidence. Engineering Quality is deliberately not part of this formula.
     */
    score = Math.max(
        0,
        Math.min(100, Math.round(score))
    );

    const level = determineLevel(score);

    if (strengths.length === 0) {
        strengths.push(
            "No strong production-readiness evidence was detected."
        );
    }

    if (blockers.length === 0) {
        blockers.push(
            "No major production-readiness blockers were detected."
        );
    }

    return {
        score,
        level,
        summary: determineSummary(level),
        blockers: Array.from(new Set(blockers)),
        strengths: Array.from(new Set(strengths)),
    };
};