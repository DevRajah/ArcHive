import type {
  EvidenceContext,
} from "../evidence-types";

const BACKEND_FRAMEWORK_PACKAGES = [
  "express",
  "fastify",
  "hono",
  "koa",
  "@koa/router",
  "@nestjs/core",
  "@nestjs/common",
  "@nestjs/platform-express",
  "@nestjs/platform-fastify",
  "apollo-server",
  "@apollo/server",
  "graphql-yoga",
  "@grpc/grpc-js",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalizedPath = file
      .replace(/\\/g, "/")
      .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects repositories that implement an application backend or API service.
 *
 * Future me:
 * A repository should not become BACKEND_SERVICE simply because it contains
 * a generic file called service.ts, controller.ts, or router.ts.
 *
 * We require framework usage, strong backend entrypoints, or multiple
 * complementary backend layers.
 */
export const detectBackendServiceEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasFrameworkDependency =
    hasAnySetValue(
      dependencies,
      BACKEND_FRAMEWORK_PACKAGES,
    );

  const hasFrameworkImport =
    hasAnySetValue(
      imports,
      BACKEND_FRAMEWORK_PACKAGES,
    );

  const hasBackendEntrypoint =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)(server|main|bootstrap)\.[jt]s$/,
        /(^|\/)app\.(server|api)\.[jt]s$/,
        /(^|\/)api\/(server|main|index)\.[jt]s$/,
        /(^|\/)apps\/api\/src\/(server|main|index)\.[jt]s$/,
      ],
    );

  const hasRouteLayer =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)routes?\//,
        /\.routes?\.[jt]s$/,
        /\.router\.[jt]s$/,
        /(^|\/)routers?\//,
      ],
    );

  const hasControllerLayer =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)controllers?\//,
        /\.controller\.[jt]s$/,
      ],
    );

  const hasMiddlewareLayer =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)middleware\//,
        /(^|\/)middlewares\//,
        /\.middleware\.[jt]s$/,
      ],
    );

  const hasBackendServiceLayer =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)services?\//,
        /\.service\.[jt]s$/,
      ],
    );

  const hasApiSchema =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)schema\.graphql$/,
        /(^|\/)openapi\.ya?ml$/,
        /(^|\/)swagger\.ya?ml$/,
        /(^|\/)protos?\//,
        /\.proto$/,
      ],
    );

  const backendLayerCount = [
    hasRouteLayer,
    hasControllerLayer,
    hasMiddlewareLayer,
    hasBackendServiceLayer,
  ].filter(Boolean).length;

  const hasBackendSourceUsage =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      return (
        (
          content.includes(
            ".listen(",
          ) &&
          (
            content.includes(
              "express(",
            ) ||
            content.includes(
              "fastify(",
            ) ||
            content.includes(
              "new koa(",
            )
          )
        ) ||
        content.includes(
          "nestfactory.create(",
        ) ||
        content.includes(
          "app.register(",
        ) ||
        content.includes(
          "router.get(",
        ) ||
        content.includes(
          "router.post(",
        ) ||
        content.includes(
          "app.use(",
        )
      );
    });

  const hasStrongBackendPurpose =
    [
      "backend service",
      "backend api",
      "rest api",
      "graphql api",
      "api server",
      "application server",
      "backend platform",
      "microservice",
      "server-side application",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasFrameworkDependency &&
    hasFrameworkImport
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected backend framework dependency used directly in source code",
      45,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkImport
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected direct backend framework imports",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkDependency
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected backend framework dependencies",
      30,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasBackendEntrypoint &&
    (
      backendLayerCount >= 2 ||
      hasApiSchema
    )
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected backend entrypoint with multiple API or application layers",
      35,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    backendLayerCount >= 3
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected substantial route, controller, middleware, and service architecture",
      30,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (hasBackendSourceUsage) {
    addEvidence(
      "BACKEND_SERVICE",
      "Detected implemented HTTP server, routing, middleware, or application bootstrap code",
      30,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongBackendPurpose &&
    (
      hasFrameworkDependency ||
      hasFrameworkImport ||
      hasBackendEntrypoint ||
      backendLayerCount >= 2
    )
  ) {
    addEvidence(
      "BACKEND_SERVICE",
      "Repository purpose explicitly describes a backend service or API",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};