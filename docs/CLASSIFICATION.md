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

# 7. Detector Architecture

At the heart of ArcHive's Repository Classification Engine lies a modular detector architecture.

Rather than implementing repository classification inside a single, continuously growing algorithm, ArcHive decomposes repository understanding into a collection of specialised engineering detectors.

Each detector focuses exclusively on one engineering domain.

Examples include:

- Engineering Intelligence
- Developer Tooling
- Financial Infrastructure
- Observability
- Security
- Artificial Intelligence
- Data Engineering
- Mobile Applications
- Smart Transport
- Healthcare
- Education
- Energy
- Collaboration
- Messaging
- E-Commerce

This architecture allows the classification engine to evolve organically as new engineering domains emerge without increasing system complexity.

---

# 7.1 Design Objectives

The detector architecture was designed with several engineering objectives.

These include:

- modularity
- maintainability
- extensibility
- explainability
- independent testing
- domain isolation

Instead of one classifier attempting to understand every engineering discipline, each detector specialises in recognising a specific repository domain.

This keeps classification logic focused and significantly easier to maintain.

---

# 7.2 Independent Engineering Domains

Each detector represents a single engineering concern.

For example, the Engineering Intelligence detector understands concepts such as:

```text
Repository Intelligence

Technology Fingerprint

Repository DNA

Architecture Intelligence

Repository Health

Engineering Assessment
```

Meanwhile, the Financial Infrastructure detector focuses on concepts such as:

```text
Ledger

Payment

Settlement

Reconciliation

Audit Trail

Transactions
```

Likewise, the Developer Tooling detector recognises engineering terminology including:

```text
CLI

Scaffolding

Generator

Module Generation

Templates

Backend Forge
```

Because every detector focuses on only one engineering domain, the resulting logic remains compact and highly specialised.

---

# 7.3 Detector Responsibilities

Each detector performs the same fundamental responsibilities.

These include:

- inspecting engineering evidence
- identifying engineering terminology
- assigning evidence weights
- generating reasoning signals
- contributing repository type candidates

Importantly, detectors do **not** determine the final repository classification.

Instead, they simply contribute engineering evidence.

The Classification Engine later combines this evidence before selecting the final repository identity.

---

# 7.4 Detector Lifecycle

Conceptually, every detector follows the same lifecycle.

```text
Engineering Evidence

↓

Detector Executes

↓

Engineering Concepts Detected

↓

Evidence Assigned

↓

Reasoning Signals Generated

↓

Repository Type Candidate Added

↓

Next Detector Executes
```

This process repeats for every detector registered within the classification engine.

No detector depends on another detector.

This independence greatly simplifies future development.

---

# 7.5 Detector Registration

Rather than hardcoding repository classification into one large function, ArcHive registers detectors centrally.

Conceptually:

```text
Evidence Engine

↓

Engineering Intelligence Detector

↓

Developer Tooling Detector

↓

Financial Infrastructure Detector

↓

Observability Detector

↓

Security Detector

↓

Healthcare Detector

↓

Education Detector

↓

Energy Detector

↓

Messaging Detector

↓

...

↓

Evidence Aggregation
```

Because detectors execute independently, introducing new engineering domains requires minimal modification to the surrounding system.

---

# 7.6 Detector Collaboration

Although detectors execute independently, they frequently contribute evidence towards the same repository.

For example, ArcHive may activate:

Engineering Intelligence Detector

↓

```text
Repository Intelligence
```

Technology Detector

↓

```text
Fastify

Redis

BullMQ
```

Architecture Detector

↓

```text
Engineering Intelligence

Backend Systems

Queue Infrastructure
```

Each detector contributes different evidence.

The Classification Engine later aggregates these observations before resolving repository identity.

This collaborative approach produces considerably stronger engineering conclusions than relying on isolated detector matches.

---

# 7.7 Detector Isolation

One of the most important architectural principles within ArcHive is detector isolation.

Detectors intentionally avoid:

