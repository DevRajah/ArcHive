import type {
  EvidenceContext,
} from "../evidence-types";

const REACT_NATIVE_PACKAGES = [
  "react-native",
  "expo",
  "expo-router",
  "@react-navigation/native",
  "@react-navigation/stack",
  "@react-navigation/bottom-tabs",
];

const FLUTTER_PACKAGES = [
  "flutter",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalizedPath =
      file
        .replace(/\\/g, "/")
        .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects genuine mobile applications built with React Native, Expo,
 * Flutter, or native Android/iOS project structures.
 *
 * Future me:
 * A React dependency, app.json, or one mobile-related filename is not enough.
 * Mobile classification requires a mobile runtime together with platform
 * structure, configuration, navigation, screens, or native application code.
 */
export const detectMobileEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    configurationFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasReactNativeDependency =
    hasAnySetValue(
      dependencies,
      REACT_NATIVE_PACKAGES,
    );

  const hasReactNativeImport =
    hasAnySetValue(
      imports,
      REACT_NATIVE_PACKAGES,
    );

  const hasFlutterDependency =
    hasAnySetValue(
      dependencies,
      FLUTTER_PACKAGES,
    );

  const hasReactNativeConfiguration =
    Array.from(
      configurationFiles,
    ).some((file) =>
      /react-native\.config|metro\.config|app\.config|eas\.json/i.test(
        file,
      ),
    ) ||
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)react-native\.config\.[jt]s$/,
        /(^|\/)metro\.config\.[jt]s$/,
        /(^|\/)eas\.json$/,
        /(^|\/)app\.config\.[jt]s$/,
      ],
    );

  const hasNativeProjectStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)android\/app\//,
        /(^|\/)android\/build\.gradle$/,
        /(^|\/)android\/settings\.gradle$/,
        /(^|\/)ios\/.*\.xcodeproj\//,
        /(^|\/)ios\/.*\.xcworkspace\//,
        /(^|\/)ios\/podfile$/,
      ],
    );

  const hasMobileUiStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)screens?\//,
        /(^|\/)navigation\//,
        /(^|\/)navigators?\//,
        /(^|\/)mobile\//,
        /(^|\/)tabs?\//,
        /(^|\/)app\/\(tabs\)\//,
        /(^|\/)app\/.*\.(tsx|jsx)$/,
      ],
    );

  const hasFlutterStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)pubspec\.yaml$/,
        /(^|\/)lib\/main\.dart$/,
        /(^|\/)lib\/.*\.dart$/,
        /(^|\/)android\/app\/src\/main/,
        /(^|\/)ios\/runner\//,
      ],
    );

  const hasNativeSourceFiles =
    filesChanged.some((file) =>
      /\.(swift|m|mm|kt|java|dart)$/i.test(
        file,
      ),
    );

  const hasMobileSourceUsage =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "navigationcontainer",
        "createnativestacknavigator",
        "createbottomtabnavigator",
        "safeareaview",
        "react-native",
        "expo-router",
        "statelesswidget",
        "statefulwidget",
        "materialapp",
        "widget build(",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongMobilePurpose =
    [
      "mobile application",
      "react native application",
      "expo mobile application",
      "flutter application",
      "ios and android application",
      "cross-platform mobile app",
      "native mobile application",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasReactNativeDependency &&
    hasReactNativeImport
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected React Native or Expo dependencies used directly in source code",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasReactNativeImport
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected direct React Native or Expo imports",
      35,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasReactNativeDependency
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected React Native or Expo dependencies",
      25,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasReactNativeConfiguration &&
    (
      hasNativeProjectStructure ||
      hasMobileUiStructure
    )
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected React Native or Expo configuration with mobile application structure",
      40,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    hasFlutterStructure &&
    (
      hasNativeSourceFiles ||
      hasMobileSourceUsage ||
      hasFlutterDependency
    )
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected Flutter project structure and Dart mobile implementation",
      50,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasMobileSourceUsage &&
    (
      hasReactNativeImport ||
      hasFlutterStructure ||
      hasNativeProjectStructure
    )
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Detected implemented mobile navigation, screens, widgets, or native UI code",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongMobilePurpose &&
    (
      hasReactNativeConfiguration ||
      hasFlutterStructure ||
      hasNativeProjectStructure
    )
  ) {
    addEvidence(
      "MOBILE_APPLICATION",
      "Repository purpose explicitly describes a native or cross-platform mobile application",
      25,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};