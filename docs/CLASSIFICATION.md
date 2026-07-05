# ArcHive Repository Classification

# 1. Introduction

Repository classification is one of the fundamental capabilities provided by ArcHive.

Every engineering insight generated throughout the platform depends upon first understanding what a repository fundamentally represents.

Traditional repository hosting platforms expose valuable metadata such as programming languages, repository statistics and dependency information. Although useful, these observations describe implementation rather than engineering purpose.

For example, two repositories may both contain TypeScript, PostgreSQL, Redis and Docker while solving entirely different engineering problems.

One repository may represent a Financial Infrastructure platform.

Another may represent an Engineering Intelligence Platform.

A third may be a Developer Tooling Platform.

Implementation technologies alone are therefore insufficient for understanding software systems.

ArcHive addresses this limitation through a dedicated Repository Classification Engine.

Rather than simply detecting technologies, the classification process combines engineering evidence from multiple independent sources before determining repository identity.

The result is a classification system capable of distinguishing engineering purpose from implementation while providing explainable reasoning for every engineering conclusion.

This document describes the philosophy, architecture and algorithms that underpin ArcHive's repository classification process.

---

# 2. Why Repository Classification Matters

Repository classification provides the foundation upon which every other intelligence engine operates.

Without reliable classification, later stages such as Repository DNA, Architecture Intelligence and Engineering Assessment would be unable to produce meaningful engineering insight.

Consider the following repositories.

Repository A

```text
Technologies

Next.js
Fastify
Redis
PostgreSQL
```

Repository B

```text
Technologies

Next.js
Fastify
Redis
PostgreSQL
```

Despite sharing identical technologies, these repositories may solve entirely different engineering problems.

Repository A

```text
Engineering Intelligence Platform
```

Repository B

```text
Financial Infrastructure
```

Repository C

```text
Developer Tooling Platform
```

Technology alone therefore cannot determine repository purpose.

Classification provides the engineering context required for every subsequent intelligence engine.

Once repository identity has been established, later engines can produce architecture analysis, engineering quality assessments, technical debt reports and engineering recommendations with considerably greater accuracy.

---

# 3. Classification Philosophy

ArcHive follows several guiding principles when classifying repositories.

## 3.1 Engineering Purpose First

Repositories should primarily be classified according to the engineering problem they solve.

For example:

```text
Engineering Intelligence Platform
```

communicates significantly more engineering information than:

```text
TypeScript Project
```

Similarly,

```text
Developer Tooling Platform
```

is considerably more useful than:

```text
Node.js Repository
```

Engineering purpose therefore always receives higher priority than implementation details.

---

## 3.2 Evidence Before Decisions

No repository should be classified using a single keyword or technology.

Instead, ArcHive accumulates engineering evidence before selecting repository identity.

Evidence may originate from:

- repository metadata
- repository descriptions
- engineering terminology
- architecture changes
- detected technologies
- engineering capabilities
- reasoning signals

The final classification is therefore supported by multiple independent engineering observations.

---

## 3.3 Explainable Classification

Every repository classification should be explainable.

Rather than exposing only a final repository type, ArcHive records the engineering evidence responsible for each classification.

Examples include:

```text
Detected repository intelligence concepts.

Detected engineering analysis terminology.

Detected financial reconciliation workflows.

Detected queue processing infrastructure.
```

These reasoning signals allow developers to understand why classifications were produced.

---

## 3.4 Modular Classification

Repository classification is intentionally divided across independent detectors.

Each detector focuses on a single engineering domain.

Examples include:

- Engineering Intelligence
- Financial Infrastructure
- Developer Tooling
- Security
- Observability
- Healthcare
- Education
- Collaboration

Each detector contributes evidence independently before the Repository Classification Engine resolves the final repository identity.

This modular approach greatly improves maintainability while reducing coupling between engineering domains.

---

# 4. Purpose vs Implementation

One of the defining architectural decisions within ArcHive is the separation of repository purpose from repository implementation.

Purpose answers the question:

> **Why does this repository exist?**

Implementation answers:

> **How has this repository been built?**

For example:

Purpose

```text
Engineering Intelligence Platform
```

Implementation

```text
Frontend Application

JavaScript / TypeScript Project
```

Likewise,

Purpose

```text
Developer Tooling Platform
```

Implementation

```text
CLI Application

JavaScript / TypeScript Project
```

This separation prevents generic implementation technologies from dominating repository identity.

Instead, implementation classifications become supporting engineering context while repository purpose remains the primary identity presented throughout ArcHive.

---

# 5. Classification Lifecycle

Repository classification follows a staged engineering workflow.

```text
Repository

↓

Evidence Collection

↓

Evidence Detectors

↓

Evidence Aggregation

↓

Technology Fingerprint

↓

Repository Type Candidates

↓

Repository Ranking

↓

Conflict Resolution

↓

Confidence Scoring

↓

Primary Repository Type

↓

Canonical Repository Intelligence
```

Each stage contributes additional engineering understanding before the final repository identity is selected.

This layered approach significantly reduces false positives while producing classifications that more accurately represent engineering intent rather than implementation technologies.

The following sections describe each stage of the classification process in detail, beginning with evidence weighting and engineering signal aggregation.