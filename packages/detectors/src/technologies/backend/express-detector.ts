import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectExpressTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "express",
            "express()",
            "express router",
            "express.json"
        ])
    ) {

        context.addTechnology(
            "Express",
            "Detected Express.js web framework.",
            20,
            "STRONG"
        );

    }

};