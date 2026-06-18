import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectNextTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "next.config",
            "nextjs",
            "next/navigation",
            "app/"
        ])
    ) {

        context.addTechnology(
            "Next.js",
            "Detected Next.js application architecture.",
            20,
            "STRONG"
        );

    }

};