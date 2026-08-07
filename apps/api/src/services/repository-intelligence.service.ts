import axios from "axios";
import { prisma } from "@archive/database";
import { detectTechnologyFingerprint } from "@archive/detectors";
import { createRepositoryIntelligenceSnapshot } from "./intelligence-snapshot.service";

import { GENERATED_CHANGE_TYPE } from "../constants/intelligence.constants";

/*
|--------------------------------------------------------------------------
| Single source of truth for repository intelligence generation.
|
| Any current or future intelligence trigger should call this service:
|
| - GitHub webhook processors
| - Manual single-repository reprocess
| - Portfolio-wide reprocess
| - Scheduled refresh jobs
| - Future background workers
|
| This keeps ArcHive from having duplicated intelligence-generation logic.
|--------------------------------------------------------------------------
*/

type GitHubTreeEntry = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

type RepositoryFileContent = {
  path: string;
  content: string;
};

type GitHubRepositoryMetadata = {
  fullName: string;
  name: string;
  owner: string;
  defaultBranch: string;
};

const getGitHubHeaders = (token?: string | null) => ({
  Accept: "application/vnd.github+json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/*
|--------------------------------------------------------------------------
| Resolve repository metadata from GitHub.
|
| Future me:
| Do not blindly trust the repository name/default branch stored locally.
| Repositories can be renamed and their default branches can change.
|--------------------------------------------------------------------------
*/
const fetchGitHubRepositoryMetadata = async ({
  fullName,
  githubAccessToken,
}: {
  fullName: string;
  githubAccessToken?: string | null;
}): Promise<GitHubRepositoryMetadata | null> => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${fullName}`,
      {
        headers: getGitHubHeaders(githubAccessToken),
      }
    );

    const resolvedFullName = response.data.full_name;
    const resolvedName = response.data.name;
    const resolvedOwner = response.data.owner?.login;
    const resolvedDefaultBranch = response.data.default_branch;

    if (
      typeof resolvedFullName !== "string" ||
      typeof resolvedName !== "string" ||
      typeof resolvedOwner !== "string" ||
      typeof resolvedDefaultBranch !== "string"
    ) {
      return null;
    }

    return {
      fullName: resolvedFullName,
      name: resolvedName,
      owner: resolvedOwner,
      defaultBranch: resolvedDefaultBranch,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[REPOSITORY METADATA FETCH FAILED]", {
        repository: fullName,
        status: error.response?.status,
        message:
          error.response?.data?.message ??
          error.message,
      });
    } else {
      console.error("[REPOSITORY METADATA FETCH FAILED]", {
        repository: fullName,
        error,
      });
    }

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Keep stored repository metadata aligned with GitHub.
|--------------------------------------------------------------------------
*/
const syncRepositoryMetadata = async ({
  repositoryId,
  storedFullName,
  storedDefaultBranch,
  resolvedMetadata,
}: {
  repositoryId: string;
  storedFullName: string;
  storedDefaultBranch: string;
  resolvedMetadata: GitHubRepositoryMetadata;
}) => {
  const fullNameChanged =
    storedFullName !== resolvedMetadata.fullName;

  const branchChanged =
    storedDefaultBranch !== resolvedMetadata.defaultBranch;

  if (!fullNameChanged && !branchChanged) {
    return;
  }

  await prisma.repository.update({
    where: {
      id: repositoryId,
    },
    data: {
      fullName: resolvedMetadata.fullName,
      name: resolvedMetadata.name,
      owner: resolvedMetadata.owner,
      defaultBranch: resolvedMetadata.defaultBranch,
    },
  });

  console.log("[REPOSITORY METADATA SYNCED]", {
    repositoryId,
    storedFullName,
    resolvedFullName: resolvedMetadata.fullName,
    storedDefaultBranch,
    resolvedDefaultBranch:
      resolvedMetadata.defaultBranch,
  });
};

const fetchRepositoryTree = async ({
  fullName,
  defaultBranch,
  githubAccessToken,
}: {
  fullName: string;
  defaultBranch: string;
  githubAccessToken?: string | null;
}): Promise<GitHubTreeEntry[]> => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${fullName}/git/trees/${defaultBranch}`,
      {
        headers: getGitHubHeaders(githubAccessToken),
        params: {
          recursive: "1",
        },
      }
    );

    const tree = Array.isArray(response.data.tree)
      ? response.data.tree
      : [];

    return tree
      .filter(
        (
          item: {
            path?: string;
            type?: string;
            size?: number;
          }
        ): item is {
          path: string;
          type: "blob" | "tree";
          size?: number;
        } =>
          Boolean(item.path) &&
          (item.type === "blob" || item.type === "tree")
      )
      .map(
        (item: {
          path: string;
          type: "blob" | "tree";
          size?: number;
        }) => ({
          path: item.path,
          type: item.type,
          size: item.size,
        })
      );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[REPOSITORY TREE FETCH FAILED]", {
        repository: fullName,
        branch: defaultBranch,
        status: error.response?.status,
        message:
          error.response?.data?.message ??
          error.message,
      });
    } else {
      console.error("[REPOSITORY TREE FETCH FAILED]", {
        repository: fullName,
        branch: defaultBranch,
        error,
      });
    }

    return [];
  }
};

