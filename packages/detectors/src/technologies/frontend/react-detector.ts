import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectReactTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "react",
            "useeffect",
            "usestate",
            "jsx"
        ])
    ) {

        context.addTechnology(
            "React",
            "Detected React frontend framework.",
            20,
            "STRONG"
        );

    }

};