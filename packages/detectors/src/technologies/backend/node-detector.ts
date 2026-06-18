import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectNodeTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "node",
            "nodejs",
            "node.js",
            "package.json"
        ])
    ) {

        context.addTechnology(
            "Node.js",
            "Detected Node.js runtime and package ecosystem.",
            20,
            "STRONG"
        );

    }

};