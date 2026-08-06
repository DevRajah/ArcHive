import type {
  EvidenceContext,
} from "../evidence-types";

const HEALTHCARE_PACKAGES = [
  "fhir",
  "fhir-kit-client",
  "@medplum/core",
  "@medplum/fhirtypes",
  "hl7",
  "hl7-standard",
  "dicom-parser",
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
 * Detects healthcare, clinical, hospital, EHR, and patient-management
 * platforms from connected healthcare-domain workflows.
 *
 * Future me:
 * Generic words such as patient, health, doctor, diagnosis, medical, or
 * clinic must not independently classify a repository as healthcare.
 */
export const detectHealthcareEvidence = (
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

  const hasHealthcareDependency =
    hasAnySetValue(
      dependencies,
      HEALTHCARE_PACKAGES,
    );

  const hasHealthcareImport =
    hasAnySetValue(
      imports,
      HEALTHCARE_PACKAGES,
    );

  const hasPatientStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)patients?\//,
        /(^|\/)medical-records?\//,
        /(^|\/)health-records?\//,
        /(^|\/)clinical-records?\//,
        /\.patient\.(ts|js|py)$/,
        /\.medical-record\.(ts|js|py)$/,
      ],
    );

  const hasClinicalStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)diagnoses?\//,
        /(^|\/)conditions?\//,
        /(^|\/)observations?\//,
        /(^|\/)procedures?\//,
        /(^|\/)encounters?\//,
        /(^|\/)clinical-notes?\//,
        /\.diagnosis\.(ts|js|py)$/,
        /\.observation\.(ts|js|py)$/,
      ],
    );

  const hasAppointmentStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)appointments?\//,
        /(^|\/)schedules?\//,
        /(^|\/)consultations?\//,
        /(^|\/)admissions?\//,
        /\.appointment\.(ts|js|py)$/,
        /\.consultation\.(ts|js|py)$/,
      ],
    );

  const hasMedicationStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)medications?\//,
        /(^|\/)prescriptions?\//,
        /(^|\/)pharmacy\//,
        /(^|\/)medication-orders?\//,
        /\.prescription\.(ts|js|py)$/,
        /\.medication\.(ts|js|py)$/,
      ],
    );

  const hasHealthcareInteroperability =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)fhir\//,
        /(^|\/)hl7\//,
        /(^|\/)dicom\//,
        /fhir[-_.]?client/,
        /hl7[-_.]?message/,
      ],
    );

  const healthcareCapabilityCount = [
    hasPatientStructure,
    hasClinicalStructure,
    hasAppointmentStructure,
    hasMedicationStructure,
    hasHealthcareInteroperability,
  ].filter(Boolean).length;

  const hasHealthcareCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "patient record",
        "medical record",
        "clinical observation",
        "diagnosis code",
        "prescription",
        "medication order",
        "appointment status",
        "healthcare provider",
        "clinical encounter",
        "fhir resource",
        "hospital admission",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongHealthcarePurpose =
    [
      "healthcare platform",
      "hospital management system",
      "electronic health record",
      "electronic medical record",
      "ehr platform",
      "emr platform",
      "clinical information system",
      "patient management platform",
      "medical records platform",
      "health information system",
      "telemedicine platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasHealthcareDependency &&
    hasHealthcareImport
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Detected healthcare interoperability dependency used directly in source code",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasHealthcareImport
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Detected direct healthcare, FHIR, HL7, or DICOM imports",
      25,
      "IMPORT",
      "STRONG",
    );
  }

  if (
    healthcareCapabilityCount >= 3
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Detected connected patient, clinical, appointment, medication, or interoperability workflows",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasPatientStructure &&
    (
      hasClinicalStructure ||
      hasAppointmentStructure ||
      hasMedicationStructure
    )
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Detected patient-management structure with clinical or care-delivery workflows",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasHealthcareCode &&
    healthcareCapabilityCount >= 2
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Detected implemented healthcare records, diagnoses, medications, appointments, or clinical workflows",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongHealthcarePurpose &&
    (
      healthcareCapabilityCount >= 2 ||
      hasHealthcareCode ||
      hasHealthcareImport
    )
  ) {
    addEvidence(
      "HEALTHCARE_PLATFORM",
      "Repository purpose explicitly describes a healthcare, hospital, clinical, or patient-management product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};