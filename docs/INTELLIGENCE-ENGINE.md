# ArcHive Intelligence Engine

## 1. Introduction

Modern software repositories contain far more information than source code alone. Every commit, dependency, architectural decision and engineering pattern tells a story about how a system is designed, how it evolves and how it should be maintained. Traditional repository hosting platforms expose much of this information, but they rarely transform it into meaningful engineering insight.

ArcHive was created to bridge this gap.

Rather than acting as another repository browser or project management dashboard, ArcHive is designed as an **Engineering Intelligence Platform**. Its primary objective is to analyse software repositories, identify engineering characteristics and produce structured intelligence that helps developers, engineering teams and technical leaders better understand software systems.

The platform treats a repository as an engineering system rather than simply a collection of files. Instead of only identifying technologies such as React, Node.js or PostgreSQL, ArcHive attempts to answer higher-level engineering questions:

- What type of software system is this?
- What architectural patterns dominate the repository?
- What engineering capabilities are present?
- How mature is the project?
- What technical risks exist?
- Where should engineering effort be invested next?
- How does this repository compare with others?

Answering these questions requires significantly more than simple keyword detection. ArcHive therefore applies a multi-stage intelligence pipeline where each stage contributes additional engineering knowledge before passing its output to the next stage.

The final result is a comprehensive engineering profile that combines repository identity, architecture, engineering quality, technical debt, repository health, benchmarking information and actionable recommendations into a single canonical intelligence model.

This document explains how that intelligence engine operates, why it was designed this way and how each component contributes to the overall understanding of a repository.

---

# 2. Why ArcHive Needed an Intelligence Engine

Most repository analysis tools focus on describing *what exists* inside a repository.

Typical outputs include:

- Programming languages
- Number of commits
- Number of contributors
- Framework detection
- Dependency lists
- Repository statistics

Although useful, these metrics provide only a partial understanding of a software system. Two repositories may both use TypeScript and PostgreSQL while solving completely different engineering problems.

For example:

```text
Repository A
Languages:
- TypeScript

Frameworks:
- Next.js
- Prisma

Purpose:
Engineering Intelligence Platform
```

```text
Repository B
Languages:
- TypeScript

Frameworks:
- Express
- Prisma

Purpose:
Financial Infrastructure
```

Despite sharing several technologies, these repositories represent entirely different engineering domains.

ArcHive therefore separates **implementation** from **purpose**.

Implementation answers questions such as:

- Which language is used?
- Which framework is used?
- Which database is used?

Purpose answers questions such as:

- What problem is this repository solving?
- What type of platform is this?
- Which engineering discipline does it belong to?

This distinction allows ArcHive to classify repositories using engineering intent rather than simply implementation technologies.

The Intelligence Engine was introduced to make these higher-level decisions consistently.

Instead of relying on isolated heuristics, the engine combines multiple evidence sources before producing engineering conclusions. This makes classifications more explainable, easier to extend and significantly more accurate than simple technology detection.

---

# 3. Engineering Philosophy

The ArcHive Intelligence Engine is guided by several core engineering principles that influence every stage of the analysis pipeline.

## 3.1 Purpose Over Implementation

A repository should primarily be identified by the engineering problem it solves rather than the technologies it happens to use.

For example:

```text
Engineering Intelligence Platform
```

provides more meaningful information than:

```text
TypeScript Project
```

Similarly:

```text
Financial Infrastructure
```

communicates considerably more engineering value than:

```text
Node.js Application
```

Purpose therefore always takes priority over implementation during repository classification.

---

## 3.2 Evidence-Based Decisions

Every engineering conclusion produced by ArcHive should be supported by observable evidence.

Evidence may originate from:

- Repository metadata
- Repository descriptions
- Engineering events
- Commit messages
- File structure
- Architecture history
- Detected technologies
- Domain-specific terminology

Rather than making assumptions from a single keyword, ArcHive accumulates multiple pieces of evidence before determining repository identity.

This produces classifications that are both more reliable and easier to explain.

---

## 3.3 Explainable Intelligence

ArcHive does not simply classify repositories.

It also explains **why** a repository received a particular classification.

Each repository includes reasoning signals and engineering evidence that describe the factors contributing to the final intelligence report.

This transparency allows developers to understand, validate and improve repository classifications over time.

---

## 3.4 Modular Intelligence

The Intelligence Engine is intentionally divided into independent components.

Examples include:

