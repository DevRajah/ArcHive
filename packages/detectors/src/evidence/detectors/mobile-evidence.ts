import { EvidenceContext } from "../evidence-types";
import { fileEqualsAny, fileEndsWithAny, fileMatchesAny, includesAny } from "../evidence-utils";

export const detectMobileEvidence = (context: EvidenceContext) => {
  const { combinedText, filesChanged, addEvidence } = context;

  const hasFlutterStructure =
    fileEqualsAny(filesChanged, ["pubspec.yaml"]) ||
    fileEndsWithAny(filesChanged, [".dart"]) ||
    fileMatchesAny(filesChanged, ["android/", "ios/"]) ||
    includesAny(combinedText, ["flutter sdk"]);

  if (hasFlutterStructure) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected Flutter/Dart or native mobile project structure",
      60,
      "FILE_STRUCTURE",
      "STRONG"
    );
  }

  const hasReactNativeStructure =
    fileMatchesAny(filesChanged, [
      "react-native.config",
      "metro.config",
      "android/",
      "ios/",
    ]) || includesAny(combinedText, ["react-native", "expo"]);

  if (hasReactNativeStructure) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected React Native or Expo mobile project structure",
      60,
      "FILE_STRUCTURE",
      "STRONG"
    );
  }
};