const fetchRepositoryReadme = async ({
  fullName,
  githubAccessToken,
}: {
  fullName: string;
  githubAccessToken?: string | null;
}) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${fullName}/readme`,
      {
        headers: getGitHubHeaders(githubAccessToken),
      }
    );

    if (!response.data.content) {
      return "";
    }

    return Buffer.from(
      response.data.content,
      "base64"
    ).toString("utf-8");
  } catch {
    return "";
  }
};

const MAX_REPOSITORY_FILES = 60;
const MAX_SINGLE_FILE_BYTES = 150_000;
const MAX_TOTAL_FILE_BYTES = 2_000_000;

const SOURCE_FILE_PATTERN =
  /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const HIGH_VALUE_FILE_PATTERNS = [
  /(^|\/)package\.json$/i,

  /(^|\/)next\.config\.(js|ts|mjs|cjs)$/i,
  /(^|\/)vite\.config\.(js|ts|mjs|cjs)$/i,
  /(^|\/)nest-cli\.json$/i,

  /(^|\/)dockerfile$/i,
  /(^|\/)dockerfile\.[^/]+$/i,
  /(^|\/)docker-compose\.ya?ml$/i,

  /(^|\/)schema\.prisma$/i,

  /(^|\/)(server|app|main|index)\.[jt]sx?$/i,

  /\/(services?|routes?|controllers?|workers?|queues?|providers?|adapters?|config)\//i,
];

const IGNORED_PATH_PARTS = [
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  ".next/",
  ".turbo/",
  "generated/",
  "vendor/",

  /*
  |--------------------------------------------------------------------------
  | ArcHive detector implementation folders.
  |
  | Prevent ArcHive from reading its own technology dictionaries as though
  | those technologies were actually implemented by ArcHive itself.
  |--------------------------------------------------------------------------
  */
  "packages/detectors/src/technologies/",
  "packages/detectors/src/evidence/",
];

const normalizeRepositoryPath = (
  filePath: string
): string => {
  return filePath
    .replace(/\\/g, "/")
    .toLowerCase();
};

const shouldIgnoreRepositoryFile = (
  filePath: string
): boolean => {
  const normalizedPath =
    normalizeRepositoryPath(filePath);

  return IGNORED_PATH_PARTS.some(
    (ignoredPart) =>
      normalizedPath.includes(ignoredPart)
  );
};

const isUsefulRepositoryFile = (
  entry: GitHubTreeEntry
): boolean => {
  if (entry.type !== "blob") {
    return false;
  }

  if (shouldIgnoreRepositoryFile(entry.path)) {
    return false;
  }

  if (
    typeof entry.size === "number" &&
    entry.size > MAX_SINGLE_FILE_BYTES
  ) {
    return false;
  }

  return (
    SOURCE_FILE_PATTERN.test(entry.path) ||
    HIGH_VALUE_FILE_PATTERNS.some(
      (pattern) => pattern.test(entry.path)
    )
  );
};

const selectRepositoryFiles = (
  entries: GitHubTreeEntry[]
): GitHubTreeEntry[] => {
  const usefulEntries =
    entries.filter(isUsefulRepositoryFile);

  /*
  |--------------------------------------------------------------------------
  | High-value repository evidence comes first.
  |
  | This prevents ordinary source files from pushing package.json, Prisma
  | schemas, Docker configuration and application entrypoints out of the
  | ingestion limit.
  |--------------------------------------------------------------------------
  */
  return usefulEntries
    .sort((left, right) => {
      const leftPriority =
        HIGH_VALUE_FILE_PATTERNS.some(
          (pattern) => pattern.test(left.path)
        )
          ? 0
          : 1;

      const rightPriority =
        HIGH_VALUE_FILE_PATTERNS.some(
          (pattern) => pattern.test(right.path)
        )
          ? 0
          : 1;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.path.localeCompare(right.path);
    })
    .slice(0, MAX_REPOSITORY_FILES);
};

const encodeGitHubFilePath = (
  filePath: string
): string => {
  return filePath
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment)
    )
    .join("/");
};

const fetchRepositoryFile = async ({
  fullName,
  defaultBranch,
  filePath,
  githubAccessToken,
}: {
  fullName: string;
  defaultBranch: string;
  filePath: string;
  githubAccessToken?: string | null;
}): Promise<RepositoryFileContent | null> => {
  try {
    const encodedPath =
      encodeGitHubFilePath(filePath);

    const response = await axios.get(
      `https://api.github.com/repos/${fullName}/contents/${encodedPath}`,
      {
        headers: getGitHubHeaders(
          githubAccessToken
        ),
        params: {
          ref: defaultBranch,
        },
      }
    );

    if (
      response.data.type !== "file" ||
      response.data.encoding !== "base64" ||
      typeof response.data.content !== "string"
    ) {
      return null;
    }

    const content =
      Buffer.from(
        response.data.content,
        "base64"
      ).toString("utf-8");

    if (
      Buffer.byteLength(content, "utf-8") >
      MAX_SINGLE_FILE_BYTES
    ) {
      return null;
    }

    return {
      path: filePath,
      content,
    };
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | One unavailable file must not kill the complete intelligence run.
    |--------------------------------------------------------------------------
    */
    if (axios.isAxiosError(error)) {
      console.error("[REPOSITORY FILE FETCH FAILED]", {
        repository: fullName,
        branch: defaultBranch,
        filePath,
        status: error.response?.status,
        message:
          error.response?.data?.message ??
          error.message,
      });
    } else {
      console.error("[REPOSITORY FILE FETCH FAILED]", {
        repository: fullName,
        branch: defaultBranch,
        filePath,
        error,
      });
    }

    return null;
  }
};

