import type {
  EvidenceContext,
} from "../evidence-types";

const DATA_ENGINEERING_PACKAGES = [
  "apache-airflow",
  "airflow",
  "dbt-core",
  "@dbt-labs/dbt",
  "pyspark",
  "apache-spark",
  "kafkajs",
  "node-rdkafka",
  "snowflake-sdk",
  "@google-cloud/bigquery",
  "duckdb",
  "dlt",
  "prefect",
  "dagster",
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
    const normalized =
      file.replace(/\\/g, "/").toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalized),
    );
  });
};

export const detectDataEngineeringEvidence = (
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

  const hasFrameworkDependency =
    hasAnySetValue(
      dependencies,
      DATA_ENGINEERING_PACKAGES,
    );

  const hasFrameworkImport =
    hasAnySetValue(
      imports,
      DATA_ENGINEERING_PACKAGES,
    );

  const hasPipelineStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)dags?\//,
        /(^|\/)etl\//,
        /(^|\/)elt\//,
        /(^|\/)pipelines?\//,
        /(^|\/)transformations?\//,
        /(^|\/)warehouse\//,
        /(^|\/)data-lake\//,
        /(^|\/)dbt_project\.yml$/,
        /(^|\/)models\/.*\.sql$/,
        /\.dag\.(py|ts|js)$/,
        /\.etl\.(py|ts|js)$/,
      ],
    );

  const hasTransformationCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      return (
        content.includes(
          "extract("
        ) &&
        content.includes(
          "transform("
        ) &&
        content.includes(
          "load("
        )
      ) ||
        content.includes(
          "spark.read"
        ) ||
        content.includes(
          "spark.write"
        ) ||
        content.includes(
          "dbt run"
        ) ||
        content.includes(
          "bigquery"
        ) ||
        content.includes(
          "snowflake"
        );
    });

  const hasStrongPurposeLanguage =
    [
      "data warehouse",
      "data lake",
      "etl pipeline",
      "elt pipeline",
      "batch processing",
      "stream processing",
      "analytics engineering",
      "data transformation",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasFrameworkDependency &&
    hasFrameworkImport
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected data-engineering framework dependency used directly in source code",
      45,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkImport
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected direct data-engineering framework imports",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkDependency
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected data-engineering framework dependencies",
      30,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasPipelineStructure ||
    hasTransformationCode
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected ETL, ELT, warehouse, transformation, or orchestration implementation",
      30,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPurposeLanguage &&
    (
      hasFrameworkDependency ||
      hasFrameworkImport ||
      hasPipelineStructure
    )
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Repository purpose explicitly describes data pipelines, warehousing, or analytics engineering",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};