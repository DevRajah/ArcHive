import fs from "node:fs";

import type {
    EvidenceContext,
} from "../evidence-types";

const SOURCE_PATTERN =
    /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const IMPORT_PATTERN =
    /from\s+["']([^"']+)["']/g;

export function collectImportEvidence(
    context: EvidenceContext,
): void {

    for (
        const file of context.importFiles
    ) {

        if (
            !SOURCE_PATTERN.test(
                file,
            )
        ) {
            continue;
        }

        try {

            const source =
                fs.readFileSync(
                    file,
                    "utf8",
                );

            const matches =
                source.matchAll(
                    IMPORT_PATTERN,
                );

            for (
                const match of matches
            ) {

                context.imports.add(

                    match[1]
                        .toLowerCase(),

                );

            }

        } catch {

            /**
             * Ignore unreadable files.
             */

        }

    }

}