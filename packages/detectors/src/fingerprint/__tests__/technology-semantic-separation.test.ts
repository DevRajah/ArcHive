import assert from "node:assert/strict";
import {
    describe,
    it,
} from "node:test";

import {
    applyRepositoryPurposeStage,
} from "../repository-purpose-stage";

import {
    applyLegacyClassificationStage,
} from "../legacy-classification-stage";

import type {
    FingerprintState,
} from "../shared";

import {
    detectTechnologyFingerprint,
} from "../../technology-fingerprint";

import {
    getEngineeringSignalsForTechnology,
} from "../technology-engineering-signal";

import {
    detectRateLimitingTechnology,
} from "../../technologies/security/rate-limit-detector";
import { hasRealtimeEvidence } from "../../realtime-evidence";

// Command to run this test file in watch mode:
// npx tsx --test packages/detectors/src/fingerprint/__tests__/technology-semantic-separation.test.ts --watch

/**
 * Small in-memory fingerprint state for testing detector stages.
 *
 * Future me:
 * These tests intentionally exercise the real stage functions without
 * requiring Prisma, GitHub, or repository reprocessing.
 */
const createState = (): FingerprintState => {
    const reasoningSignals: string[] = [];

    return {
        technologies: new Set<string>(),
        architectureDomains:
            new Set<string>(),
        engineeringSignals:
            new Set<string>(),
        repositoryTypes:
            new Set<string>(),
        reasoningSignals,

        addReasoningSignal(
            signal: string,
        ) {
            reasoningSignals.push(signal);
        },
    };
};

