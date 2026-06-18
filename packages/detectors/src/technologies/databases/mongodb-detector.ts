import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectMongoDbTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "mongodb",
      "mongoose",
      "mongo_uri",
      "mongodb_uri",
    ])
  ) {
    context.addTechnology(
      "MongoDB",
      "Detected MongoDB or Mongoose persistence usage.",
      20,
      "STRONG"
    );
  }
};