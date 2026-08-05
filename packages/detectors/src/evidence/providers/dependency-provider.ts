import fs from "node:fs";

import path from "node:path";

import type {
    EvidenceContext,
} from "../evidence-types";

/**
 * Extracts dependency names from package.json.
 *
 * This provider intentionally ignores version numbers.
 */
export function collectDependencyEvidence(
    context: EvidenceContext,
): void {

    for (
        const file of context.dependencyFiles
    ) {

        const name =
            path.basename(file)
                .toLowerCase();

        if (
            name !==
            "package.json"
        ) {
            continue;
        }

        try {

            const content =
                fs.readFileSync(
                    file,
                    "utf8",
                );

            const manifest =
                JSON.parse(content);

            const sections = [

                manifest.dependencies,

                manifest.devDependencies,

                manifest.peerDependencies,

                manifest.optionalDependencies,

            ];

            for (
                const section of sections
            ) {

                if (
                    !section
                ) {
                    continue;
                }

                for (
                    const dependency of
                    Object.keys(section)
                ) {

                    context.dependencies.add(

                        dependency.toLowerCase(),

                    );

                }

            }

        } catch {

            /**
             * Invalid JSON should never crash the detector.
             */

        }

    }

}