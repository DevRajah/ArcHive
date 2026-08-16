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
        });


        afterEach(() => {
            userDelegate.findUnique =
                originalUserFindUnique;

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


        const buildApp = async () => {
            const app = Fastify();

            await app.register(
                githubSyncRoutes,
                {
                    prefix: "/api/github",
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
    },
);