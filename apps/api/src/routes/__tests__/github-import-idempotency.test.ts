import assert from "node:assert/strict";
import {
    afterEach,
    beforeEach,
    describe,
    test,
} from "node:test";

import Fastify from "fastify";
import axios from "axios";

import { prisma } from "@archive/database";

import {
    githubSyncRoutes,
} from "../github-sync.routes";

// command to run this file:
// node `
//   --env-file=packages/database/.env `
//   --import tsx `
//   --test `
//   apps/api/src/routes/__tests__/github-import-idempotency.test.ts

describe(
    "GitHub selected repository import idempotency",
    () => {
        const userId = "test-user-id";

        const githubRepository = {
            githubRepoId: "123456789",
            name: "example-repository",
            owner: "DevRajah",
            fullName:
                "DevRajah/example-repository",
            description:
                "Repository used for import regression testing.",
            defaultBranch: "main",
            language: "TypeScript",
            stars: 12,
            forks: 3,
        };

        const user = {
            id: userId,
            username: "DevRajah",
            githubAccessToken:
                "test-github-access-token",
        };

        /**
         * Future me:
         * Prisma model delegates are proxy-like objects.
         *
         * We keep references to the real methods and restore them after every
         * test so these regressions never leak mocked database behaviour into
         * another suite.
         */
        const userDelegate =
            prisma.user as any;

        const repositoryDelegate =
            prisma.repository as any;

        const originalUserFindUnique =
            userDelegate.findUnique;

        const originalUserUpdate =
            userDelegate.update;

        const originalRepositoryFindFirst =
            repositoryDelegate.findUnique;

        const originalRepositoryUpdate =
            repositoryDelegate.update;

        const originalRepositoryUpsert =
            repositoryDelegate.upsert;

        const originalAxiosGet =
            axios.get;

        const originalAxiosPost =
            axios.post;

        const originalPublicWebhookUrl =
            process.env.PUBLIC_WEBHOOK_URL;

        const originalWebhookSecret =
            process.env.GITHUB_WEBHOOK_SECRET;


        beforeEach(() => {
            process.env.PUBLIC_WEBHOOK_URL =
                "https://archive.example.com";

            process.env.GITHUB_WEBHOOK_SECRET =
                "test-webhook-secret";

            userDelegate.findUnique =
                async () => user;

            /**
             * Routes that represent genuine user activity call
             * touchUserActivity(), which updates User.lastActivityAt.
             *
             * Use a safe default mock so existing route regressions never
             * accidentally hit the real test database with our synthetic user ID.
             *
             * Tests that specifically verify activity semantics can override
             * this mock and count/assert the calls themselves.
             */
            userDelegate.update =
                async (args: any) => {
                    return {
                        ...user,

                        lastActivityAt:
                            args.data.lastActivityAt,
                    };
                };
        });


        afterEach(() => {
            userDelegate.findUnique =
                originalUserFindUnique;

            userDelegate.update =
                originalUserUpdate;

            repositoryDelegate.findUnique =
                originalRepositoryFindFirst;

            repositoryDelegate.update =
                originalRepositoryUpdate;

            repositoryDelegate.upsert =
                originalRepositoryUpsert;

            axios.get =
                originalAxiosGet;

            axios.post =
                originalAxiosPost;

            if (
                originalPublicWebhookUrl ===
                undefined
            ) {
                delete process.env.PUBLIC_WEBHOOK_URL;
            } else {
                process.env.PUBLIC_WEBHOOK_URL =
                    originalPublicWebhookUrl;
            }

            if (
                originalWebhookSecret ===
                undefined
            ) {
                delete process.env.GITHUB_WEBHOOK_SECRET;
            } else {
                process.env.GITHUB_WEBHOOK_SECRET =
                    originalWebhookSecret;
            }
        });


        const buildApp = async ({
            generateRepositoryIntelligence =
            async () => {
                return {} as any;
            },
        }: {
            generateRepositoryIntelligence?: (
                input: {
                    repositoryId: string;
                },
            ) => Promise<any>;
        } = {}) => {
            const app = Fastify();

            await app.register(
                githubSyncRoutes,
                {
                    prefix: "/api/github",

                    generateRepositoryIntelligence:
                        generateRepositoryIntelligence as any,
                },
            );

            return app;
        };


        test(
            "brand-new repository returns IMPORTED and ensures its webhook",
            async () => {
                let upsertCalls = 0;
                let webhookListCalls = 0;
                let webhookCreateCalls = 0;
                let intelligenceGenerationCalls = 0;
                let generatedRepositoryId:
                    string | null = null;

                repositoryDelegate.findUnique =
                    async () => null;

                repositoryDelegate.upsert =
                    async () => {
                        upsertCalls += 1;

                        return {
                            id: "new-repository-id",

                            githubRepoId:
                                githubRepository.githubRepoId,

                            name:
                                githubRepository.name,

                            owner:
                                githubRepository.owner,

                            fullName:
                                githubRepository.fullName,

                            description:
                                githubRepository.description,

                            defaultBranch:
                                githubRepository.defaultBranch,

                            language:
                                githubRepository.language,

                            stars:
                                githubRepository.stars,

                            forks:
                                githubRepository.forks,

                            userId,

                            isTracked: true,
                        };
                    };

                /**
                 * No existing GitHub webhook.
                 */
                axios.get =
                    async () => {
                        webhookListCalls += 1;

                        return {
                            data: [],
                        } as any;
                    };

                axios.post =
                    async () => {
                        webhookCreateCalls += 1;

                        return {
                            data: {
                                id: 987,
                                active: true,
                                events: [
                                    "push",
                                    "pull_request",
                                ],
                            },
                        } as any;
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async ({ repositoryId }) => {
                                intelligenceGenerationCalls += 1;
                                generatedRepositoryId =
                                    repositoryId;

                                return {} as any;
                            },
                    });

                const response =
                    await app.inject({
                        method: "POST",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/import-selected",

                        payload: {
                            repositories: [
                                githubRepository,
                            ],
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.success,
                    true,
                );

                assert.equal(
                    body.data.importedCount,
                    1,
                );

                assert.equal(
                    body.data.retrackedCount,
                    0,
                );

                assert.equal(
                    body.data.alreadyTrackedCount,
                    0,
                );

                assert.equal(
                    body.data.repositories[0].status,
                    "IMPORTED",
                );

                assert.equal(
                    body.data.repositories[0]
                        .repository.id,
                    "new-repository-id",
                );

                assert.equal(
                    upsertCalls,
                    1,
                );

                assert.equal(
                    webhookListCalls,
                    1,
                );

                assert.equal(
                    webhookCreateCalls,
                    1,
                );

                /**
 * A genuinely new import must establish its initial canonical
 * RepositoryIntelligenceSnapshot exactly once.
 */
                assert.equal(
                    intelligenceGenerationCalls,
                    1,
                );

                assert.equal(
                    generatedRepositoryId,
                    "new-repository-id",
                );
            },
        );


        test(
            "previously untracked repository returns RETRACKED, reuses the same row, and ensures its webhook",
            async () => {
                const existingRepository = {
                    id:
                        "existing-repository-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        githubRepository.name,

                    owner:
                        githubRepository.owner,

                    fullName:
                        githubRepository.fullName,

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars: 10,
                    forks: 2,

                    userId: null,
                    isTracked: false,
                };

                let updateCalls = 0;
                let webhookListCalls = 0;
                let webhookCreateCalls = 0;
                let intelligenceGenerationCalls = 0;
                let generatedRepositoryId:
                    string | null = null;

                repositoryDelegate.findUnique =
                    async () =>
                        existingRepository;

                repositoryDelegate.update =
                    async (args: any) => {
                        updateCalls += 1;

                        assert.equal(
                            args.where.id,
                            existingRepository.id,
                        );

                        assert.equal(
                            args.data.userId,
                            userId,
                        );

                        assert.equal(
                            args.data.isTracked,
                            true,
                        );

                        return {
                            ...existingRepository,
                            ...args.data,
                        };
                    };

                /**
                 * Simulate GitHub not currently having ArcHive's webhook.
                 *
                 * Retracking should therefore restore it.
                 */
                axios.get =
                    async () => {
                        webhookListCalls += 1;

                        return {
                            data: [],
                        } as any;
                    };

                axios.post =
                    async () => {
                        webhookCreateCalls += 1;

                        return {
                            data: {
                                id: 654,
                                active: true,
                                events: [
                                    "push",
                                    "pull_request",
                                ],
                            },
                        } as any;
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async ({ repositoryId }) => {
                                intelligenceGenerationCalls += 1;
                                generatedRepositoryId =
                                    repositoryId;

                                return {} as any;
                            },
                    });

                const response =
                    await app.inject({
                        method: "POST",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/import-selected",

                        payload: {
                            repositories: [
                                githubRepository,
                            ],
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.data.importedCount,
                    0,
                );

                assert.equal(
                    body.data.retrackedCount,
                    1,
                );

                assert.equal(
                    body.data.alreadyTrackedCount,
                    0,
                );

                assert.equal(
                    body.data.repositories[0].status,
                    "RETRACKED",
                );

                /**
                 * Critical identity assertion:
                 *
                 * Retracking reuses the original ArcHive Repository row.
                 */
                assert.equal(
                    body.data.repositories[0]
                        .repository.id,
                    existingRepository.id,
                );

                assert.equal(
                    updateCalls,
                    1,
                );

                assert.equal(
                    webhookListCalls,
                    1,
                );

                assert.equal(
                    webhookCreateCalls,
                    1,
                );
                assert.equal(
                    intelligenceGenerationCalls,
                    1,
                );

                assert.equal(
                    generatedRepositoryId,
                    existingRepository.id,
                );
            },
        );


        test(
            "already tracked repository returns ALREADY_TRACKED without duplicate tracking side effects",
            async () => {
                const existingRepository = {
                    id:
                        "tracked-repository-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        githubRepository.name,

                    owner:
                        githubRepository.owner,

                    fullName:
                        githubRepository.fullName,

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars:
                        githubRepository.stars,

                    forks:
                        githubRepository.forks,

                    userId,
                    isTracked: true,
                };

                let metadataUpdateCalls = 0;

                let webhookListCalls = 0;
                let webhookCreateCalls = 0;
                let intelligenceGenerationCalls = 0;

                repositoryDelegate.findUnique =
                    async () =>
                        existingRepository;

                repositoryDelegate.update =
                    async (args: any) => {
                        metadataUpdateCalls += 1;

                        /**
                         * Harmless metadata refresh is allowed.
                         *
                         * What must NOT happen here is another tracking transition.
                         */
                        assert.equal(
                            args.data.userId,
                            undefined,
                        );

                        assert.equal(
                            args.data.isTracked,
                            undefined,
                        );

                        return {
                            ...existingRepository,
                            ...args.data,
                        };
                    };

                /**
                 * These should never execute.
                 *
                 * ALREADY_TRACKED must exit before webhook installation logic.
                 */
                axios.get =
                    async () => {
                        webhookListCalls += 1;

                        return {
                            data: [],
                        } as any;
                    };

                axios.post =
                    async () => {
                        webhookCreateCalls += 1;

                        return {
                            data: {},
                        } as any;
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async () => {
                                intelligenceGenerationCalls += 1;

                                return {} as any;
                            },
                    });

                const response =
                    await app.inject({
                        method: "POST",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/import-selected",

                        payload: {
                            repositories: [
                                githubRepository,
                            ],
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.data.importedCount,
                    0,
                );

                assert.equal(
                    body.data.retrackedCount,
                    0,
                );

                assert.equal(
                    body.data.alreadyTrackedCount,
                    1,
                );

                assert.equal(
                    body.data.repositories[0].status,
                    "ALREADY_TRACKED",
                );

                assert.equal(
                    body.data.repositories[0]
                        .repository.id,
                    existingRepository.id,
                );

                /**
                 * Metadata can be refreshed once.
                 */
                assert.equal(
                    metadataUpdateCalls,
                    1,
                );

                /**
                 * But repeating the import must not even enter webhook setup.
                 */
                assert.equal(
                    webhookListCalls,
                    0,
                );

                assert.equal(
                    webhookCreateCalls,
                    0,
                );
                /**
 * Critical idempotency invariant:
 *
 * Repeating an import for an already-tracked repository must never turn
 * into an expensive full-repository analysis.
 */
                assert.equal(
                    intelligenceGenerationCalls,
                    0,
                );
            },
        );

        test(
            "repository rename reuses the existing ArcHive row when githubRepoId is unchanged",
            async () => {
                const existingRepository = {
                    id:
                        "existing-renamed-repository-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        "old-repository-name",

                    owner:
                        githubRepository.owner,

                    fullName:
                        "DevRajah/old-repository-name",

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars:
                        githubRepository.stars,

                    forks:
                        githubRepository.forks,

                    userId,
                    isTracked: false,
                };

                let githubIdLookupCalls = 0;
                let fullNameLookupCalls = 0;
                let updateCalls = 0;

                repositoryDelegate.findUnique =
                    async (args: any) => {
                        if (
                            args.where.githubRepoId
                        ) {
                            githubIdLookupCalls += 1;

                            assert.equal(
                                args.where.githubRepoId,
                                githubRepository.githubRepoId,
                            );

                            return existingRepository;
                        }

                        if (
                            args.where.fullName
                        ) {
                            fullNameLookupCalls += 1;

                            return null;
                        }

                        return null;
                    };

                repositoryDelegate.update =
                    async (args: any) => {
                        updateCalls += 1;

                        assert.equal(
                            args.where.id,
                            existingRepository.id,
                        );

                        assert.equal(
                            args.data.fullName,
                            githubRepository.fullName,
                        );

                        return {
                            ...existingRepository,
                            ...args.data,
                        };
                    };

                /**
                 * Pretend ArcHive's webhook is already installed.
                 */
                axios.get =
                    async () => ({
                        data: [
                            {
                                id: 999,
                                active: true,

                                config: {
                                    url:
                                        "https://archive.example.com/api/github/webhook",
                                },
                            },
                        ],
                    }) as any;

                axios.post =
                    async () => {
                        throw new Error(
                            "Webhook should not be recreated when it already exists.",
                        );
                    };

                const app =
                    await buildApp();

                const response =
                    await app.inject({
                        method: "POST",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/import-selected",

                        payload: {
                            repositories: [
                                githubRepository,
                            ],
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.data.repositories[0]
                        .status,
                    "RETRACKED",
                );

                assert.equal(
                    body.data.repositories[0]
                        .repository.id,
                    existingRepository.id,
                );

                assert.equal(
                    body.data.repositories[0]
                        .repository.fullName,
                    githubRepository.fullName,
                );

                /**
                 * The stable GitHub identity must resolve the repository before the
                 * legacy fullName fallback is needed.
                 */
                assert.equal(
                    githubIdLookupCalls,
                    1,
                );

                assert.equal(
                    fullNameLookupCalls,
                    0,
                );

                assert.equal(
                    updateCalls,
                    1,
                );
            },
        );



        test(
            "dedicated retrack restores an untracked repository and records user activity",
            async () => {
                const existingRepository = {
                    id: "dedicated-untracked-repository-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        githubRepository.name,

                    owner:
                        githubRepository.owner,

                    fullName:
                        githubRepository.fullName,

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars:
                        githubRepository.stars,

                    forks:
                        githubRepository.forks,

                    userId: null,

                    isTracked: false,
                };

                let repositoryUpdateCalls = 0;
                let userActivityUpdateCalls = 0;
                let webhookListCalls = 0;
                let webhookCreateCalls = 0;
                let intelligenceGenerationCalls = 0;

                repositoryDelegate.findUnique =
                    async () =>
                        existingRepository;

                repositoryDelegate.update =
                    async (args: any) => {
                        repositoryUpdateCalls += 1;

                        assert.equal(
                            args.where.id,
                            existingRepository.id,
                        );

                        assert.equal(
                            args.data.userId,
                            userId,
                        );

                        assert.equal(
                            args.data.isTracked,
                            true,
                        );

                        return {
                            ...existingRepository,
                            ...args.data,
                        };
                    };

                /**
                 * touchUserActivity() owns the canonical
                 * lastActivityAt update.
                 */
                userDelegate.update =
                    async (args: any) => {
                        userActivityUpdateCalls += 1;

                        assert.equal(
                            args.where.id,
                            userId,
                        );

                        assert.ok(
                            args.data.lastActivityAt
                            instanceof Date,
                        );

                        return {
                            ...user,
                            lastActivityAt:
                                args.data.lastActivityAt,
                        };
                    };

                /**
                 * No ArcHive webhook exists yet.
                 * Retracking should restore it.
                 */
                axios.get =
                    async () => {
                        webhookListCalls += 1;

                        return {
                            data: [],
                        } as any;
                    };

                axios.post =
                    async () => {
                        webhookCreateCalls += 1;

                        return {
                            data: {
                                id: 555,
                                active: true,
                                events: [
                                    "push",
                                    "pull_request",
                                ],
                            },
                        } as any;
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async ({
                                repositoryId,
                            }) => {
                                intelligenceGenerationCalls += 1;

                                assert.equal(
                                    repositoryId,
                                    existingRepository.id,
                                );

                                return {} as any;
                            },
                    });

                const response =
                    await app.inject({
                        method: "PATCH",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/retrack",

                        payload: {
                            fullName:
                                existingRepository.fullName,
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.success,
                    true,
                );

                assert.equal(
                    body.message,
                    "Repository retracked successfully",
                );

                /**
                 * The existing logical repository row
                 * must be reused.
                 */
                assert.equal(
                    body.data.id,
                    existingRepository.id,
                );

                assert.equal(
                    body.data.userId,
                    userId,
                );

                assert.equal(
                    body.data.isTracked,
                    true,
                );

                assert.equal(
                    repositoryUpdateCalls,
                    1,
                );

                assert.equal(
                    webhookListCalls,
                    1,
                );

                assert.equal(
                    webhookCreateCalls,
                    1,
                );

                assert.equal(
                    intelligenceGenerationCalls,
                    1,
                );

                assert.equal(
                    userActivityUpdateCalls,
                    1,
                );
            },
        );


        test(
            "dedicated retrack is idempotent when the repository is already tracked by the same user",
            async () => {
                const existingRepository = {
                    id: "already-tracked-dedicated-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        githubRepository.name,

                    owner:
                        githubRepository.owner,

                    fullName:
                        githubRepository.fullName,

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars:
                        githubRepository.stars,

                    forks:
                        githubRepository.forks,

                    userId,

                    isTracked: true,
                };

                let repositoryUpdateCalls = 0;
                let userActivityUpdateCalls = 0;
                let webhookListCalls = 0;
                let webhookCreateCalls = 0;
                let intelligenceGenerationCalls = 0;

                repositoryDelegate.findUnique =
                    async () =>
                        existingRepository;

                /**
                 * An already-tracked repository must
                 * not undergo another tracking transition.
                 */
                repositoryDelegate.update =
                    async () => {
                        repositoryUpdateCalls += 1;

                        throw new Error(
                            "Repository should not be updated for an idempotent retrack.",
                        );
                    };

                userDelegate.update =
                    async (args: any) => {
                        userActivityUpdateCalls += 1;

                        assert.equal(
                            args.where.id,
                            userId,
                        );

                        assert.ok(
                            args.data.lastActivityAt
                            instanceof Date,
                        );

                        return {
                            ...user,
                            lastActivityAt:
                                args.data.lastActivityAt,
                        };
                    };

                axios.get =
                    async () => {
                        webhookListCalls += 1;

                        throw new Error(
                            "Webhook lookup should not run for an already-tracked repository.",
                        );
                    };

                axios.post =
                    async () => {
                        webhookCreateCalls += 1;

                        throw new Error(
                            "Webhook creation should not run for an already-tracked repository.",
                        );
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async () => {
                                intelligenceGenerationCalls += 1;

                                throw new Error(
                                    "Intelligence should not regenerate for an already-tracked repository.",
                                );
                            },
                    });

                const response =
                    await app.inject({
                        method: "PATCH",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/retrack",

                        payload: {
                            fullName:
                                existingRepository.fullName,
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    200,
                );

                const body =
                    response.json();

                assert.equal(
                    body.success,
                    true,
                );

                assert.equal(
                    body.message,
                    "Repository is already tracked",
                );

                assert.equal(
                    body.data.id,
                    existingRepository.id,
                );

                assert.equal(
                    repositoryUpdateCalls,
                    0,
                );

                assert.equal(
                    webhookListCalls,
                    0,
                );

                assert.equal(
                    webhookCreateCalls,
                    0,
                );

                assert.equal(
                    intelligenceGenerationCalls,
                    0,
                );

                /**
                 * Even an idempotent successful request
                 * is genuine human use of ArcHive.
                 */
                assert.equal(
                    userActivityUpdateCalls,
                    1,
                );
            },
        );


        test(
            "dedicated retrack rejects a repository actively tracked by another user without side effects",
            async () => {
                const existingRepository = {
                    id: "other-user-repository-id",

                    githubRepoId:
                        githubRepository.githubRepoId,

                    name:
                        githubRepository.name,

                    owner:
                        githubRepository.owner,

                    fullName:
                        githubRepository.fullName,

                    description:
                        githubRepository.description,

                    defaultBranch:
                        githubRepository.defaultBranch,

                    language:
                        githubRepository.language,

                    stars:
                        githubRepository.stars,

                    forks:
                        githubRepository.forks,

                    userId:
                        "another-user-id",

                    isTracked: true,
                };

                let repositoryUpdateCalls = 0;
                let userActivityUpdateCalls = 0;
                let webhookCalls = 0;
                let intelligenceGenerationCalls = 0;

                repositoryDelegate.findUnique =
                    async () =>
                        existingRepository;

                repositoryDelegate.update =
                    async () => {
                        repositoryUpdateCalls += 1;

                        throw new Error(
                            "Ownership must not change.",
                        );
                    };

                userDelegate.update =
                    async () => {
                        userActivityUpdateCalls += 1;

                        throw new Error(
                            "Failed retrack must not update user activity.",
                        );
                    };

                axios.get =
                    async () => {
                        webhookCalls += 1;

                        throw new Error(
                            "Webhook setup must not run after ownership rejection.",
                        );
                    };

                axios.post =
                    async () => {
                        webhookCalls += 1;

                        throw new Error(
                            "Webhook setup must not run after ownership rejection.",
                        );
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async () => {
                                intelligenceGenerationCalls += 1;

                                throw new Error(
                                    "Intelligence must not run after ownership rejection.",
                                );
                            },
                    });

                const response =
                    await app.inject({
                        method: "PATCH",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/retrack",

                        payload: {
                            fullName:
                                existingRepository.fullName,
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    409,
                );

                const body =
                    response.json();

                assert.equal(
                    body.success,
                    false,
                );

                assert.match(
                    body.message,
                    /already tracked by another ArcHive user/i,
                );

                assert.equal(
                    repositoryUpdateCalls,
                    0,
                );

                assert.equal(
                    webhookCalls,
                    0,
                );

                assert.equal(
                    intelligenceGenerationCalls,
                    0,
                );

                assert.equal(
                    userActivityUpdateCalls,
                    0,
                );

                /**
                 * The original owner remains untouched.
                 */
                assert.equal(
                    existingRepository.userId,
                    "another-user-id",
                );

                assert.equal(
                    existingRepository.isTracked,
                    true,
                );
            },
        );


        test(
            "dedicated retrack fails safely when the user has no GitHub access token",
            async () => {
                const userWithoutGitHubToken = {
                    ...user,

                    githubAccessToken: null,
                };

                let repositoryLookupCalls = 0;
                let repositoryUpdateCalls = 0;
                let userActivityUpdateCalls = 0;
                let webhookCalls = 0;
                let intelligenceGenerationCalls = 0;

                /**
                 * Override the normal user fixture for
                 * this test only.
                 */
                userDelegate.findUnique =
                    async () =>
                        userWithoutGitHubToken;

                repositoryDelegate.findUnique =
                    async () => {
                        repositoryLookupCalls += 1;

                        return null;
                    };

                repositoryDelegate.update =
                    async () => {
                        repositoryUpdateCalls += 1;

                        throw new Error(
                            "Repository state must not change without a GitHub token.",
                        );
                    };

                userDelegate.update =
                    async () => {
                        userActivityUpdateCalls += 1;

                        throw new Error(
                            "Failed retrack must not update user activity.",
                        );
                    };

                axios.get =
                    async () => {
                        webhookCalls += 1;

                        throw new Error(
                            "GitHub must not be called without an access token.",
                        );
                    };

                axios.post =
                    async () => {
                        webhookCalls += 1;

                        throw new Error(
                            "GitHub must not be called without an access token.",
                        );
                    };

                const app =
                    await buildApp({
                        generateRepositoryIntelligence:
                            async () => {
                                intelligenceGenerationCalls += 1;

                                throw new Error(
                                    "Intelligence must not run when retrack validation fails.",
                                );
                            },
                    });

                const response =
                    await app.inject({
                        method: "PATCH",

                        url:
                            `/api/github/users/${userId}` +
                            "/repositories/retrack",

                        payload: {
                            fullName:
                                githubRepository.fullName,
                        },
                    });

                await app.close();

                assert.equal(
                    response.statusCode,
                    400,
                );

                const body =
                    response.json();

                assert.equal(
                    body.success,
                    false,
                );

                assert.match(
                    body.message,
                    /GitHub access token is unavailable/i,
                );

                /**
                 * Our guard occurs before repository mutation
                 * and before all GitHub/intelligence side effects.
                 */
                assert.equal(
                    repositoryUpdateCalls,
                    0,
                );

                assert.equal(
                    webhookCalls,
                    0,
                );

                assert.equal(
                    intelligenceGenerationCalls,
                    0,
                );

                assert.equal(
                    userActivityUpdateCalls,
                    0,
                );

                /**
                 * If your guard is immediately after user lookup,
                 * repository lookup should not even be necessary.
                 */
                assert.equal(
                    repositoryLookupCalls,
                    0,
                );
            },
        );

    },
);