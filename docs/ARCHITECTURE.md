# ArcHive Architecture

## Overview

ArcHive is an Engineering Intelligence Platform designed to analyse
software repositories and transform repository metadata, engineering
events and architectural signals into structured engineering
intelligence.

Unlike traditional repository dashboards that primarily visualise GitHub
metadata, ArcHive focuses on understanding **what a repository is**,
**how it is engineered**, **how it is evolving**, and **where
engineering improvements can be made**.

The platform follows a modular intelligence architecture where every
analysis concern is implemented as an independent engine. This design
allows new intelligence capabilities to be introduced without affecting
existing components.

------------------------------------------------------------------------

# High-Level Architecture

``` text
GitHub Repository
        │
        ▼
GitHub OAuth & Import
        │
        ▼
Webhook Processing
        │
        ▼
BullMQ Queue
        │
        ▼
Worker Processing
        │
        ▼
Evidence Engine
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
Architecture Intelligence
        │
        ▼
Engineering Assessment Engines
        │
        ▼
Canonical Repository Intelligence
        │
        ▼
Fastify API
        │
        ▼
Next.js Dashboard
```

------------------------------------------------------------------------

# Monorepo Structure

``` text
apps/
 ├── api
 ├── frontend
 └── worker

packages/
 ├── database
 ├── detectors
 ├── queue
 └── shared
```

------------------------------------------------------------------------

# Core Intelligence Pipeline

## Evidence Engine

Collects weighted evidence from repository metadata, repository history,
engineering events, architecture changes, repository context and
detected technologies.

Evidence categories include:

-   Repository metadata
-   File structure
-   Dependencies
-   Code patterns
-   Domain language
-   Architecture patterns

The evidence engine intentionally separates **domain purpose** from
**implementation details**.

------------------------------------------------------------------------

## Technology Fingerprint

The fingerprint engine converts raw evidence into structured engineering
signals.

Outputs include:

-   Technologies
-   Repository Types
-   Architecture Domains
-   Engineering Signals
-   Reasoning Signals
-   Capabilities

------------------------------------------------------------------------

## Repository Identity

Repository Identity determines:

-   Primary Repository Type
-   Secondary Repository Types
-   Repository Purpose
-   Repository Persona

Examples include:

-   Engineering Intelligence Platform
-   Developer Tooling Platform
-   FinTech Platform
-   Frontend Application
-   Backend Service

Purpose classifications are always prioritised over implementation
classifications.

------------------------------------------------------------------------

## Repository DNA

Repository DNA summarises the engineering identity of the repository.

It contains:

-   Engineering Profile
-   Dominant Technologies
-   Dominant Architecture
-   Strongest Capabilities
-   Engineering Focus
-   Maturity Score
-   Complexity Score
-   Confidence Score

------------------------------------------------------------------------

## Architecture Intelligence

Architecture Intelligence combines:

-   Repository Types
-   Architecture Domains
-   Technologies
-   Engineering Signals
-   Capabilities

to produce:

-   Architecture Radar
-   Strongest Domain
-   Architecture Narrative
-   Evolution Insights

Unlike traditional approaches that simply count architecture changes,
ArcHive uses weighted engineering evidence to infer architectural
characteristics.

------------------------------------------------------------------------

## Engineering Assessment Engines

ArcHive includes dedicated engines for:

-   Engineering Quality
-   Repository Health
-   Repository Maturity
-   Production Readiness
-   Technical Debt
-   Strength Analysis
-   Weakness Analysis
-   Recommendation Generation
-   Cross-Repository Benchmarking

Each engine is isolated behind a clear interface to improve
maintainability and extensibility.

------------------------------------------------------------------------

# Canonical Intelligence Report

ArcHive exposes repository intelligence through a canonical report shape.

