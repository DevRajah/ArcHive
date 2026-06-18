import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectMicroservicesTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "microservice",
      "microservices",
      "service discovery",
      "api gateway",
      "distributed services",
      "service registry",
    ])
  ) {
    context.addTechnology(
      "Microservices",
      "Detected microservices or distributed service architecture.",
      30,
      "STRONG"
    );
  }
};