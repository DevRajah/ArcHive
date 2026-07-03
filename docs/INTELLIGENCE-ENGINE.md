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


# 6. Technology Fingerprint

Following evidence collection, ArcHive enters the second major stage of the intelligence pipeline: **Technology Fingerprint**.

While the Evidence Engine is responsible for collecting engineering observations, the Technology Fingerprint engine is responsible for transforming those observations into structured engineering characteristics.

Rather than asking *"What files exist?"*, this stage asks:

- What engineering technologies are present?
- Which architecture domains are represented?
- Which capabilities can be inferred?
- Which repository types are supported by the available evidence?

Technology Fingerprint therefore acts as the bridge between raw engineering evidence and higher-level repository intelligence.

---

# 6.1 Why Technology Fingerprinting?

Most repository analysis tools simply list technologies.

For example:

```text
Node.js
TypeScript
Redis
PostgreSQL
React
```

Although useful, this information alone provides very little engineering context.

Two completely different repositories may both use the exact same technology stack while solving unrelated engineering problems.

For example:

```text
Repository A

React
Next.js
PostgreSQL
Redis
```

may represent an Engineering Intelligence Platform.

Meanwhile:

```text
Repository B

React
Next.js
PostgreSQL
Redis
```

may instead represent an E-Commerce Platform.

Technology alone therefore cannot determine repository purpose.

The goal of the Technology Fingerprint engine is not simply to detect technologies, but to understand how those technologies contribute to repository identity.

---

# 6.2 Engineering Signal Extraction

After evidence has been collected, the fingerprint engine begins extracting structured engineering signals.

Current signal categories include:

- Technologies
- Repository Types
- Architecture Domains
- Engineering Signals
- Reasoning Signals
- Capabilities

These signals are consumed by every later intelligence engine.

For example:

```text
BullMQ
Redis
Queue Processing
```

↓

```text
QUEUE_INFRASTRUCTURE
```

↓

```text
Background Processing Capability
```

↓

```text
Repository DNA
```

↓

```text
Architecture Intelligence
```

↓

```text
Repository Health
```

Each stage builds upon the previous one.

---

# 6.3 Technology Detection

Technology detection identifies engineering frameworks, libraries and infrastructure components that define repository implementation.

Current examples include:

### Backend Technologies

- Node.js
- Fastify
- Express
- NestJS
- Spring Boot
- Laravel

### Frontend Technologies

- React
- Next.js
- Tailwind CSS
- React Native

### Persistence

- PostgreSQL
- MongoDB
- Prisma
- Redis

### Infrastructure

- Docker
- BullMQ
- GitHub Actions
- OAuth
- Server-Sent Events
- Socket.IO

Rather than being presented independently, these technologies become supporting evidence for later engineering analysis.

---

# 6.4 Repository Type Detection

Technology Fingerprint also proposes repository types.

Repository types describe the engineering role performed by the repository.

Examples include:

```text
ENGINEERING_INTELLIGENCE_PLATFORM
```

```text
DEVTOOL_PLATFORM
```

```text
FINTECH_PLATFORM
```

```text
OBSERVABILITY_PLATFORM
```

```text
SECURITY_PLATFORM
```

Implementation classifications are also generated where appropriate.

Examples include:

```text
FRONTEND_APPLICATION
```

```text
BACKEND_SERVICE
```

```text
JAVASCRIPT_TYPESCRIPT_PROJECT
```

These implementation classifications are intentionally treated as secondary to repository purpose.

---

# 6.5 Architecture Domain Detection

Technology Fingerprint identifies architectural disciplines represented within the repository.

Current architecture domains include:

- Backend Systems
- Frontend Architecture
- Database Layer
- Queue Infrastructure
- Engineering Intelligence
- Realtime Systems
- API Layer
- Authentication
- Developer Infrastructure

Unlike repository types, architecture domains describe engineering structure rather than product purpose.

Multiple domains may coexist within a single repository.

For example:

```text
Engineering Intelligence

Backend Systems

Queue Infrastructure

Database Layer
```

These domains later contribute to Architecture Radar generation.

---

# 6.6 Capability Detection

Capabilities represent engineering features that a repository appears capable of supporting.

Examples include:

- Authentication
- Queue Infrastructure
- API Layer
- Realtime Systems
- Repository Analysis
- Engineering Intelligence
- Code Generation

Capabilities differ from technologies.

For example:

```text
BullMQ
```

is a technology.

Whereas:

```text
Queue Infrastructure
```

is an engineering capability.

This distinction allows ArcHive to describe what a repository can do rather than simply what packages it uses.

---

# 6.7 Reasoning Signals

One of the defining characteristics of ArcHive is explainability.

Every repository classification is supported by reasoning signals.

Examples include:

```text
Detected repository intelligence concepts and engineering analysis patterns.
```

```text
Detected financial reconciliation terminology.
```

```text
Detected background job and queue processing patterns.
```

```text
Detected Clean Architecture layering.
```

Rather than exposing only a final classification, ArcHive surfaces these observations throughout the dashboard so developers can understand why engineering conclusions were reached.

---

# 6.8 Repository Type Ranking

Not every detected repository type has equal importance.

ArcHive therefore applies a ranking strategy before selecting the primary repository type.

Conceptually, the ranking follows this order:

```text
Purpose

↓

Architecture

↓

Implementation
```

For example:

```text
ENGINEERING_INTELLIGENCE_PLATFORM
FRONTEND_APPLICATION
JAVASCRIPT_TYPESCRIPT_PROJECT
```

The resulting repository identity becomes:

Primary:

```text
Engineering Intelligence Platform
```

Secondary:

```text
Frontend Application
JavaScript / TypeScript Project
```

This prevents generic implementation technologies from overriding repository purpose.

---

# 6.9 Technology Fingerprint Output

The final output of the Technology Fingerprint engine is a structured engineering fingerprint.

Conceptually it contains:

```text
Fingerprint

├── Technologies
├── Repository Types
├── Architecture Domains
├── Engineering Signals
├── Reasoning Signals
├── Capabilities
└── Evidence Results
```

This fingerprint becomes the primary input for the next stage of the intelligence pipeline.

Rather than analysing repository evidence again, subsequent engines consume the fingerprint and progressively enrich repository understanding.
