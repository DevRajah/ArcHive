import type {
  TechnologyDetector,
} from "../types";

import {
  evaluateArchitecture,
  findSignal,
} from "./architecture-score";

import {
  registerArchitecture,
} from "./register-architecture";

export const detectDddTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture([
        findSignal(
          context,
          "Domain layer",
          "domain-layer",
          20,
          [
            /\/domain\//,
          ],
        ),

        findSignal(
          context,
          "Aggregate roots",
          "aggregates",
          20,
          [
            /\/aggregates?\//,
            /aggregate[-_.]?root/,
            /\.aggregate\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Domain entities",
          "entities",
          15,
          [
            /\/entities\//,
            /\.entity\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Value objects",
          "value-objects",
          20,
          [
            /\/value[-_.]?objects?\//,
            /\.value-object\.[jt]s$/,
            /value[-_.]?object/,
          ],
        ),

        findSignal(
          context,
          "Domain services",
          "domain-services",
          15,
          [
            /\/domain\/services?\//,
            /domain[-_.]?service/,
          ],
        ),

        findSignal(
          context,
          "Domain repositories",
          "repositories",
          15,
          [
            /\/domain\/repositories?\//,
            /repository[-_.]?interface/,
            /\.repository\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Bounded contexts",
          "bounded-contexts",
          20,
          [
            /bounded[-_.]?context/,
            /\/contexts?\//,
          ],
        ),
      ]);

    registerArchitecture(
      context,
      "Domain-Driven Design",
      result,
    );
  };