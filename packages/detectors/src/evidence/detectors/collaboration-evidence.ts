import type {
  EvidenceContext,
} from "../evidence-types";

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalized =
      file.replace(/\\/g, "/").toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalized),
    );
  });
};

/**
 * A repository is not a collaboration platform merely because it contains
 * teams, messages, or workspaces. Those concepts appear in many products.
 *
 * Classification requires multiple collaboration-specific capabilities.
 */
export const detectCollaborationEvidence = (
  context: EvidenceContext,
): void => {
  const {
    filesChanged,
    repositoryFiles,
    dependencies,
    imports,
    descriptiveText,
    addEvidence,
  } = context;

  const hasMessagingStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)messages?\//,
        /(^|\/)channels?\//,
        /(^|\/)conversations?\//,
        /(^|\/)chat\//,
        /\.message\.(ts|js|py)$/,
        /\.channel\.(ts|js|py)$/,
      ],
    );

  const hasCollaborativeEditingStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)presence\//,
        /(^|\/)documents?\/.*collab/,
        /(^|\/)collaboration\//,
        /(^|\/)shared-documents?\//,
        /(^|\/)cursors?\//,
        /\.presence\.(ts|js)$/,
        /\.collaboration\.(ts|js)$/,
      ],
    );

  const hasRealtimeCollaborationDependency =
    [
      "yjs",
      "y-websocket",
      "automerge",
      "@liveblocks/client",
      "@liveblocks/react",
      "socket.io",
    ].some(
      (dependency) =>
        dependencies.has(dependency) ||
        imports.has(dependency),
    );

  const hasCollaborationCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "typing indicator",
        "online presence",
        "shared document",
        "live cursor",
        "channel member",
        "message thread",
        "document awareness",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongPurposeLanguage =
    [
      "team collaboration platform",
      "realtime collaboration",
      "real-time collaboration",
      "collaborative editing",
      "team messaging platform",
      "shared document platform",
      "workspace communication",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasMessagingStructure &&
    hasRealtimeCollaborationDependency
  ) {
    addEvidence(
      "COLLABORATION_PLATFORM",
      "Detected messaging structure with realtime collaboration infrastructure",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasCollaborativeEditingStructure ||
    hasCollaborationCode
  ) {
    addEvidence(
      "COLLABORATION_PLATFORM",
      "Detected collaborative editing, presence, shared-document, or live-cursor implementation",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPurposeLanguage &&
    (
      hasMessagingStructure ||
      hasCollaborativeEditingStructure ||
      hasCollaborationCode
    )
  ) {
    addEvidence(
      "COLLABORATION_PLATFORM",
      "Repository purpose explicitly describes realtime collaboration or team communication",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};