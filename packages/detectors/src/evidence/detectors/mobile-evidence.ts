import { EvidenceContext } from "../evidence-types";
import {
  fileEqualsAny,
  fileEndsWithAny,
  fileMatchesAny,
  includesAny,
} from "../evidence-utils";

export const detectMobileEvidence = (context: EvidenceContext) => {
  const { combinedText, filesChanged, addEvidence } = context;

  const hasReactNativeDependency = includesAny(combinedText, [
    "react-native",
    "expo",
    "expo-router",
  ]);

  const hasReactNativeConfig = fileMatchesAny(filesChanged, [
    "react-native.config",
    "metro.config",
    "app.json",
    "app.config",
    "eas.json",
  ]);

  const hasNativeFolders = fileMatchesAny(filesChanged, ["android/", "ios/"]);

  const hasFlutterStructure =
    fileEqualsAny(filesChanged, ["pubspec.yaml"]) ||
    fileEndsWithAny(filesChanged, [".dart"]);

  const hasStrongMobileSignal =
    hasFlutterStructure ||
    (hasReactNativeDependency && (hasReactNativeConfig || hasNativeFolders));

  if (!hasStrongMobileSignal) {
    return;
  }

  addEvidence(
    "MOBILE_APPLICATION",
    hasFlutterStructure
      ? "Detected Flutter/Dart mobile application structure"
      : "Detected strong React Native or Expo mobile application structure",
    70,
    "FILE_STRUCTURE",
    "STRONG"
  );
};