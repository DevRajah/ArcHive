import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectDockerTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "dockerfile",
            "docker-compose",
            "docker compose",
            "docker build",
            "docker run",
            "FROM node"
        ])
    ) {
        context.addTechnology(
            "Docker",
            "Detected Docker containerization.",
            25,
            "STRONG"
        );
    }

};