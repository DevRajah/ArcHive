import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";
import axios from "axios";

type SyncRepositoryBody = {
  userId?: string;
  githubRepoId?: string;
  name: string;
  owner: string;
  fullName: string;
  description?: string | null;
  defaultBranch?: string;

  // I keep GitHub metadata here so manual sync and frontend import can persist it.
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  stars?: number;
  forks?: number;
};

type GitHubRepositoryPayload = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  private: boolean;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  owner: {
    login: string;
  };
};

const getGitHubHeaders = (githubAccessToken: string) => ({
  Authorization: `Bearer ${githubAccessToken}`,
  Accept: "application/vnd.github+json",
});

const normalizeRepositoryMetadata = (repo: {
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  stars?: number;
  forks?: number;
}) => ({
  language: repo.language || null,
  stars: repo.stargazers_count ?? repo.stars ?? 0,
  forks: repo.forks_count ?? repo.forks ?? 0,
});

const installRepositoryWebhook = async ({
  githubAccessToken,
  repositoryFullName,
}: {
  githubAccessToken: string;
  repositoryFullName: string;
}) => {
  const publicWebhookUrl = process.env.PUBLIC_WEBHOOK_URL;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!publicWebhookUrl || !webhookSecret) {
    return {
      installed: false,
      reason: "PUBLIC_WEBHOOK_URL or GITHUB_WEBHOOK_SECRET is missing",
    };
  }

  const webhookUrl = `${publicWebhookUrl}/api/github/webhook`;

  const existingHooksResponse = await axios.get(
    `https://api.github.com/repos/${repositoryFullName}/hooks`,
    {
      headers: getGitHubHeaders(githubAccessToken),
    }
  );

  const existingHook = existingHooksResponse.data.find(
    (hook: any) => hook.config?.url === webhookUrl
  );

  if (existingHook) {
    return {
      installed: true,
      alreadyInstalled: true,
      webhookId: existingHook.id,
      webhookUrl,
    };
  }

  const hookResponse = await axios.post(
    `https://api.github.com/repos/${repositoryFullName}/hooks`,
    {
      name: "web",
      active: true,
      events: ["push", "pull_request"],
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: webhookSecret,
        insecure_ssl: "0",
      },
    },
    {
      headers: getGitHubHeaders(githubAccessToken),
    }
  );

  return {
    installed: true,
    alreadyInstalled: false,
    webhookId: hookResponse.data.id,
    webhookUrl,
  };
};