```text
repositoryIntelligence
  identity
    primaryRepositoryType
    repositoryTypes
    repositoryPersona
    repositoryDNA

  signals
    technologies
    architectureDomains
    engineeringSignals
    reasoningSignals
    capabilities
    evidenceResults

  assessment
    engineeringQuality
    productionReadiness
    repositoryMaturity
    repositoryHealth
    technicalDebt
    architectureDrift
    evolutionInsights

  advisor
    strengthReport
    weaknessReport
    recommendationReport
```

This canonical wrapper ensures that every frontend page consumes the same intelligence model instead of relying on multiple legacy response structures. By exposing a single, consistent contract, ArcHive avoids duplicated business logic across endpoints while making future intelligence engines easier to integrate and maintain.

---

# Repository Reprocessing

ArcHive supports manual repository intelligence regeneration.

The following endpoints are available:

```http
POST /api/repositories/:repositoryId/reprocess
POST /api/repositories/reprocess-all
```

Reprocessing executes the latest repository intelligence pipeline using the current detector set and classification logic.

Typical use cases include:

- Applying newly developed repository detectors.
- Refreshing intelligence after repository changes.
- Regenerating stale classifications.
- Recomputing engineering assessments after improvements to the intelligence engine.
- Updating repository DNA after architectural evolution.

Because intelligence generation is deterministic, repositories can be reprocessed repeatedly without affecting historical engineering events.

---

# Queue and Worker Architecture

Engineering event processing is performed asynchronously using BullMQ and Redis.

```text
GitHub Webhook
        │
        ▼
Engineering Event Queue
        │
        ▼
BullMQ Worker
        │
        ▼
Engineering Event Processing
        │
        ├── Architecture Changes
        ├── Repository Timeline
        ├── Repository Intelligence Refresh
        └── Dashboard Updates
```

Moving engineering analysis into background workers prevents long-running intelligence generation from blocking API requests while improving scalability and responsiveness.

---

# Frontend Architecture

ArcHive provides a modern Next.js dashboard that consumes the Fastify API through a single repository intelligence model.

Major frontend responsibilities include:

- Repository import and GitHub integration
- Repository portfolio dashboard
- Repository Intelligence reports
- Architecture Radar visualisation
- Repository Narrative generation
- Repository Health dashboards
- Engineering Quality reporting
- Repository Maturity analysis
- Technical Debt reporting
- Strength and Weakness summaries
- Engineering Recommendations
- Manual intelligence refresh actions

To improve readability, the frontend automatically converts internal enumeration values into user-friendly labels.

Example:

```text
ENGINEERING_INTELLIGENCE_PLATFORM
        │
        ▼
Engineering Intelligence Platform
```

This allows backend APIs to remain stable while presenting meaningful terminology to end users.

---

# Design Principles

## Purpose Over Implementation

ArcHive classifies repositories according to their engineering purpose rather than simply listing programming languages or frameworks. Product intent always has higher priority than implementation technologies.

## Modular Intelligence Engines

Every major engineering concern is implemented as an independent engine.

Examples include:

- Repository Identity
- Repository DNA
- Architecture Intelligence
- Repository Health
- Technical Debt
- Repository Maturity
- Benchmarking
- Recommendation Engine

This modular design keeps the platform maintainable while allowing new intelligence engines to be introduced without impacting existing functionality.

## Explainable Classification

Every classification produced by ArcHive is backed by engineering evidence and reasoning signals.

Rather than producing opaque classifications, the platform explains why repositories were categorised in a particular way.

## Canonical Intelligence Model

All frontend pages consume the same canonical `repositoryIntelligence` wrapper.

This removes duplicated mapping logic, simplifies maintenance and ensures consistency across every intelligence view.

## Extensible Detection Architecture

Repository types, engineering signals, capabilities, technologies and architecture domains can all be extended independently without requiring changes throughout the platform.

---

# Current Example Outputs

## ArcHive

```text
Purpose
Engineering Intelligence Platform

Implementation
Frontend Application
JavaScript / TypeScript Project
```

ArcHive is recognised primarily as an Engineering Intelligence Platform while implementation technologies remain secondary descriptors.

---

