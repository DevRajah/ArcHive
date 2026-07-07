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