- modifying other detectors
- overriding repository identity
- accessing unrelated engineering domains
- performing ranking decisions
- calculating confidence

Instead, every detector simply reports engineering observations.

Higher-level intelligence engines remain responsible for:

- evidence aggregation
- repository ranking
- confidence calculation
- conflict resolution
- repository identity

This separation greatly improves maintainability.

---

# 7.8 Adding a New Detector

Introducing support for a new engineering domain follows a predictable workflow.

```text
Identify Engineering Domain

↓

Create Detector

↓

Register Detector

↓

Define Repository Type

↓

Assign Evidence

↓

Generate Reasoning Signals

↓

Run Classification
```

Because detectors are isolated, new engineering domains can be introduced without modifying existing detectors.

For example, adding support for:

```text
Cybersecurity Platform
```

would require only:

- creating a Cybersecurity detector
- registering the detector
- defining engineering terminology
- assigning repository types

No existing detector requires modification.

---

# 7.9 Detector Advantages

The modular detector architecture provides several engineering benefits.

## Improved Maintainability

Smaller detectors are significantly easier to understand than one monolithic classification engine.

---

## Independent Testing

Every detector can be tested independently using repository-specific engineering scenarios.

This greatly improves reliability.

---

## Reduced Coupling

Engineering domains remain isolated.

Changes to one detector do not introduce unexpected behaviour into unrelated repository classifications.

---

## Extensibility

Supporting new repository domains becomes straightforward.

Developers simply introduce another detector without redesigning the overall classification engine.

---

## Explainability

Because every detector produces its own reasoning signals, ArcHive can explain exactly why a repository received a particular classification.

This transparency is one of the defining characteristics of the platform.

---

# 7.10 Detector Architecture Summary

The detector architecture forms the foundation of ArcHive's Repository Classification Engine.

Rather than relying on a monolithic classifier, ArcHive distributes engineering understanding across multiple specialised detectors that collaborate through shared engineering evidence.

This modular approach enables the platform to grow naturally as additional repository domains, engineering disciplines and classification strategies are introduced.

# 8. Repository Type Ranking

After all detectors have completed execution, ArcHive possesses a collection of repository type candidates generated from independent engineering evidence.

At this stage, multiple classifications may appear equally valid.

For example, a repository may simultaneously be identified as:

```text
ENGINEERING_INTELLIGENCE_PLATFORM

FRONTEND_APPLICATION

JAVASCRIPT_TYPESCRIPT_PROJECT
```

Although each classification is technically correct, they do not carry the same engineering significance.

Repository Type Ranking is responsible for ordering these candidates according to their engineering value before selecting the repository's primary identity.

Rather than exposing classifications in arbitrary order, ArcHive applies a deterministic ranking strategy that consistently prioritises engineering purpose over implementation.

---

# 8.1 Why Ranking Is Necessary

Repository classification is inherently additive.

Each detector contributes evidence independently, meaning repositories often accumulate several valid classifications.

Consider ArcHive.

Detectors may identify:

```text
Engineering Intelligence Platform

Frontend Application

Backend Service

JavaScript / TypeScript Project
```

All of these observations accurately describe the repository.

However, presenting them without prioritisation creates ambiguity.

Which classification best represents the repository?

Repository Type Ranking answers this question.

---

# 8.2 Purpose Before Implementation

One of the most important design decisions within ArcHive is that repository purpose always outranks implementation.

Purpose describes **why** software exists.

Implementation describes **how** software has been built.

For example:

Purpose

```text
Engineering Intelligence Platform
```

Implementation

```text
Frontend Application
```

Implementation

```text
JavaScript / TypeScript Project
```

Although all three classifications remain useful, the engineering purpose communicates considerably more information than the implementation technologies.

For this reason, ArcHive always promotes repository purpose to the top of the ranking.

---

# 8.3 Repository Classification Hierarchy

Conceptually, repository classifications are organised into three layers.

```text
Purpose

↓

Implementation

↓

Technology
```

### Purpose

Examples include:

