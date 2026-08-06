import type {
    EvidenceContext,
} from "../../evidence";

const addConfirmedTechnology = (
    context: EvidenceContext,
    name: string,
    reason: string,
    evidence: string,
) => {
    context.addTechnology({
        name,
        reason,
        weight: 95,
        strength: "STRONG",
        source: "CONFIGURATION",
        evidence,
        status: "CONFIRMED",
    });
};

export const detectMonorepoTechnology = (
    context: EvidenceContext,
): void => {
    const filePaths = context.filesChanged.map((path) =>
        path.replace(/\\/g, "/").toLowerCase(),
    );

    const hasApps = filePaths.some((path) =>
        path.startsWith("apps/"),
    );

    const hasPackages = filePaths.some((path) =>
        path.startsWith("packages/"),
    );

    const hasLibs = filePaths.some((path) =>
        path.startsWith("libs/"),
    );

    const hasWorkspaceStructure =
        hasApps &&
        (hasPackages || hasLibs);

    if (!hasWorkspaceStructure) {
        return;
    }

    addConfirmedTechnology(
        context,
        "Monorepo",
        "Detected workspace repository structure.",
        "apps/ + packages/",
    );

    if (
        Array.from(
            context.configurationFiles,
        ).some((path) =>
            path
                .toLowerCase()
                .endsWith("turbo.json"),
        )
    ) {
        addConfirmedTechnology(
            context,
            "Turborepo",
            "Detected turbo.json in a workspace repository.",
            "turbo.json",
        );
    }

    if (
        Array.from(
            context.configurationFiles,
        ).some((path) =>
            path
                .toLowerCase()
                .endsWith("nx.json"),
        )
    ) {
        addConfirmedTechnology(
            context,
            "Nx Workspace",
            "Detected nx.json in a workspace repository.",
            "nx.json",
        );
    }

    if (
        context.dependencies.has(
            "pnpm",
        ) ||
        context.dependencies.has(
            "@pnpm/workspace",
        )
    ) {
        addConfirmedTechnology(
            context,
            "pnpm Workspace",
            "Detected pnpm workspace dependencies.",
            "package.json",
        );
    }
};