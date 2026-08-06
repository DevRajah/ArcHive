import type {
    EvidenceContext,
} from "../../evidence";



export const detectFrameworkConfigurations = (
    context: EvidenceContext,
) => {
    for (const [
        path,
        content,
    ] of context.configurationContents) {

        const normalizedPath =
            path.toLowerCase();

        const normalizedContent =
            content.toLowerCase();

        /**
         * Next.js
         */
        if (
            normalizedPath.includes(
                "next.config",
            )
        ) {
            context.addTechnology({
                name: "Next.js",

                reason:
                    "Detected Next.js configuration.",

                weight: 90,

                strength: "STRONG",

                source:
                    "CONFIGURATION",

                evidence: path,

                status:
                    "CONFIRMED",
            });
        }

        /**
 * Standalone deployment.
 */
        if (
            normalizedContent.includes(
                'output: "standalone"',
            ) ||
            normalizedContent.includes(
                "output:'standalone'",
            ) ||
            normalizedContent.includes(
                "output:`standalone`",
            )
        ) {
            context.addTechnology({
                name:
                    "Standalone Next.js",

                reason:
                    "Detected standalone deployment mode.",

                weight: 95,

                strength:
                    "STRONG",

                source:
                    "CONFIGURATION",

                evidence:
                    path,

                status:
                    "CONFIRMED",
            });
        }

        /**
         * Turborepo
         */
        if (
            normalizedPath.endsWith(
                "turbo.json",
            )
        ) {
            context.addTechnology({
                name: "Turborepo",

                reason:
                    "Detected turbo.json.",

                weight: 95,

                strength: "STRONG",

                source:
                    "CONFIGURATION",

                evidence: path,

                status:
                    "CONFIRMED",
            });

            if (
                normalizedContent.includes(
                    '"pipeline"',
                ) ||
                normalizedContent.includes(
                    '"tasks"',
                )
            ) {
                context.addTechnology({
                    name:
                        "Turborepo Pipelines",

                    reason:
                        "Detected Turbo task pipeline.",

                    weight:
                        95,

                    strength:
                        "STRONG",

                    source:
                        "CONFIGURATION",

                    evidence:
                        path,

                    status:
                        "CONFIRMED",
                });
            }
        }

        /**
         * Nx
         */
        if (
            normalizedPath.endsWith(
                "nx.json",
            )
        ) {
            context.addTechnology({
                name: "Nx",

                reason:
                    "Detected nx.json.",

                weight: 95,

                strength: "STRONG",

                source:
                    "CONFIGURATION",

                evidence: path,

                status:
                    "CONFIRMED",
            });

            if (
                normalizedContent.includes(
                    "targetdefaults",
                )
            ) {
                context.addTechnology({
                    name:
                        "Nx Workspace",

                    reason:
                        "Detected Nx workspace configuration.",

                    weight:
                        95,

                    strength:
                        "STRONG",

                    source:
                        "CONFIGURATION",

                    evidence:
                        path,

                    status:
                        "CONFIRMED",
                });
            }
        }

        /**
         * Vite
         */
        if (
            normalizedPath.includes(
                "vite.config",
            )
        ) {
            context.addTechnology({
                name: "Vite",

                reason:
                    "Detected Vite configuration.",

                weight: 90,

                strength: "STRONG",

                source:
                    "CONFIGURATION",

                evidence: path,

                status:
                    "CONFIRMED",
            });


            if (
                normalizedContent.includes(
                    "defineconfig",
                )
            ) {
                context.addTechnology({
                    name:
                        "Modern Vite Configuration",

                    reason:
                        "Detected defineConfig().",

                    weight: 75,

                    strength:
                        "MEDIUM",

                    source:
                        "CONFIGURATION",

                    evidence:
                        path,

                    status:
                        "LIKELY",
                });
            }
        }


        /**
         * Docker Compose
         */
        if (
            normalizedPath.includes(
                "docker-compose",
            )
        ) {
            context.addTechnology({
                name:
                    "Docker Compose",

                reason:
                    "Detected Docker Compose configuration.",

                weight: 90,

                strength:
                    "STRONG",

                source:
                    "CONFIGURATION",

                evidence:
                    path,

                status:
                    "CONFIRMED",
            });

            if (
                normalizedContent.includes(
                    "services:",
                )
            ) {
                context.addTechnology({
                    name:
                        "Container Orchestration",

                    reason:
                        "Detected Docker Compose services.",

                    weight:
                        80,

                    strength:
                        "STRONG",

                    source:
                        "CONFIGURATION",

                    evidence:
                        path,

                    status:
                        "CONFIRMED",
                });
            }

            if (
                normalizedContent.includes(
                    "healthcheck",
                )
            ) {
                context.addTechnology({
                    name:
                        "Container Health Checks",

                    reason:
                        "Detected Docker health checks.",

                    weight:
                        85,

                    strength:
                        "STRONG",

                    source:
                        "CONFIGURATION",

                    evidence:
                        path,

                    status:
                        "CONFIRMED",
                });
            }
        }

        /**
         * Vercel
         */
        if (
            normalizedPath.endsWith(
                "vercel.json",
            )
        ) {
            context.addTechnology({
                name:
                    "Vercel",

                reason:
                    "Detected Vercel deployment configuration.",

                weight: 90,

                strength:
                    "STRONG",

                source:
                    "CONFIGURATION",

                evidence:
                    path,

                status:
                    "CONFIRMED",
            });
        }

        /**
         * Render
         */
        if (
            normalizedPath.endsWith(
                "render.yaml",
            ) ||
            normalizedPath.endsWith(
                "render.yml",
            )
        ) {
            context.addTechnology({
                name:
                    "Render",

                reason:
                    "Detected Render deployment configuration.",

                weight: 90,

                strength:
                    "STRONG",

                source:
                    "CONFIGURATION",

                evidence:
                    path,

                status:
                    "CONFIRMED",
            });
        }

        /**
         * Railway
         */
        if (
            normalizedPath.endsWith(
                "railway.json",
            )
        ) {
            context.addTechnology({
                name:
                    "Railway",

                reason:
                    "Detected Railway configuration.",

                weight: 90,

                strength:
                    "STRONG",

                source:
                    "CONFIGURATION",

                evidence:
                    path,

                status:
                    "CONFIRMED",
            });
        }

        void normalizedContent;
    }
};