const fetchRepositoryFiles = async ({
  fullName,
  defaultBranch,
  entries,
  githubAccessToken,
}: {
  fullName: string;
  defaultBranch: string;
  entries: GitHubTreeEntry[];
  githubAccessToken?: string | null;
}): Promise<RepositoryFileContent[]> => {
  const selectedEntries =
    selectRepositoryFiles(entries);

  const results =
    await Promise.allSettled(
      selectedEntries.map((entry) =>
        fetchRepositoryFile({
          fullName,
          defaultBranch,
          filePath: entry.path,
          githubAccessToken,
        })
      )
    );

  const repositoryFiles:
    RepositoryFileContent[] = [];

  let totalBytes = 0;

  for (const result of results) {
    if (
      result.status !== "fulfilled" ||
      !result.value
    ) {
      continue;
    }

    const fileBytes =
      Buffer.byteLength(
        result.value.content,
        "utf-8"
      );

    if (
      totalBytes + fileBytes >
      MAX_TOTAL_FILE_BYTES
    ) {
      continue;
    }

    repositoryFiles.push(result.value);
    totalBytes += fileBytes;
  }

  return repositoryFiles;
};

export const generateRepositoryIntelligence = async ({
  repositoryId,
}: {
  repositoryId: string;
}) => {
  console.log(
    "🔥 GENERATE REPOSITORY INTELLIGENCE CALLED",
    {
      repositoryId,
    }
  );

  const repository =
    await prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
      include: {
        user: {
          select: {
            githubAccessToken: true,
          },
        },
        architectureChanges: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const realArchitectureChanges =
    repository.architectureChanges.filter(
      (change) =>
        change.changeType !==
        GENERATED_CHANGE_TYPE
    );

  const githubAccessToken =
    repository.user?.githubAccessToken ??
    null;

  /*
  |--------------------------------------------------------------------------
  | Resolve repository identity before reading its tree.
  |
  | This is important. Previously ArcHive fetched the tree using stale local
  | metadata and only attempted metadata handling afterwards.
  |--------------------------------------------------------------------------
  */
  const githubMetadata =
    await fetchGitHubRepositoryMetadata({
      fullName: repository.fullName,
      githubAccessToken,
    });

  const resolvedFullName =
    githubMetadata?.fullName ??
    repository.fullName;

  const resolvedDefaultBranch =
    githubMetadata?.defaultBranch ??
    repository.defaultBranch;

  console.log(
    "[RESOLVED GITHUB REPOSITORY]",
    {
      storedFullName:
        repository.fullName,

      resolvedFullName,

      storedDefaultBranch:
        repository.defaultBranch,

      resolvedDefaultBranch,

      metadataResolved:
        Boolean(githubMetadata),
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Persist corrected metadata when GitHub successfully resolves the repo.
  |--------------------------------------------------------------------------
  */
  if (githubMetadata) {
    await syncRepositoryMetadata({
      repositoryId: repository.id,
      storedFullName:
        repository.fullName,
      storedDefaultBranch:
        repository.defaultBranch,
      resolvedMetadata:
        githubMetadata,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Everything below uses RESOLVED metadata.
  |--------------------------------------------------------------------------
  */
  const githubTree =
    await fetchRepositoryTree({
      fullName: resolvedFullName,
      defaultBranch:
        resolvedDefaultBranch,
      githubAccessToken,
    });

  const githubFilePaths =
    githubTree
      .filter(
        (entry) =>
          entry.type === "blob"
      )
      .map(
        (entry) => entry.path
      );

  const repositoryFiles =
    await fetchRepositoryFiles({
      fullName: resolvedFullName,
      defaultBranch:
        resolvedDefaultBranch,
      entries: githubTree,
      githubAccessToken,
    });

  console.log(
    "========== REPOSITORY INGESTION =========="
  );

  console.log({
    repository:
      resolvedFullName,

    defaultBranch:
      resolvedDefaultBranch,

    storedRepository:
      repository.fullName,

    storedDefaultBranch:
      repository.defaultBranch,

    hasGitHubAccessToken:
      Boolean(githubAccessToken),

    treeEntries:
      githubTree.length,

    githubFilePaths:
      githubFilePaths.length,

    selectedRepositoryFiles:
      repositoryFiles.length,

    fetchedFilePaths:
      repositoryFiles.map(
        (file) => file.path
      ),
  });

  console.log(
    "=========================================="
  );

  const readmeContent =
    await fetchRepositoryReadme({
      fullName: resolvedFullName,
      githubAccessToken,
    });

  const filesChanged =
    Array.from(
      new Set([
        ...githubFilePaths,

        ...realArchitectureChanges
          .map(
            (change) =>
              change.fileAffected
          )
          .filter(
            (file): file is string =>
              Boolean(file)
          ),
      ])
    );

  /*
  |--------------------------------------------------------------------------
  | Build descriptive repository context.
  |
  | Use the current GitHub identity here as well so stale names and branches
  | cannot leak back into detector evidence.
  |--------------------------------------------------------------------------
  */
  const repositoryContext = [
    githubMetadata?.name ??
      repository.name,

    resolvedFullName,

    repository.description || "",

    repository.language || "",

    readmeContent,

    githubFilePaths.join(" "),

    ...realArchitectureChanges.map(
      (change) =>
        [
          change.changeType,
          change.detectedTechnology || "",
          change.summary,
          change.repositoryTypes || "",
          change.reasoningSignals || "",
          change.architectureDomain || "",
          change.evolutionSummary || "",
        ].join(" ")
    ),
  ]
    .filter(Boolean)
    .join(" ");

  /*
  |--------------------------------------------------------------------------
  | Commit evidence should contain real historical architecture-change text,
  | not repository metadata or generated intelligence summaries.
  |--------------------------------------------------------------------------
  */
  const commitMessages =
    realArchitectureChanges.map(
      (change) =>
        [
          change.changeType,
          change.summary,
        ]
          .filter(Boolean)
          .join(" ")
    );

  const fingerprint =
    detectTechnologyFingerprint(
      filesChanged,
      commitMessages,
      repositoryContext,
      repositoryFiles
    );

  const repositoryIntelligence =
    fingerprint.repositoryIntelligence;

  const primaryRepositoryType =
    repositoryIntelligence.identity
      .primaryRepositoryType ||
    repositoryIntelligence.identity
      .repositoryTypes[0] ||
    fingerprint.repositoryTypes[0] ||
    "GENERAL_ENGINEERING_PROJECT";

  const primaryTechnology =
    repositoryIntelligence.signals
      .technologies[0] ||
    fingerprint.technologies[0] ||
    "Repository Intelligence";

  const primaryArchitectureDomain =
    repositoryIntelligence.signals
      .architectureDomains[0] ||
    fingerprint.architectureDomains[0] ||
    "GENERAL_ENGINEERING";

  const reasoningSignals =
    repositoryIntelligence.signals
      .reasoningSignals.length > 0
      ? repositoryIntelligence.signals
          .reasoningSignals
      : fingerprint.reasoningSignals;

  await prisma.$transaction(
    async (tx) => {
      /*
      |--------------------------------------------------------------------------
      | Keep one current generated ArchitectureChange row.
      |--------------------------------------------------------------------------
      */
      await tx.architectureChange.deleteMany({
        where: {
          repositoryId,
          changeType:
            GENERATED_CHANGE_TYPE,
        },
      });

      await tx.architectureChange.create({
        data: {
          repositoryId,

          changeType:
            GENERATED_CHANGE_TYPE,

          detectedTechnology:
            primaryTechnology,

          fileAffected:
            "repository-intelligence.service.ts",

          architectureDomain:
            primaryArchitectureDomain,

          repositoryTypes:
            repositoryIntelligence.identity
              .repositoryTypes
              .join(","),

          reasoningSignals:
            reasoningSignals.join(","),

          summary:
            `${
              githubMetadata?.name ??
              repository.name
            } intelligence was regenerated as ${primaryRepositoryType}.`,

          evolutionSummary:
            repositoryIntelligence.assessment
              .evolutionInsights.summary ||
            "Repository intelligence was regenerated using the latest ArcHive intelligence engine.",
        },
      });

      /*
      |--------------------------------------------------------------------------
      | Preserve the complete immutable intelligence snapshot.
      |--------------------------------------------------------------------------
      */
      await createRepositoryIntelligenceSnapshot({
        tx,
        repositoryId,
        fingerprint,
      });
    }
  );

  return {
    repository: {
      id: repository.id,

      name:
        githubMetadata?.name ??
        repository.name,

      fullName:
        resolvedFullName,

      defaultBranch:
        resolvedDefaultBranch,
    },

    fingerprint,

    repositoryIntelligence,
  };
};