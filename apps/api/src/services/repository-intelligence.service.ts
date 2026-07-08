import axios from "axios";
import { prisma } from "@archive/database";
import { detectTechnologyFingerprint } from "@archive/detectors";

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

import { GENERATED_CHANGE_TYPE } from "../constants/intelligence.constants";

const getGitHubHeaders = (token?: string | null) => ({
  Accept: "application/vnd.github+json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const fetchRepositoryTree = async ({
  fullName,
  defaultBranch,
  githubAccessToken,
}: {
  fullName: string;
  defaultBranch: string;
  githubAccessToken?: string | null;
}) => {
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

    return (response.data.tree || [])
      .map((item: { path?: string; type?: string }) => item.path)
      .filter((path: string | undefined): path is string => Boolean(path));
  } catch {
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

    return Buffer.from(response.data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
};

export const generateRepositoryIntelligence = async ({
  repositoryId,
}: {
  repositoryId: string;
}) => {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
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

  const realArchitectureChanges = repository.architectureChanges.filter(
    (change) => change.changeType !== GENERATED_CHANGE_TYPE
  );

  const githubAccessToken = repository.user?.githubAccessToken || null;

  const githubFilePaths = await fetchRepositoryTree({
    fullName: repository.fullName,
    defaultBranch: repository.defaultBranch,
    githubAccessToken,
  });

  const readmeContent = await fetchRepositoryReadme({
    fullName: repository.fullName,
    githubAccessToken,
  });

  const filesChanged = Array.from(
    new Set([
      ...githubFilePaths,
      ...realArchitectureChanges
        .map((change) => change.fileAffected)
        .filter((file): file is string => Boolean(file)),
    ])
  );

  const repositoryContext = [
    repository.name,
    repository.fullName,
    repository.description || "",
    repository.language || "",
    readmeContent,
    githubFilePaths.join(" "),

    ...realArchitectureChanges.map((change) =>
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

  const commitMessages = [
    repository.name,
    repository.fullName,
    repository.description || "",
    repository.language || "",
    readmeContent,

    ...realArchitectureChanges.map((change) =>
      [
        change.changeType,
        change.detectedTechnology || "",
        change.summary,
      ].join(" ")
    ),
  ].filter(Boolean);

  const fingerprint = detectTechnologyFingerprint(
    filesChanged,
    commitMessages,
    repositoryContext
  );

  const repositoryIntelligence = fingerprint.repositoryIntelligence;

  const primaryRepositoryType =
    repositoryIntelligence.identity.primaryRepositoryType ||
    repositoryIntelligence.identity.repositoryTypes[0] ||
    fingerprint.repositoryTypes[0] ||
    "GENERAL_ENGINEERING_PROJECT";

  const primaryTechnology =
    repositoryIntelligence.signals.technologies[0] ||
    fingerprint.technologies[0] ||
    "Repository Intelligence";

  const primaryArchitectureDomain =
    repositoryIntelligence.signals.architectureDomains[0] ||
    fingerprint.architectureDomains[0] ||
    "GENERAL_ENGINEERING";

  const reasoningSignals =
    repositoryIntelligence.signals.reasoningSignals.length > 0
      ? repositoryIntelligence.signals.reasoningSignals
      : fingerprint.reasoningSignals;

  await prisma.$transaction(async (tx) => {
    await tx.architectureChange.deleteMany({
      where: {
        repositoryId,
        changeType: GENERATED_CHANGE_TYPE,
      },
    });

    await tx.architectureChange.create({
      data: {
        repositoryId,
        changeType: GENERATED_CHANGE_TYPE,
        detectedTechnology: primaryTechnology,
        fileAffected: "repository-intelligence.service.ts",
        architectureDomain: primaryArchitectureDomain,
        repositoryTypes: repositoryIntelligence.identity.repositoryTypes.join(","),
        reasoningSignals: reasoningSignals.join(","),
        summary: `${repository.name} intelligence was regenerated as ${primaryRepositoryType}.`,
        evolutionSummary:
          repositoryIntelligence.assessment.evolutionInsights.summary ||
          "Repository intelligence was regenerated using the latest ArcHive intelligence engine.",
      },
    });
  });

  return {
    repository: {
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
    },
    fingerprint,
    repositoryIntelligence,
  };
};