export const githubSyncRoutes = async (app: FastifyInstance) => {
  app.post("/repositories/sync", async (request, reply) => {
    const {
      userId,
      githubRepoId,
      name,
      owner,
      fullName,
      description,
      defaultBranch,
      language,
      stargazers_count,
      forks_count,
      stars,
      forks,
    } = request.body as SyncRepositoryBody;

    if (!name || !owner || !fullName) {
      return reply.status(400).send({
        success: false,
        message: "name, owner and fullName are required",
      });
    }

    const metadata = normalizeRepositoryMetadata({
      language,
      stargazers_count,
      forks_count,
      stars,
      forks,
    });

    const repository = await prisma.repository.upsert({
      where: { fullName },
      create: {
        githubRepoId: githubRepoId || fullName,
        name,
        owner,
        fullName,
        description: description || null,
        defaultBranch: defaultBranch || "main",
        language: metadata.language,
        stars: metadata.stars,
        forks: metadata.forks,
        userId: userId || null,
      },
      update: {
        githubRepoId: githubRepoId || fullName,
        name,
        owner,
        description: description || null,
        defaultBranch: defaultBranch || "main",
        language: metadata.language,
        stars: metadata.stars,
        forks: metadata.forks,
        userId: userId || null,
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Repository synced successfully",
      data: repository,
    });
  });

  app.post(
    "/users/:userId/repositories/:repositoryId/webhook/install",
    async (request, reply) => {
      const { userId, repositoryId } = request.params as {
        userId: string;
        repositoryId: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.githubAccessToken) {
        return reply.status(404).send({
          success: false,
          message: "GitHub-connected user not found",
        });
      }

      const repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId,
          userId,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Tracked repository not found for this user",
        });
      }

      const webhookInstallation = await installRepositoryWebhook({
        githubAccessToken: user.githubAccessToken,
        repositoryFullName: repository.fullName,
      });

      const statusCode = webhookInstallation.installed ? 201 : 500;

      return reply.status(statusCode).send({
        success: webhookInstallation.installed,
        message: webhookInstallation.installed
          ? "Repository webhook installed successfully"
          : "Repository webhook installation failed",
        data: {
          repositoryId: repository.id,
          repositoryFullName: repository.fullName,
          webhook: webhookInstallation,
        },
      });
    }
  );

  app.post("/users/:userId/repositories/import", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.githubAccessToken) {
      return reply.status(404).send({
        success: false,
        message: "GitHub-connected user not found",
      });
    }

    const githubReposResponse = await axios.get<GitHubRepositoryPayload[]>(
      "https://api.github.com/user/repos",
      {
        headers: getGitHubHeaders(user.githubAccessToken),
        params: {
          per_page: 100,
          sort: "updated",
        },
      }
    );

    const syncedRepositories = [];

    for (const repo of githubReposResponse.data) {
      const metadata = normalizeRepositoryMetadata({
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
      });

      const repository = await prisma.repository.upsert({
        where: {
          fullName: repo.full_name,
        },
        create: {
          githubRepoId: String(repo.id),
          name: repo.name,
          owner: repo.owner.login,
          fullName: repo.full_name,
          description: repo.description,
          defaultBranch: repo.default_branch,
          language: metadata.language,
          stars: metadata.stars,
          forks: metadata.forks,
          userId: user.id,
          isTracked: false,
        },
        update: {
          githubRepoId: String(repo.id),
          name: repo.name,
          owner: repo.owner.login,
          description: repo.description,
          defaultBranch: repo.default_branch,
          language: metadata.language,
          stars: metadata.stars,
          forks: metadata.forks,
          userId: user.id,
          isTracked: false,
        },
      });

      syncedRepositories.push(repository);
    }

    return {
      success: true,
      message: "GitHub repositories imported successfully",
      data: {
        importedCount: syncedRepositories.length,
        repositories: syncedRepositories,
      },
    };
  });

  app.get("/users/:userId/repositories/available", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.githubAccessToken) {
      return reply.status(404).send({
        success: false,
        message: "GitHub-connected user not found",
      });
    }

    const githubReposResponse = await axios.get<GitHubRepositoryPayload[]>(
      "https://api.github.com/user/repos",
      {
        headers: getGitHubHeaders(user.githubAccessToken),
        params: {
          per_page: 100,
          sort: "updated",
        },
      }
    );

    return {
      success: true,
      message: "Available GitHub repositories fetched successfully",
      data: githubReposResponse.data.map((repo) => ({
        githubRepoId: String(repo.id),
        name: repo.name,
        owner: repo.owner.login,
        fullName: repo.full_name,
        description: repo.description,
        defaultBranch: repo.default_branch,
        private: repo.private,

        // I return both GitHub-style and frontend-friendly names so import flow has everything it needs.
        language: repo.language || null,
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
      })),
    };
  });

  app.post("/users/:userId/repositories/import-selected", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const { repositories } = request.body as {
      repositories?: SyncRepositoryBody[];
    };

    if (!repositories || repositories.length === 0) {
      return reply.status(400).send({
        success: false,
        message: "At least one repository is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.githubAccessToken) {
      return reply.status(404).send({
        success: false,
        message: "GitHub-connected user not found",
      });
    }

    const syncedRepositories = [];

    for (const repo of repositories) {
      const metadata = normalizeRepositoryMetadata(repo);

      const repository = await prisma.repository.upsert({
        where: { fullName: repo.fullName },
        create: {
          githubRepoId: repo.githubRepoId || repo.fullName,
          name: repo.name,
          owner: repo.owner,
          fullName: repo.fullName,
          description: repo.description || null,
          defaultBranch: repo.defaultBranch || "main",
          language: metadata.language,
          stars: metadata.stars,
          forks: metadata.forks,
          userId: user.id,
          isTracked: true,
        },
        update: {
          githubRepoId: repo.githubRepoId || repo.fullName,
          name: repo.name,
          owner: repo.owner,
          description: repo.description || null,
          defaultBranch: repo.defaultBranch || "main",
          language: metadata.language,
          stars: metadata.stars,
          forks: metadata.forks,
          userId: user.id,
          isTracked: true,
        },
      });

      // I automatically install the GitHub webhook when a repo is imported/tracked.
      const webhookInstallation = await installRepositoryWebhook({
        githubAccessToken: user.githubAccessToken,
        repositoryFullName: repo.fullName,
      });

      syncedRepositories.push({
        ...repository,
        webhook: webhookInstallation,
      });
    }

    return {
      success: true,
      message:
        "Selected GitHub repositories imported and live tracking configured successfully",
      data: {
        importedCount: syncedRepositories.length,
        repositories: syncedRepositories,
      },
    };
  });

  app.get("/users/:userId/repositories/tracked", async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId,
        isTracked: true,
      }, orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            events: true,
            timelineEntries: true,
            architectureChanges: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Tracked repositories fetched successfully",
      data: repositories,
    };
  });

  app.patch("/users/:userId/repositories/:repositoryId/untrack",
    async (request, reply) => {
      const { userId, repositoryId } = request.params as {
        userId: string;
        repositoryId: string;
      };

      const repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId,
          userId,
        },
      });

      if (!repository) {
        return reply.status(404).send({
          success: false,
          message: "Tracked repository not found for this user",
        });
      }

      const updatedRepository = await prisma.repository.update({
        where: { id: repositoryId },
        data: { userId: null },
      });

      return {
        success: true,
        message: "Repository untracked successfully",
        data: updatedRepository,
      };
    }
  );

  app.patch("/users/:userId/repositories/retrack", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { fullName } = request.body as { fullName?: string };

    if (!fullName) {
      return reply.status(400).send({
        success: false,
        message: "fullName is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const repository = await prisma.repository.findUnique({
      where: { fullName },
    });

    if (!repository) {
      return reply.status(404).send({
        success: false,
        message: "Repository does not exist in ArcHive yet. Import it first.",
      });
    }

    const updatedRepository = await prisma.repository.update({
      where: { id: repository.id },
      data: { userId },
    });

    return {
      success: true,
      message: "Repository retracked successfully",
      data: updatedRepository,
    };
  });
};