- Evidence Engine
- Technology Fingerprint
- Repository Identity
- Repository DNA
- Repository Persona
- Architecture Intelligence
- Repository Health
- Technical Debt
- Recommendation Engine
- Benchmarking Engine

Each component has a clearly defined responsibility and communicates with other components through structured data rather than tightly coupled logic.

This modular architecture makes the platform easier to maintain, extend and test.

---

## 3.5 Canonical Intelligence Model

Every engineering engine contributes to a single canonical repository intelligence model.

Rather than requiring frontend pages to perform their own calculations or combine multiple API responses, all intelligence is aggregated into a unified structure before being exposed through the API.

This approach provides several benefits:

- Consistent API responses.
- Reduced duplication of business logic.
- Easier frontend development.
- Improved maintainability.
- Simplified extension of future intelligence engines.

As ArcHive grows, new intelligence modules can contribute additional information without requiring major changes to existing consumers.

---

# 4. Intelligence Pipeline Overview

The Intelligence Engine operates as a staged processing pipeline.

Each stage enriches repository understanding before handing structured output to the next stage.

```text
Repository
        │
        ▼
Evidence Collection
        │
        ▼
Technology Fingerprint
        │
        ▼
Repository Identity
        │
        ▼
Repository DNA
        │
        ▼
Repository Persona
        │
        ▼
Architecture Intelligence
        │
        ▼
Engineering Assessment Engines
        │
        ▼
Recommendation Engine
        │
        ▼
Benchmarking Engine
        │
        ▼
Canonical Repository Intelligence
```

Unlike traditional rule-based systems, each stage operates independently while contributing to a progressively richer understanding of the repository.

For example, the Technology Fingerprint engine does not directly determine repository health. Instead, it provides technologies, architecture domains and engineering signals that are later consumed by Repository DNA, Architecture Intelligence and Engineering Assessment engines.

This layered design reduces coupling between components while ensuring that each intelligence engine focuses on a single responsibility.

The result is a scalable architecture where new detectors, engineering assessments and intelligence modules can be introduced with minimal impact on the rest of the system.

Subsequent sections of this document examine each stage of the pipeline in detail, beginning with the Evidence Engine that forms the foundation of ArcHive's engineering intelligence system.

# 5. Evidence Engine

The Evidence Engine is the foundation of the ArcHive Intelligence Engine. Every engineering conclusion produced by the platform begins with evidence collection.

Rather than attempting to classify a repository using a single technology or keyword, ArcHive first gathers evidence from multiple independent sources before making any engineering decisions.

This approach is inspired by how experienced software engineers review unfamiliar codebases. Instead of jumping to conclusions after opening a single file, engineers gradually build confidence by observing repository structure, dependencies, architecture, naming conventions and engineering patterns.

ArcHive follows the same philosophy.

The purpose of the Evidence Engine is therefore not to classify repositories directly. Instead, it transforms raw repository information into structured engineering evidence that can be consumed by later stages of the intelligence pipeline.

---

## 5.1 Responsibilities

The Evidence Engine is responsible for:

- collecting repository evidence
- categorising engineering signals
- assigning confidence weights
- removing duplicate evidence
- producing explainable engineering observations
- providing a structured input for downstream intelligence engines

Every later intelligence engine depends on the quality of the evidence generated at this stage.

---

## 5.2 Evidence Sources

ArcHive collects engineering evidence from multiple repository artefacts.

Current evidence sources include:

### Repository Metadata

Basic repository information often contains valuable engineering context.

Examples include:

- repository name
- repository description
- programming language
- topics
- repository owner

For example:

```text
ledgerflow
payment
reconciliation
audit
```

strongly suggests financial infrastructure.

Likewise:

```text
repository intelligence
architecture
engineering
analysis
```

suggests an engineering intelligence platform.

---

### Repository History

Historical architecture changes provide insight into how a repository evolves over time.

Examples include:

- architecture updates
- technology additions
- infrastructure migrations
- engineering milestones

Unlike static analysis, historical evidence helps ArcHive understand engineering direction rather than simply current implementation.

---

### Engineering Events

GitHub events provide additional behavioural signals.

Examples include:

- repository imports
- webhook events
- engineering timeline updates
- processing events

These events enrich repository understanding and contribute to later engineering assessments.

---

### Technology Detection

Detected technologies become another evidence source.

Examples include:

- React
- Next.js
- Fastify
- BullMQ
- Redis
- PostgreSQL
- Docker
- Prisma

Technologies themselves are not considered repository purpose.