```text
Engineering Intelligence Platform

Developer Tooling Platform

Financial Infrastructure

Observability Platform

Healthcare Platform
```

Purpose communicates the engineering problem being solved.

---

### Implementation

Examples include:

```text
Frontend Application

Backend Service

Mobile Application

CLI Application
```

Implementation communicates software structure.

---

### Technology

Examples include:

```text
JavaScript / TypeScript Project

Go Service

Python Service

Rust Service
```

Technology communicates implementation language rather than engineering intent.

This hierarchy forms the foundation of ArcHive's repository ranking strategy.

---

# 8.4 Primary Repository Type

Once repository candidates have been ranked, ArcHive selects a Primary Repository Type.

This becomes the canonical engineering identity used throughout the platform.

For example:

```text
Repository Types

Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

↓

Primary Repository Type

```text
Engineering Intelligence Platform
```

The remaining repository types remain available as supporting engineering context.

---

# 8.5 Secondary Repository Types

Although only one Primary Repository Type is selected, secondary classifications remain valuable.

Secondary repository types provide additional implementation context.

For example:

```text
Primary

Engineering Intelligence Platform
```

Supporting Classifications

```text
Frontend Application

JavaScript / TypeScript Project
```

This layered representation provides a significantly richer engineering description than a single classification alone.

---

# 8.6 Priority Ordering

ArcHive maintains a deterministic repository priority order.

Conceptually:

```text
Engineering Intelligence Platform

↓

Developer Tooling Platform

↓

Financial Infrastructure

↓

Observability Platform

↓

Security Platform

↓

AI / Machine Learning

↓

Healthcare Platform

↓

Education Platform

↓

Collaboration Platform

↓

Backend Service

↓

Frontend Application

↓

JavaScript / TypeScript Project
```

Higher engineering abstractions always outrank implementation technologies.

This ordering ensures consistent classification across all repositories.

---

# 8.7 Why Generic Technologies Rank Last

Programming languages are intentionally ranked at the bottom of the classification hierarchy.

Consider:

```text
TypeScript
```

TypeScript may be used to build:

- financial systems
- engineering intelligence platforms
- observability tools
- healthcare applications
- educational software
- messaging platforms

Because programming languages span almost every engineering domain, they provide minimal information regarding repository purpose.

For this reason, implementation technologies are treated as supporting context rather than primary identity.

---

# 8.8 Real-World Ranking Examples

### ArcHive

Detected:

```text
Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

Displayed:

```text
Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

Primary Identity:

```text
Engineering Intelligence Platform
```

---

### Backend Forge

Detected:

```text
Developer Tooling Platform

JavaScript / TypeScript Project
```

Displayed:

```text
Developer Tooling Platform

JavaScript / TypeScript Project
```

Primary Identity:

```text
Developer Tooling Platform
```

---

### LedgerFlow

Detected:

```text
Financial Infrastructure

Backend Service

JavaScript / TypeScript Project
```

Displayed:

```text
Financial Infrastructure

Backend Service

JavaScript / TypeScript Project
```

Primary Identity:

```text
Financial Infrastructure
```

These examples demonstrate how repository ranking consistently preserves engineering purpose while retaining useful implementation context.

---

# 8.9 Benefits of Repository Ranking

Repository ranking provides several important engineering advantages.

It:

- eliminates ambiguous classifications
- ensures deterministic repository identities
- prevents implementation technologies from dominating engineering purpose
- simplifies frontend presentation
- improves explainability
- produces consistent engineering reports

Without ranking, repository classifications would vary significantly depending on detector execution order.

The ranking engine removes this uncertainty.

---

# 8.10 Repository Type Ranking Summary

Repository Type Ranking represents the decision-making stage of ArcHive's Repository Classification Engine.

Rather than exposing every detected classification equally, the ranking system orders repository types according to engineering significance before selecting the canonical repository identity.

By consistently prioritising engineering purpose over implementation, ArcHive produces repository classifications that more accurately communicate what software systems are designed to achieve rather than simply describing the technologies they happen to use.

