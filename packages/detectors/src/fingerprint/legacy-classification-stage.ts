import type {
  FingerprintState,
} from "./shared";

import {
  add,
  includesAny,
} from "./shared";

/**
 * Preserves ArcHive's older filename and keyword classifications.
 *
 * Future me:
 * This stage exists only for backward compatibility while the structured
 * evidence providers and evidence-aware detectors are being completed.
 *
 * New classification logic should not be added here.
 */
export const applyLegacyClassificationStage = ({
  filesChanged,
  combinedText,
  state,
}: {
  filesChanged: string[];
  combinedText: string;
  state: FingerprintState;
}): void => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    addReasoningSignal,
  } = state;

  /**
   * JavaScript and TypeScript backend.
   */
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
    add(technologies, [
      "Node.js",
      "TypeScript",
    ]);

    add(architectureDomains, [
      "BACKEND_SYSTEMS",
    ]);

    add(repositoryTypes, [
      "JAVASCRIPT_TYPESCRIPT_PROJECT",
    ]);
  }

  /**
   * Frontend and product UI.
   */
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
    add(technologies, [
      "React / Frontend UI",
    ]);

    add(architectureDomains, [
      "FRONTEND_ARCHITECTURE",
    ]);

    add(repositoryTypes, [
      "FRONTEND_APPLICATION",
    ]);
  }

  /**
   * Python project.
   */
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
    add(technologies, [
      "Python",
    ]);

    add(architectureDomains, [
      "PYTHON_SYSTEMS",
    ]);

    add(repositoryTypes, [
      "PYTHON_PROJECT",
    ]);

    addReasoningSignal(
      "Detected Python-specific frameworks and patterns",
    );
  }

  if (
    includesAny(
      combinedText,
      ["fastapi"],
    )
  ) {
    add(technologies, [
      "FastAPI",
    ]);

    add(architectureDomains, [
      "API_LAYER",
    ]);

    add(repositoryTypes, [
      "PYTHON_API_SERVICE",
    ]);

    addReasoningSignal(
      "Detected FastAPI framework and API service patterns",
    );
  }

  if (
    includesAny(
      combinedText,
      ["django"],
    )
  ) {
    add(technologies, [
      "Django",
    ]);

    add(architectureDomains, [
      "WEB_APPLICATION",
    ]);

    add(repositoryTypes, [
      "PYTHON_WEB_APPLICATION",
    ]);

    addReasoningSignal(
      "Detected Django framework and web application patterns",
    );
  }

  if (
    includesAny(
      combinedText,
      ["flask"],
    )
  ) {
    add(technologies, [
      "Flask",
    ]);

    add(architectureDomains, [
      "API_LAYER",
    ]);

    add(repositoryTypes, [
      "PYTHON_API_SERVICE",
    ]);

    addReasoningSignal(
      "Detected Flask framework and API service patterns",
    );
  }

  /**
   * Go project.
   */
  const hasGoProjectSignal =
    filesChanged.some((file) => {
      const normalizedFile =
        file.toLowerCase();

      return (
        normalizedFile === "go.mod" ||
        normalizedFile === "go.sum" ||
        normalizedFile.endsWith(".go")
      );
    }) ||
    includesAny(combinedText, [
      "golang",
      "go module",
    ]);

  if (hasGoProjectSignal) {
    add(technologies, [
      "Go",
    ]);

    add(architectureDomains, [
      "GO_SYSTEMS",
    ]);

    add(repositoryTypes, [
      "GO_SERVICE",
    ]);

    addReasoningSignal(
      "Detected Go-specific files and patterns",
    );
  }

  /**
   * Java and Spring.
   */
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
    add(technologies, [
      "Java / Spring",
    ]);

    add(architectureDomains, [
      "JAVA_SYSTEMS",
    ]);

    add(repositoryTypes, [
      "JAVA_SERVICE",
    ]);

    addReasoningSignal(
      "Detected Java and Spring framework patterns",
    );
  }

  /**
   * Rust project.
   */
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
    add(technologies, [
      "Rust",
    ]);

    add(architectureDomains, [
      "RUST_SYSTEMS",
    ]);

    add(repositoryTypes, [
      "RUST_SERVICE",
    ]);

    addReasoningSignal(
      "Detected Rust-specific files and patterns",
    );
  }

  /**
   * PHP and related web frameworks.
   */
  if (
    includesAny(combinedText, [
      "composer.json",
      ".php",
      "laravel",
      "symfony",
    ])
  ) {
    add(technologies, [
      "PHP",
    ]);

    add(architectureDomains, [
      "WEB_APPLICATION",
    ]);

    add(repositoryTypes, [
      "PHP_WEB_APPLICATION",
    ]);

    addReasoningSignal(
      "Detected PHP-specific frameworks and patterns",
    );
  }

  /**
   * Docker and containerisation.
   */
  if (
    includesAny(combinedText, [
      "dockerfile",
      "docker-compose",
      "docker",
    ])
  ) {
    add(technologies, [
      "Docker",
    ]);

    add(architectureDomains, [
      "DEVOPS_INFRASTRUCTURE",
    ]);

    add(engineeringSignals, [
      "CONTAINERIZATION",
    ]);

    addReasoningSignal(
      "Detected Dockerfiles and containerization patterns",
    );
  }

  /**
   * Terraform.
   */
  if (
    includesAny(combinedText, [
      "terraform",
      ".tf",
      "provider.tf",
      "variables.tf",
    ])
  ) {
    add(technologies, [
      "Terraform",
    ]);

    add(architectureDomains, [
      "INFRASTRUCTURE_AS_CODE",
    ]);

    add(repositoryTypes, [
      "INFRASTRUCTURE_REPOSITORY",
    ]);

    addReasoningSignal(
      "Detected Terraform configuration files",
    );
  }

  /**
   * Kubernetes and Helm.
   */
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
    add(technologies, [
      "Kubernetes / Helm",
    ]);

    add(architectureDomains, [
      "CONTAINER_ORCHESTRATION",
    ]);

    add(repositoryTypes, [
      "INFRASTRUCTURE_REPOSITORY",
    ]);

    addReasoningSignal(
      "Detected Kubernetes and Helm configuration files",
    );
  }

  /**
   * CI/CD.
   */
  if (
    includesAny(combinedText, [
      ".github/workflows",
      "github actions",
      "ci.yml",
      "cd.yml",
      "pipeline.yml",
    ])
  ) {
    add(technologies, [
      "CI/CD",
    ]);

    add(architectureDomains, [
      "CI_CD",
    ]);

    add(engineeringSignals, [
      "AUTOMATED_DELIVERY",
    ]);

    addReasoningSignal(
      "Detected CI/CD pipeline configuration files and patterns",
    );
  }

  /**
   * Realtime infrastructure.
   */
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
    add(technologies, [
      "Socket.IO / Realtime Events",
    ]);

    add(architectureDomains, [
      "REALTIME_SYSTEMS",
    ]);

    add(engineeringSignals, [
      "REALTIME_INFRASTRUCTURE",
    ]);

    addReasoningSignal(
      "Detected realtime websocket infrastructure",
    );
  }

  /**
   * Queues and background jobs.
   */
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
    add(technologies, [
      "Background Jobs / Queue",
    ]);

    add(architectureDomains, [
      "QUEUE_INFRASTRUCTURE",
    ]);

    add(engineeringSignals, [
      "BACKGROUND_PROCESSING",
    ]);

    addReasoningSignal(
      "Detected background job and queue processing patterns",
    );
  }

  /**
   * Redis and caching.
   */
  if (
    includesAny(combinedText, [
      "redis",
      "ioredis",
      "cache",
    ])
  ) {
    add(technologies, [
      "Redis",
    ]);

    add(architectureDomains, [
      "CACHING_LAYER",
    ]);
  }

  /**
   * Messaging and event streaming.
   */
  if (
    includesAny(combinedText, [
      "rabbitmq",
      "nats",
      "sqs",
      "pubsub",
      "kafka",
    ])
  ) {
    add(technologies, [
      "Messaging / Event Streaming",
    ]);

    add(architectureDomains, [
      "EVENT_STREAMING",
    ]);

    add(engineeringSignals, [
      "EVENT_DRIVEN",
    ]);

    addReasoningSignal(
      "Detected messaging and event streaming patterns",
    );
  }

  /**
   * Database layer.
   */
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
    add(technologies, [
      "Database",
    ]);

    add(architectureDomains, [
      "DATABASE_LAYER",
    ]);

    addReasoningSignal(
      "Detected database schema and migration patterns",
    );
  }

  /**
   * Design systems.
   */
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
    add(technologies, [
      "Design System",
    ]);

    add(architectureDomains, [
      "DESIGN_SYSTEM",
    ]);

    add(repositoryTypes, [
      "DESIGN_SYSTEM_REPOSITORY",
    ]);

    addReasoningSignal(
      "Detected design system and product design patterns",
    );
  }

  /**
   * Documentation-heavy repositories.
   */
  if (
    includesAny(combinedText, [
      "docs/",
      "documentation",
      "mkdocs",
      "docusaurus",
      "readme",
    ])
  ) {
    add(technologies, [
      "Documentation",
    ]);

    add(architectureDomains, [
      "DOCUMENTATION_SYSTEM",
    ]);

    add(repositoryTypes, [
      "DOCUMENTATION_REPOSITORY",
    ]);

    addReasoningSignal(
      "Detected documentation-focused repository patterns",
    );
  }

  /**
   * Realtime collaboration.
   */
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
    add(technologies, [
      "Realtime Collaboration",
    ]);

    add(architectureDomains, [
      "COLLABORATION_SYSTEMS",
    ]);

    add(engineeringSignals, [
      "LIVE_COLLABORATION",
    ]);

    add(repositoryTypes, [
      "COLLABORATION_PLATFORM",
    ]);

    addReasoningSignal(
      "Detected realtime collaboration patterns",
    );
  }

  /**
   * Energy monitoring.
   */
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
    add(technologies, [
      "Energy Monitoring",
    ]);

    add(architectureDomains, [
      "ENERGY_SYSTEMS",
    ]);

    add(engineeringSignals, [
      "REALTIME_MONITORING",
    ]);

    add(repositoryTypes, [
      "ENERGY_PLATFORM",
    ]);

    addReasoningSignal(
      "Detected energy monitoring patterns",
    );
  }

  /**
   * Engineering-intelligence platform.
   *
   * Both signal groups must be present before this repository type is added.
   */
  const hasEngineeringIntelligenceCoreSignal =
    includesAny(combinedText, [
      "repository intelligence",
      "engineering intelligence",
      "architecture evolution",
      "architecture radar",
      "architecture narrative",
      "repository fingerprint",
      "codebase intelligence",
    ]);

  const hasGithubRepositoryAnalysisSignal =
    includesAny(combinedText, [
      "github webhook",
      "github oauth",
      "repository import",
      "pull request analysis",
      "commit analysis",
      "engineering timeline",
      "architecture change",
    ]);

  if (
    hasEngineeringIntelligenceCoreSignal &&
    hasGithubRepositoryAnalysisSignal
  ) {
    add(technologies, [
      "Engineering Intelligence",
    ]);

    add(architectureDomains, [
      "ENGINEERING_INTELLIGENCE",
    ]);

    add(engineeringSignals, [
      "ARCHITECTURE_REASONING",
    ]);

    add(repositoryTypes, [
      "ENGINEERING_INTELLIGENCE_PLATFORM",
    ]);

    addReasoningSignal(
      "Detected core engineering intelligence concepts and GitHub repository analysis patterns",
    );
  }
};