describe(
    "Canonical technology semantic separation",
    () => {
        it(
            "does not invent a technology from FINTECH repository purpose",
            () => {
                const state =
                    createState();

                applyRepositoryPurposeStage({
                    evidenceResults: [
                        {
                            repositoryType:
                                "FINTECH_PLATFORM",

                            /**
                             * The purpose stage only needs the repository-type conclusion
                             * and its evidence for this regression scenario.
                             */
                            evidence: [
                                "Detected financial infrastructure evidence",
                            ],

                            score: 100,
                        },
                    ] as any,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Financial Infrastructure",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "FINANCIAL_SYSTEMS",
                    ),
                    true,
                );

                assert.equal(
                    state.engineeringSignals.has(
                        "FINANCIAL_PROCESSING",
                    ),
                    true,
                );

                assert.equal(
                    state.repositoryTypes.has(
                        "FINTECH_PLATFORM",
                    ),
                    true,
                );
            },
        );

        it(
            "does not invent Developer Tooling as a technology from DEVTOOL purpose",
            () => {
                const state =
                    createState();

                applyRepositoryPurposeStage({
                    evidenceResults: [
                        {
                            repositoryType:
                                "DEVTOOL_PLATFORM",
                            evidence: [
                                "Detected developer-tooling evidence",
                            ],
                            score: 100,
                        },
                    ] as any,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Developer Tooling",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "DEVELOPER_INFRASTRUCTURE",
                    ),
                    true,
                );

                assert.equal(
                    state.repositoryTypes.has(
                        "DEVTOOL_PLATFORM",
                    ),
                    true,
                );
            },
        );

        it(
            "does not invent Backend Services as a technology from BACKEND_SERVICE purpose",
            () => {
                const state =
                    createState();

                applyRepositoryPurposeStage({
                    evidenceResults: [
                        {
                            repositoryType:
                                "BACKEND_SERVICE",
                            evidence: [
                                "Detected backend-service evidence",
                            ],
                            score: 100,
                        },
                    ] as any,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Backend Services",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "SERVICE_ARCHITECTURE",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps concrete legacy technologies",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "package.json",
                        "Dockerfile",
                        "src/cache.ts",
                    ],

                    combinedText: `
            package.json
            typescript
            node
            dockerfile
            redis
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Node.js",
                    ),
                    true,
                );

                assert.equal(
                    state.technologies.has(
                        "TypeScript",
                    ),
                    true,
                );

                assert.equal(
                    state.technologies.has(
                        "Docker",
                    ),
                    true,
                );

                assert.equal(
                    state.technologies.has(
                        "Redis",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps database architecture evidence without adding generic Database technology",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "prisma/schema.prisma",
                    ],

                    combinedText: `
            prisma
            schema.prisma
            migration
            postgres
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Database",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "DATABASE_LAYER",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps documentation architecture evidence without adding Documentation technology",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "README.md",
                        "docs/architecture.md",
                    ],

                    combinedText: `
            README
            docs/
            documentation
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Documentation",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "DOCUMENTATION_SYSTEM",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps queue architecture evidence without adding generic Background Jobs technology",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "src/workers/payment.worker.ts",
                    ],

                    combinedText: `
            queue
            worker
            job
            bullmq
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Background Jobs / Queue",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "QUEUE_INFRASTRUCTURE",
                    ),
                    true,
                );

                assert.equal(
                    state.engineeringSignals.has(
                        "BACKGROUND_PROCESSING",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps realtime collaboration semantics outside technologies",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "src/collaboration.ts",
                    ],

                    combinedText: `
            collaboration
            shared editing
            live cursor
            yjs
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Realtime Collaboration",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "COLLABORATION_SYSTEMS",
                    ),
                    true,
                );

                assert.equal(
                    state.engineeringSignals.has(
                        "LIVE_COLLABORATION",
                    ),
                    true,
                );
            },
        );

        it(
            "keeps energy-monitoring semantics outside technologies",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "src/energy.ts",
                    ],

                    combinedText: `
            energy
            electricity
            meter
            consumption
            smart grid
          `,

                    state,
                });

                assert.equal(
                    state.technologies.has(
                        "Energy Monitoring",
                    ),
                    false,
                );

                assert.equal(
                    state.architectureDomains.has(
                        "ENERGY_SYSTEMS",
                    ),
                    true,
                );
            },
        );

        it(
            "is deterministic for identical repository evidence",
            () => {
                const run = () => {
                    const state =
                        createState();

                    applyLegacyClassificationStage({
                        filesChanged: [
                            "package.json",
                            "Dockerfile",
                            "prisma/schema.prisma",
                        ],

                        combinedText: `
              node
              typescript
              dockerfile
              prisma
              postgres
              redis
              queue
              worker
            `,

                        state,
                    });

                    return {
                        technologies:
                            Array.from(
                                state.technologies,
                            ),

                        domains:
                            Array.from(
                                state.architectureDomains,
                            ),

                        engineeringSignals:
                            Array.from(
                                state.engineeringSignals,
                            ),
                    };
                };

                assert.deepEqual(
                    run(),
                    run(),
                );
            },
        );

        it(
            "detects express-rate-limit as a concrete technology",
            () => {
                const detectedTechnologies: Array<{
                    name: string;
                    status: string;
                    reason?: string;
                    evidence?: string;
                }> = [];

                const context = {
                    filesChanged: [
                        "package.json",
                        "src/middleware/rate-limit.ts",
                    ],

                    combinedText: `
        express-rate-limit
        rate limiter
        middleware
      `,

                    /**
                     * The technology detector writes its result through the context rather
                     * than returning the detected technology directly.
                     *
                     * Future me:
                     * Keep this test aligned with the real detector contract instead of
                     * mocking only the input fields.
                     */
                    addTechnology: (
                        technology: {
                            name: string;
                            status: string;
                            reason?: string;
                            evidence?: string;
                        },
                    ) => {
                        detectedTechnologies.push(
                            technology,
                        );
                    },
                };

                detectRateLimitingTechnology(
                    context as any,
                );

                const detected =
                    detectedTechnologies.find(
                        (technology) =>
                            technology.name ===
                            "express-rate-limit",
                    );

                assert.ok(
                    detected,
                    "Expected express-rate-limit to be detected",
                );

                assert.equal(
                    detected.name,
                    "express-rate-limit",
                );

                assert.equal(
                    detectedTechnologies.some(
                        (technology) =>
                            technology.name ===
                            "Rate Limiting",
                    ),
                    false,
                );
            },
        );

        it(
            "maps express-rate-limit to the RATE_LIMITING engineering signal",
            () => {
                assert.deepEqual(
                    getEngineeringSignalsForTechnology(
                        "express-rate-limit",
                    ),
                    [
                        "RATE_LIMITING",
                    ],
                );

                assert.deepEqual(
                    getEngineeringSignalsForTechnology(
                        "Express",
                    ),
                    [],
                );
            },
        );

        it(
            "recognizes canonical realtime evidence consistently",
            () => {
                assert.equal(
                    hasRealtimeEvidence(
                        "Repository uses socket.io for live updates",
                    ),
                    true,
                );

                assert.equal(
                    hasRealtimeEvidence(
                        "Repository exposes server-sent events",
                    ),
                    true,
                );

                assert.equal(
                    hasRealtimeEvidence(
                        "Repository publishes an event stream",
                    ),
                    true,
                );

                assert.equal(
                    hasRealtimeEvidence(
                        "Repository uses pubsub messaging",
                    ),
                    true,
                );
            },
        );

        it(
            "does not classify unrelated text as realtime evidence",
            () => {
                assert.equal(
                    hasRealtimeEvidence(
                        "Repository contains ordinary REST endpoints and database migrations",
                    ),
                    false,
                );
            },
        );

        it(
            "adds REALTIME_SYSTEMS architecture domain from canonical realtime evidence",
            () => {
                const state =
                    createState();

                applyLegacyClassificationStage({
                    filesChanged: [
                        "src/events/stream.ts",
                    ],

                    combinedText: `
        server-sent events
        live updates
        event stream
      `,

                    state,
                });

                assert.equal(
                    state.architectureDomains.has(
                        "REALTIME_SYSTEMS",
                    ),
                    true,
                );

                assert.equal(
                    state.engineeringSignals.has(
                        "REALTIME_INFRASTRUCTURE",
                    ),
                    true,
                );

                assert.equal(
                    state.technologies.has(
                        "Socket.IO / Realtime Events",
                    ),
                    false,
                );
            },
        );

        it(
            "detects Tailwind CSS from the tailwindcss package",
            () => {
                const result =
                    detectTechnologyFingerprint(
                        [
                            "package.json",
                        ],
                        [],
                        "",
                        [
                            {
                                path: "package.json",

                                content:
                                    JSON.stringify({
                                        devDependencies: {
                                            tailwindcss:
                                                "^4.1.0",
                                        },
                                    }),
                            },
                        ],
                    );

                assert.ok(
                    result.technologies.includes(
                        "Tailwind CSS",
                    ),
                );
            },
        );


        it(
            "detects Tailwind CSS from the official Tailwind Vite package",
            () => {
                const result =
                    detectTechnologyFingerprint(
                        [
                            "package.json",
                        ],
                        [],
                        "",
                        [
                            {
                                path: "package.json",

                                content:
                                    JSON.stringify({
                                        devDependencies: {
                                            "@tailwindcss/vite":
                                                "^4.1.0",
                                        },
                                    }),
                            },
                        ],
                    );

                assert.ok(
                    result.technologies.includes(
                        "Tailwind CSS",
                    ),
                );
            },
        );


        it(
            "does not infer Tailwind CSS from PostCSS alone",
            () => {
                const result =
                    detectTechnologyFingerprint(
                        [
                            "package.json",
                        ],
                        [],
                        "",
                        [
                            {
                                path: "package.json",

                                content:
                                    JSON.stringify({
                                        devDependencies: {
                                            postcss:
                                                "^8.5.0",
                                        },
                                    }),
                            },
                        ],
                    );

                assert.equal(
                    result.technologies.includes(
                        "Tailwind CSS",
                    ),
                    false,
                );
            },
        );
    },
);