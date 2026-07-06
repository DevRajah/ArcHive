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

# 6. Evidence Weighting

Collecting engineering evidence is only the first step in repository classification.

The more difficult challenge is determining **how much influence each piece of evidence should have** on the final classification.

Not every engineering observation contributes equally.

For example, detecting:

```text
TypeScript
```

provides relatively little information about repository purpose because TypeScript is used across countless engineering domains.

Conversely, detecting:

```text
Repository Intelligence

Technology Fingerprint

Repository Health

Engineering Assessment
```

strongly suggests that a repository belongs to the Engineering Intelligence domain.

ArcHive therefore applies a weighted evidence model rather than treating every engineering signal equally.

This significantly improves classification accuracy while reducing false positives.

---

# 6.1 Why Evidence Weighting Exists

Imagine a repository containing:

```text
TypeScript

React

Next.js
```

Without evidence weighting, these technologies might dominate repository classification.

However, the same repository may also contain:

```text
Repository Intelligence

Architecture Radar

Engineering Quality

Repository DNA
```

Clearly, the second group of engineering signals provides much stronger evidence regarding repository purpose.

Evidence weighting ensures that highly specific engineering terminology contributes more heavily than generic implementation technologies.

---

# 6.2 Engineering Evidence Categories

ArcHive groups evidence into several categories.

Each category contributes differently to repository classification.

Current categories include:

| Category | Description |
|----------|-------------|
| Repository Metadata | Repository names, descriptions and metadata |
| File Structure | Repository organisation and directory layout |
| Dependency | Frameworks, libraries and packages |
| Code Pattern | Implementation patterns detected from engineering artefacts |
| Domain Language | Engineering terminology specific to a repository domain |
| Architecture Pattern | Architectural concepts identified throughout the repository |

Grouping evidence simplifies future detector development while improving explainability.

---

# 6.3 Strong vs Weak Evidence

ArcHive distinguishes between weak engineering evidence and strong engineering evidence.

Weak evidence is common across many engineering projects.

Examples include:

```text
Node.js

TypeScript

Express

React

Docker
```

Although these technologies describe implementation, they provide little information regarding repository purpose.

Strong engineering evidence is considerably more specialised.

Examples include:

```text
Repository Intelligence

Repository Fingerprint

Architecture Drift

Repository Health

Engineering Quality
```

Likewise:

```text
Payment Reconciliation

Ledger

Double Entry

Financial Audit
```

strongly indicate financial infrastructure.

The classification engine therefore assigns greater influence to specialised engineering terminology than to generic implementation technologies.

---

# 6.4 Engineering Signal Aggregation

Individual engineering observations rarely determine repository identity independently.

Instead, ArcHive aggregates evidence collected throughout the repository.

Conceptually:

```text
Repository Description

+

Commit Messages

+

Architecture Changes

+

Detected Technologies

+

Engineering Signals

+

Repository Metadata
```

↓

```text
Engineering Evidence Graph
```

↓

```text
Repository Classification
```

This aggregation process enables multiple weak engineering observations to collectively support stronger engineering conclusions.

---

# 6.5 Evidence Confidence

Every evidence item contributes both:

- engineering meaning
- engineering confidence

For example:

```text
BullMQ
```

may support:

```text
Queue Infrastructure
```

Meanwhile:

```text
Redis

Worker Processing

Job Scheduling
```

collectively strengthen that same engineering conclusion.

Confidence therefore increases as independent engineering observations begin supporting one another.

This collaborative approach produces considerably more reliable repository classifications.

---

# 6.6 Detector Collaboration

Evidence weighting also allows multiple detectors to cooperate.

Consider the following engineering observations.

Engineering Intelligence Detector

```text
Repository Intelligence

Repository Health

Architecture Intelligence
```

Technology Detector

```text
Fastify

BullMQ

Redis
```

Architecture Detector

```text
Engineering Intelligence

Backend Systems

Queue Infrastructure
```

Rather than competing with one another, these detectors contribute complementary evidence that collectively supports a stronger engineering classification.

---

# 6.7 Preventing Generic Technologies from Dominating

One of the primary objectives of evidence weighting is preventing generic technologies from overwhelming repository purpose.

Without weighting, repositories could easily become classified as:

```text
JavaScript Project
```

or

```text
Node.js Application
```

despite implementing highly specialised engineering systems.

ArcHive intentionally prioritises:

```text
Repository Purpose
```

over

```text
Implementation Technologies
```

This design decision produces significantly more meaningful repository identities.

---

# 6.8 Explainable Evidence

Every weighted engineering observation remains visible throughout the intelligence pipeline.

For example:

```text
Detected repository intelligence concepts.

Detected engineering analysis terminology.

Detected queue infrastructure.

Detected financial reconciliation workflows.
```

These observations become reasoning signals presented within the Repository Intelligence report.

Developers can therefore understand exactly which engineering evidence influenced repository classification.

---

# 6.9 Evidence Weighting Summary

Evidence weighting is one of the most important components of ArcHive's Repository Classification Engine.

Rather than treating every engineering observation equally, the platform evaluates:

- evidence strength
- evidence diversity
- detector agreement
- engineering specificity
- engineering context

This weighted approach enables ArcHive to classify repositories according to engineering intent rather than implementation coincidence.