/**
 * Applies the purpose adjustments that originally ran near the end of
 * technology-fingerprint.ts.
 *
 * This must remain separate from applyLegacyClassificationStage because it
 * uses reasoning signals and classifications produced by earlier stages.
 */
export const applyLegacyPurposeAdjustmentStage = ({
  filesChanged,
  commitMessages,
  repositoryContext,
  state,
}: {
  filesChanged: string[];
  commitMessages: string[];
  repositoryContext: string;
  state: FingerprintState;
}): void => {
  const {
    technologies,
    architectureDomains,
    repositoryTypes,
    reasoningSignals,
  } = state;

const combinedPurposeText = [
  ...filesChanged,
  ...commitMessages,

  /**
   * Repository descriptions and README content contain important product
   * purpose evidence such as "scaffolding CLI" or "fintech platform".
   *
   * They may support repository-purpose classification, but they must not
   * independently confirm implementation technologies.
   */
  repositoryContext,

  ...reasoningSignals,
  ...Array.from(technologies),
  ...Array.from(architectureDomains),
  ...Array.from(repositoryTypes),
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

  if (
    combinedPurposeText.includes(
      "repository intelligence",
    ) ||
    combinedPurposeText.includes(
      "engineering intelligence",
    ) ||
    combinedPurposeText.includes(
      "architecture evolution",
    ) ||
    combinedPurposeText.includes(
      "architecture change",
    ) ||
    combinedPurposeText.includes(
      "repository fingerprint",
    ) ||
    combinedPurposeText.includes(
      "github webhook",
    ) ||
    combinedPurposeText.includes(
      "github oauth",
    ) ||
    combinedPurposeText.includes(
      "repository import",
    )
  ) {
    repositoryTypes.add(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
    );
  }

  if (
    combinedPurposeText.includes(
      "scaffold",
    ) ||
    combinedPurposeText.includes(
      "scaffolding",
    ) ||
    combinedPurposeText.includes(
      "code generation",
    ) ||
    combinedPurposeText.includes(
      "codegen",
    ) ||
    combinedPurposeText.includes(
      "cli",
    ) ||
    combinedPurposeText.includes(
      "commander",
    ) ||
    combinedPurposeText.includes(
      "inquirer",
    ) ||
    combinedPurposeText.includes(
      "boilerplate",
    ) ||
    combinedPurposeText.includes(
      "create-app",
    )
  ) {
    repositoryTypes.add(
      "DEVTOOL_PLATFORM",
    );
  }
};