Instead, they provide supporting engineering evidence.

---

### Domain Language

Domain terminology often provides stronger signals than implementation technologies.

Examples include:

```text
ledger
payment
invoice
transaction
```

Financial Infrastructure

```text
repository
architecture
engineering
fingerprint
intelligence
```

Engineering Intelligence Platform

```text
scaffold
generator
cli
template
module
```

Developer Tooling Platform

Domain language is therefore assigned a relatively high confidence because it often reflects the actual engineering problem being solved.

---

### Architecture Patterns

Repository architecture contributes another layer of evidence.

Examples include:

- Clean Architecture
- Layered Architecture
- Event-Driven Architecture
- Queue Processing
- Realtime Systems
- CQRS
- Repository Pattern

Architecture patterns are particularly valuable because they describe engineering design decisions rather than implementation syntax.

---

# 5.3 Evidence Categories

To improve explainability, ArcHive organises evidence into well-defined categories.

Current categories include:

| Category | Purpose |
|----------|---------|
| Repository Metadata | Repository identity and metadata |
| File Structure | Repository organisation |
| Dependency | External packages and frameworks |
| Code Pattern | Engineering implementation patterns |
| Domain Language | Business and engineering terminology |
| Architecture Pattern | Architectural characteristics |

Categorising evidence makes it easier to explain why a repository received a particular classification.

---

# 5.4 Evidence Weighting

Not all engineering evidence should influence classification equally.

For example, detecting:

```text
TypeScript
```

does not necessarily indicate what the repository actually does.

Conversely, detecting:

```text
repository intelligence
architecture fingerprint
repository health
```

strongly indicates an Engineering Intelligence Platform.

For this reason, ArcHive assigns different confidence weights to different evidence sources.

Typical weighting philosophy is:

| Evidence Type | Typical Influence |
|---------------|------------------|
| Repository Purpose Language | Very High |
| Architecture Patterns | High |
| Engineering Capabilities | High |
| Technology Stack | Medium |
| Dependencies | Medium |
| Repository Metadata | Medium |
| Generic Programming Languages | Low |

This weighting system prevents generic technologies from dominating repository classification.

---

# 5.5 Strong vs Weak Evidence

ArcHive distinguishes between weak engineering signals and strong engineering evidence.

Weak evidence may suggest several possible repository purposes.

For example:

```text
Node.js
TypeScript
Express
```

These technologies are extremely common and therefore provide relatively little information about repository purpose.

Strong evidence is significantly more specific.

Examples include:

```text
repository intelligence
technology fingerprint
architecture drift
repository maturity
engineering quality
```

These terms are rarely found outside engineering intelligence systems and therefore contribute much more heavily to classification confidence.

Similarly:

```text
ledger
double-entry
payment reconciliation
audit trail
```

strongly indicate financial infrastructure.

---

# 5.6 Evidence Aggregation

Individual evidence items are rarely sufficient to determine repository purpose.

Instead, ArcHive aggregates evidence across the repository before making engineering decisions.

For example:

```text
Repository Name
+
Repository Description
+
Architecture Changes
+
Detected Technologies
+
Engineering Signals
+
Domain Language
```

↓

```text
Repository Evidence Graph
```

↓

```text
Repository Identity
```

This aggregation process significantly improves classification accuracy while reducing false positives.

---

# 5.7 Explainable Engineering Evidence

One of the primary goals of the Evidence Engine is explainability.

Rather than returning opaque classifications, ArcHive records the evidence responsible for each engineering conclusion.

For example:

```text
Detected repository intelligence concepts and engineering analysis patterns.

Detected Clean Architecture layering.

Detected Server-Sent Events.

Detected BullMQ queue infrastructure.

Detected PostgreSQL persistence layer.
```

These observations become reasoning signals that are later displayed throughout the platform.

This enables developers to understand why ArcHive reached a particular conclusion instead of treating classifications as black-box predictions.

---

# 5.8 Output of the Evidence Engine

The Evidence Engine does not classify repositories directly.

Instead, it produces structured engineering evidence that becomes the input for the Technology Fingerprint engine.

Its outputs include:

- weighted evidence items
- detected technologies
- engineering observations
- reasoning signals
- evidence confidence
- engineering context

Subsequent intelligence engines build upon this structured evidence to progressively develop a richer understanding of the repository.

The next stage in the intelligence pipeline is the **Technology Fingerprint**, which converts accumulated evidence into structured engineering signals and repository characteristics.