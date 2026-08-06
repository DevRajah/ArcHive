import type {
  EvidenceContext,
} from "../evidence-types";

const LEARNING_PACKAGES = [
  "moodle-client",
  "canvas-lms-api",
  "scorm-again",
  "scormcloud-api-wrapper",
  "@xapi/xapi",
  "tincanjs",
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
    const normalizedPath = file
      .replace(/\\/g, "/")
      .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects education and learning-management products.
 *
 * Future me:
 * Words such as student, lesson, course, quiz, learning, mentor, or grading
 * may appear in documentation, examples, training content, or unrelated
 * workflows. Education classification requires connected learning-domain
 * entities and implemented educational workflows.
 */
export const detectEducationEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasLearningDependency =
    hasAnySetValue(
      dependencies,
      LEARNING_PACKAGES,
    );

  const hasLearningImport =
    hasAnySetValue(
      imports,
      LEARNING_PACKAGES,
    );

  const hasCourseStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)courses?\//,
        /(^|\/)lessons?\//,
        /(^|\/)modules?\/.*course/,
        /(^|\/)curriculum\//,
        /(^|\/)learning-paths?\//,
        /\.course\.(ts|js|py)$/,
        /\.lesson\.(ts|js|py)$/,
      ],
    );

  const hasAssessmentStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)quizzes?\//,
        /(^|\/)exams?\//,
        /(^|\/)assessments?\//,
        /(^|\/)assignments?\//,
        /(^|\/)grading\//,
        /\.quiz\.(ts|js|py)$/,
        /\.assessment\.(ts|js|py)$/,
        /\.grade\.(ts|js|py)$/,
      ],
    );

  const hasLearnerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)students?\//,
        /(^|\/)learners?\//,
        /(^|\/)teachers?\//,
        /(^|\/)instructors?\//,
        /(^|\/)enrolments?\//,
        /(^|\/)enrollments?\//,
        /\.student\.(ts|js|py)$/,
        /\.enrolment\.(ts|js|py)$/,
        /\.enrollment\.(ts|js|py)$/,
      ],
    );

  const hasProgressStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)progress\//,
        /(^|\/)completions?\//,
        /(^|\/)certificates?\//,
        /(^|\/)learning-records?\//,
        /\.progress\.(ts|js|py)$/,
        /\.certificate\.(ts|js|py)$/,
      ],
    );

  const educationCapabilityCount = [
    hasCourseStructure,
    hasAssessmentStructure,
    hasLearnerStructure,
    hasProgressStructure,
  ].filter(Boolean).length;

  const hasEducationCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "course enrolment",
        "course enrollment",
        "lesson completion",
        "quiz attempt",
        "assessment score",
        "student progress",
        "learning outcome",
        "grading rubric",
        "course module",
        "certificate completion",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongEducationPurpose =
    [
      "learning management system",
      "education platform",
      "educational platform",
      "online learning platform",
      "course delivery platform",
      "student learning platform",
      "digital learning platform",
      "training management system",
      "assessment platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasLearningDependency &&
    hasLearningImport
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Detected learning-platform dependency used directly in source code",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasLearningImport
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Detected direct learning-management or educational standard imports",
      20,
      "IMPORT",
      "STRONG",
    );
  }

  if (
    educationCapabilityCount >= 3
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Detected connected course, learner, assessment, and progress-management capabilities",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasCourseStructure &&
    (
      hasAssessmentStructure ||
      hasLearnerStructure
    )
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Detected course delivery with learner or assessment workflows",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasEducationCode &&
    educationCapabilityCount >= 2
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Detected implemented enrolment, learning, assessment, grading, or progress workflows",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongEducationPurpose &&
    (
      educationCapabilityCount >= 2 ||
      hasEducationCode
    )
  ) {
    addEvidence(
      "EDUCATION_PLATFORM",
      "Repository purpose explicitly describes an education, training, or learning-management product",
      25,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};