## Backend Forge

```text
Purpose
Developer Tooling Platform

Implementation
JavaScript / TypeScript Project
```

Backend Forge is classified according to its primary role as a developer productivity and scaffolding platform rather than its implementation language.

---

## LedgerFlow

```text
Purpose
FinTech Platform

Implementation
Backend Service
```

LedgerFlow is recognised as financial infrastructure because engineering evidence strongly indicates payment processing, reconciliation workflows and audit capabilities.

---

These examples demonstrate ArcHive's philosophy of separating **repository purpose** from **implementation details**, producing classifications that more accurately represent the engineering intent of a software system.

------------------------------------------------------------------------

# Future Direction

Planned improvements include:

-   Organisation-wide engineering analytics
-   AI-assisted repository summaries
-   Richer architecture visualisations
-   Drift detection over time
-   Cross-organisation benchmarking
-   Engineering trend analysis

------------------------------------------------------------------------

# Summary

ArcHive is designed as an engineering intelligence platform rather than
a repository browser. Its modular architecture separates evidence
collection, repository understanding, engineering assessment and
presentation into independent components, making the platform
maintainable, extensible and suitable for analysing repositories at
scale.

# 9. Repository Persona

While Repository Identity determines **what a repository is**, Repository Persona attempts to describe **how the repository behaves** within an engineering portfolio.

This distinction is subtle but important.

Two repositories may share the same primary identity while exhibiting completely different engineering characteristics.

For example:

```text
Repository A

Identity
Engineering Intelligence Platform

Persona
Product SaaS
```

```text
Repository B

Identity
Engineering Intelligence Platform

Persona
Developer Platform
```

Both repositories belong to the same engineering domain, yet they serve different audiences and fulfil different roles.

Repository Persona captures this higher-level behavioural description.

---

# 9.1 Why Repository Persona Exists

During development it became apparent that repository purpose alone could not fully describe every software system.

For example, consider the following repositories:

Repository A

```text
Developer Tooling Platform
```

Repository B

```text
Developer Tooling Platform
```

Although both repositories share the same purpose, one may be:

- a command-line application

while another may be:

- a cloud-hosted Software-as-a-Service platform.

Likewise, two FinTech repositories may differ significantly.

One may be:

```text
Payment Infrastructure
```

while another represents:

```text
Financial Analytics Platform
```

Repository Persona therefore provides an additional abstraction that helps describe how software fits into a broader engineering landscape.

---

# 9.2 Identity vs Persona

Repository Identity and Repository Persona answer different engineering questions.

Repository Identity answers:

> What engineering problem does this repository solve?

Repository Persona answers:

> What type of engineering product is this?

For example:

```text
Repository Identity

Engineering Intelligence Platform
```

Repository Persona

```text
Product SaaS
```

or

```text
Developer Platform
```

Similarly:

Repository Identity

```text
Developer Tooling Platform
```

Repository Persona

```text
CLI Tool
```

Identity describes engineering purpose.

Persona describes engineering behaviour.

---

# 9.3 Persona Detection

Repository Persona is inferred from accumulated engineering evidence generated throughout the intelligence pipeline.

Signals contributing to persona include:

- repository purpose
- architecture domains
- technologies
- deployment characteristics
- infrastructure
- engineering capabilities
- repository organisation

Unlike Repository Identity, Persona does not rely on a single detector.

Instead, it combines multiple engineering observations before selecting the most appropriate behavioural description.

---

# 9.4 Current Persona Categories

Current repository personas include:

- Product SaaS
- Developer Platform
- CLI Tool
- Engineering Platform
- Infrastructure Service
- Backend Platform
- Frontend Experience
- Internal Engineering Tool

Additional personas can be introduced as ArcHive evolves.

The modular detector architecture allows new personas to be added without affecting existing repository classifications.

---

# 9.5 Persona Confidence

Repository Persona is accompanied by a confidence level derived from the supporting engineering evidence.

