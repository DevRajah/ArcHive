import type {
  EvidenceContext,
} from "../evidence-types";

const SECURITY_PACKAGES = [
  "@snyk/protect",
  "snyk",
  "semgrep",
  "node-nmap",
  "clamav.js",
  "yara",
  "suricata",
  "owasp-password-strength-test",
  "@zaproxy/api",
  "fraud-detection",
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
 * Detects security products such as threat detection, fraud monitoring,
 * vulnerability scanning, policy enforcement, malware analysis, or SOC tools.
 *
 * Future me:
 * Authentication, JWT, RBAC, encryption, OWASP checks, permissions, or rate
 * limiting are normal application-security controls. They do not make an
 * ordinary application a SECURITY_PLATFORM.
 */
export const detectSecurityEvidence = (
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

  const hasSecurityToolDependency =
    hasAnySetValue(
      dependencies,
      SECURITY_PACKAGES,
    );

  const hasSecurityToolImport =
    hasAnySetValue(
      imports,
      SECURITY_PACKAGES,
    );

  const hasThreatDetectionStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)threats?\//,
        /(^|\/)threat-detection\//,
        /(^|\/)intrusion-detection\//,
        /(^|\/)anomaly-detection\//,
        /(^|\/)fraud-detection\//,
        /(^|\/)security-events?\//,
        /\.threat\.(ts|js|py)$/,
        /\.fraud\.(ts|js|py)$/,
        /\.anomaly\.(ts|js|py)$/,
      ],
    );

  const hasVulnerabilityStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)vulnerabilities?\//,
        /(^|\/)scanners?\//,
        /(^|\/)security-scanning\//,
        /(^|\/)dependency-scanning\//,
        /(^|\/)malware\//,
        /(^|\/)security-audits?\//,
        /\.scanner\.(ts|js|py)$/,
        /\.vulnerability\.(ts|js|py)$/,
      ],
    );

  const hasSecurityPolicyStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)policies?\//,
        /(^|\/)access-policies?\//,
        /(^|\/)risk-scoring\//,
        /(^|\/)zero-trust\//,
        /(^|\/)security-rules?\//,
        /\.policy\.(ts|js|py)$/,
        /\.risk-score\.(ts|js|py)$/,
      ],
    );

  const hasIncidentStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)incidents?\//,
        /(^|\/)alerts?\//,
        /(^|\/)security-alerts?\//,
        /(^|\/)investigations?\//,
        /(^|\/)forensics?\//,
        /(^|\/)case-management\//,
      ],
    );

  const securityCapabilityCount = [
    hasThreatDetectionStructure,
    hasVulnerabilityStructure,
    hasSecurityPolicyStructure,
    hasIncidentStructure,
  ].filter(Boolean).length;

  const hasSecurityAnalysisCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "threat score",
        "fraud score",
        "risk score",
        "anomaly score",
        "security event",
        "intrusion detection",
        "vulnerability finding",
        "malware signature",
        "security incident",
        "rule severity",
        "threat indicator",
        "security alert",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongSecurityPurpose =
    [
      "security platform",
      "threat detection platform",
      "fraud detection platform",
      "vulnerability scanning platform",
      "security monitoring platform",
      "intrusion detection system",
      "security analytics platform",
      "cybersecurity platform",
      "malware analysis platform",
      "security operations platform",
      "risk intelligence platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasSecurityToolDependency &&
    hasSecurityToolImport
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected security-analysis dependency used directly in source code",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasSecurityToolImport
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected direct vulnerability, threat, or security-analysis imports",
      20,
      "IMPORT",
      "STRONG",
    );
  }

  if (
    securityCapabilityCount >= 3
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected multiple connected threat, vulnerability, policy, risk, or incident-management capabilities",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasThreatDetectionStructure &&
    (
      hasIncidentStructure ||
      hasSecurityPolicyStructure
    )
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected threat or fraud detection with incident or policy workflows",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasSecurityAnalysisCode &&
    securityCapabilityCount >= 2
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected implemented threat, fraud, anomaly, vulnerability, risk, or incident analysis",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongSecurityPurpose &&
    (
      securityCapabilityCount >= 2 ||
      hasSecurityAnalysisCode
    )
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Repository purpose explicitly describes a cybersecurity, fraud, threat, vulnerability, or security-operations product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};