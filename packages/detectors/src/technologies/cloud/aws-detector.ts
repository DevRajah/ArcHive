import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectAwsTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "aws",
            "s3",
            "lambda",
            "cloudformation",
            "dynamodb",
            "iam"
        ])
    ) {

        context.addTechnology(
            "AWS",
            "Detected Amazon Web Services cloud infrastructure.",
            25,
            "STRONG"
        );

    }

};