Confidence increases when multiple evidence sources independently support the same behavioural interpretation.

For example:

```text
Repository Purpose

Engineering Intelligence Platform
```

combined with

```text
Engineering Intelligence

Repository Analysis

Architecture Intelligence

Repository Health

Engineering Quality
```

produces significantly stronger confidence than relying on repository metadata alone.

This confidence information is preserved throughout later intelligence stages.

---

# 9.6 Why Persona Matters

Repository Persona improves engineering communication.

Rather than describing ArcHive only as:

```text
Engineering Intelligence Platform
```

the platform can also communicate that it behaves as:

```text
Engineering Platform

Product SaaS
```

Similarly:

Backend Forge becomes:

```text
Developer Tooling Platform

CLI Tool
```

LedgerFlow becomes:

```text
Financial Infrastructure

Backend Platform
```

This richer description provides significantly more engineering context than repository purpose alone.

---

# 9.7 Persona and Engineering Intelligence

Repository Persona is intentionally separated from Repository Identity because engineering products often evolve.

For example, a repository may begin life as:

```text
CLI Tool
```

before later evolving into:

```text
Cloud Platform
```

or

```text
Product SaaS
```

Its engineering purpose may remain unchanged, while its behavioural characteristics evolve considerably.

Separating Persona from Identity allows ArcHive to represent these changes more accurately.

---

# 9.8 Repository Persona Output

The Repository Persona engine produces a concise behavioural profile.

Conceptually, its output contains:

```text
Repository Persona

├── Primary Persona
├── Persona Confidence
├── Supporting Signals
├── Behavioural Characteristics
└── Engineering Context
```

This profile complements Repository Identity rather than replacing it.

Together, Repository Identity, Repository DNA and Repository Persona provide a comprehensive understanding of what a repository is, how it is engineered and how it behaves within a broader software ecosystem.

# 10. Architecture Intelligence

Following the generation of Repository Identity, Repository DNA and Repository Persona, ArcHive enters one of the most significant stages of the intelligence pipeline: **Architecture Intelligence**.

Architecture Intelligence attempts to answer a different engineering question.

Rather than determining **what** a repository is, it seeks to understand **how the repository is engineered**.

Software architecture influences scalability, maintainability, extensibility and long-term engineering quality. Two repositories may solve the same business problem while adopting entirely different architectural approaches.

For this reason, Architecture Intelligence is implemented as an independent analysis engine rather than a simple extension of Repository Identity.

---

# 10.1 Purpose of Architecture Intelligence

The primary responsibility of Architecture Intelligence is to identify the dominant engineering disciplines present within a repository.

Examples include:

- Backend Systems
- Frontend Architecture
- API Layer
- Database Layer
- Queue Infrastructure
- Realtime Systems
- Authentication
- Engineering Intelligence
- Repository Analysis
- Code Generation

Unlike Repository Types, which describe product purpose, Architecture Domains describe engineering structure.

This distinction allows ArcHive to separately analyse:

- what software has been built
- how the software has been engineered

---

# 10.2 Why Architecture Matters

Architecture influences every aspect of software engineering.

Poor architectural decisions often lead to:

- tightly coupled modules
- difficult maintenance
- scalability limitations
- duplicated business logic
- inconsistent engineering practices

Conversely, well-structured architecture often demonstrates:

- clear separation of concerns
- modular design
- reusable components
- maintainability
- extensibility

Because architecture has such a significant impact on engineering quality, ArcHive treats it as a first-class intelligence concern rather than simply displaying detected technologies.

---

# 10.3 Architecture Domains

Architecture Intelligence groups engineering characteristics into Architecture Domains.

Current domains include:

```text
API Layer

Backend Systems

Frontend Architecture

Database Layer

Queue Infrastructure

Realtime Systems

Authentication

Engineering Intelligence

Repository Analysis

Developer Infrastructure
```

Each domain represents an engineering discipline rather than an individual framework.

For example:

```text
BullMQ
```

does not become an architecture domain.

