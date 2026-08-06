import type {
    EvidenceContext,
} from "../evidence-types";

const CONFIGURATION_FILE_PATTERNS = [
    /^tsconfig.*\.json$/i,
    /^next\.config\.(js|mjs|cjs|ts)$/i,
    /^vite\.config\.(js|mjs|cjs|ts)$/i,
    /^webpack\.config\.(js|mjs|cjs|ts)$/i,
    /^rollup\.config\.(js|mjs|cjs|ts)$/i,
    /^eslint\.config\.(js|mjs|cjs|ts)$/i,
    /^\.eslintrc(\.(js|json|yaml|yml))?$/i,
    /^prettier\.config\.(js|cjs|mjs|ts)$/i,
    /^\.prettierrc(\.json)?$/i,
    /^turbo\.json$/i,
    /^nx\.json$/i,
    /^nest-cli\.json$/i,
    /^docker-compose(\.[\w-]+)?\.ya?ml$/i,
    /^docker-compose\.override\.ya?ml$/i,
    /^render\.ya?ml$/i,
    /^railway\.json$/i,
    /^vercel\.json$/i,
    /^wrangler\.toml$/i,
    /^fly\.toml$/i,
    /^cloudbuild\.ya?ml$/i,
];

const normalizePath = (
    filePath: string,
) =>
    filePath
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        ?.toLowerCase() ?? "";

export const collectConfigurationEvidence = (
    context: EvidenceContext,
): void => {
    for (const file of context.repositoryFiles) {
        const fileName =
            normalizePath(file.path);

        const matches =
            CONFIGURATION_FILE_PATTERNS.some(
                (pattern) =>
                    pattern.test(fileName),
            );

        if (!matches) {
            continue;
        }

        context.configurationFiles.add(
            file.path,
        );

        context.configurationContents.set(
            file.path,
            file.content,
        );
    }
};