Instead, it contributes evidence towards:

```text
Queue Infrastructure
```

Similarly:

```text
Fastify
```

supports:

```text
API Layer
```

while:

```text
Next.js
```

supports:

```text
Frontend Architecture
```

This abstraction makes Architecture Intelligence significantly more useful than simple framework detection.

---

# 10.4 Architecture Evidence

Architecture Intelligence consumes engineering evidence generated throughout the earlier stages of the pipeline.

Examples include:

- detected technologies
- architecture changes
- engineering capabilities
- repository types
- repository DNA
- reasoning signals

Each piece of evidence contributes to one or more architecture domains.

For example:

```text
BullMQ

Redis

Worker Processing
```

↓

```text
Queue Infrastructure
```

Likewise:

```text
Fastify

Express

REST Endpoints
```

↓

```text
API Layer
```

Architecture Intelligence therefore builds upon previous engineering analysis rather than repeating repository inspection.

---

# 10.5 Weighted Architecture Scoring

Architecture Intelligence does not simply count technologies.

Instead, every architecture domain receives a weighted engineering score.

Several factors contribute to this score, including:

- supporting technologies
- engineering capabilities
- repository purpose
- reasoning signals
- architecture evidence
- repository DNA

The weighting system ensures that architecture reflects overall engineering emphasis rather than isolated implementation details.

This approach allows ArcHive to identify dominant architectural characteristics even when multiple technologies coexist.

---

# 10.6 Architecture Radar

One of the primary outputs of the Architecture Intelligence engine is the Architecture Radar.

The Architecture Radar visualises the relative strength of each architecture domain.

Conceptually, it may resemble:

```text
Engineering Intelligence    ██████████

Backend Systems             ████████

Queue Infrastructure        ███████

Database Layer              ██████

Frontend Architecture       █████

Realtime Systems            ████
```

Rather than displaying raw detector counts, the radar represents weighted engineering confidence.

This allows developers to immediately identify the dominant engineering disciplines within a repository.

---

# 10.7 Strongest Architecture Domain

After all architecture domains have been scored, ArcHive identifies the dominant engineering discipline.

For example:

```text
ArcHive

Strongest Domain

Engineering Intelligence
```

```text
Backend Forge

Strongest Domain

Developer Infrastructure
```

```text
LedgerFlow

Strongest Domain

Financial Systems
```

The strongest domain provides a concise architectural summary that complements Repository Identity.

---

# 10.8 Architecture Evolution

Architecture is not static.

Repositories evolve as features are introduced, engineering practices improve and infrastructure changes.

Architecture Intelligence therefore considers repository evolution rather than analysing only the current repository snapshot.

Signals contributing to architecture evolution include:

- architecture changes
- engineering timeline
- technology adoption
- infrastructure growth
- engineering capabilities

This historical perspective allows ArcHive to identify long-term engineering direction.

---

# 10.9 Architecture Narrative

Architecture Intelligence also contributes to Repository Narrative.

Rather than simply stating:

```text
Queue Infrastructure detected.
```

ArcHive generates engineering descriptions such as:

> The repository demonstrates a strong emphasis on asynchronous processing through queue-based workflows supported by Redis and BullMQ. Combined with its API layer and engineering intelligence components, this suggests a modular architecture designed for scalable repository analysis.

Narrative generation transforms engineering observations into readable technical summaries.

---

# 10.10 Architecture Intelligence Output

Architecture Intelligence produces a structured engineering report.

Conceptually, it contains:

```text
Architecture Intelligence

├── Architecture Domains
├── Domain Scores
├── Strongest Domain
├── Architecture Radar
├── Architecture Narrative
├── Evolution Insights
├── Supporting Evidence
└── Engineering Confidence
```

This output becomes a critical input for the remaining stages of the intelligence pipeline.

Engineering Quality, Repository Health, Repository Maturity and Technical Debt all consume Architecture Intelligence to assess the structural quality of a repository rather than relying solely on implementation technologies.


