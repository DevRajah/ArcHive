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

# 9. Classification Conflict Resolution

Repository classification is rarely a straightforward process.

Modern software systems frequently combine multiple engineering disciplines within a single repository.

For example, a repository may simultaneously contain:

- backend services
- frontend applications
- asynchronous processing
- engineering intelligence
- authentication
- developer tooling
- artificial intelligence

Each of these characteristics may activate different detectors throughout the classification pipeline.

Without a dedicated conflict resolution stage, repositories could receive inconsistent or contradictory classifications depending on detector execution order.

To prevent this, ArcHive introduces a deterministic Classification Conflict Resolution Engine.

Its responsibility is to resolve competing repository identities before selecting the final classification.

---

# 9.1 Why Conflict Resolution Is Necessary

Consider ArcHive.

During analysis, the following repository types may be detected:

```text
Engineering Intelligence Platform

Developer Tooling Platform

Frontend Application

JavaScript / TypeScript Project
```

Every detector is technically correct.

ArcHive does contain developer tooling concepts.

It also contains a frontend application.

It is also implemented using TypeScript.

However, none of these should replace the repository's primary engineering purpose.

Conflict Resolution determines which repository type best represents the repository as a whole.

---

# 9.2 Sources of Classification Conflicts

Conflicts generally arise for one of four reasons.

## Multiple Engineering Domains

Repositories frequently implement multiple engineering disciplines.

For example:

```text
Financial Infrastructure

↓

Queue Infrastructure

↓

Realtime Systems
```

Each detector contributes evidence independently.

Conflict Resolution determines which engineering domain best represents repository purpose.

---

## Generic Technology Signals

Programming languages often activate implementation detectors.

For example:

```text
TypeScript
```

may contribute:

```text
JavaScript / TypeScript Project
```

while engineering terminology contributes:

```text
Engineering Intelligence Platform
```

Conflict Resolution prevents implementation technologies from replacing engineering purpose.

---

## Shared Engineering Concepts

Some engineering concepts appear across multiple domains.

For example:

```text
Authentication
```

may exist within:

- healthcare platforms
- financial systems
- developer platforms
- engineering intelligence systems

Authentication alone should never determine repository identity.

Conflict Resolution therefore evaluates supporting evidence before selecting a classification.

---

## Broad Engineering Platforms

Certain repositories naturally span multiple engineering areas.

For example:

ArcHive includes:

- repository analysis
- architecture intelligence
- engineering quality
- benchmarking
- recommendations

It also contains:

- frontend
- backend
- queues
- authentication

Without conflict resolution, these implementation characteristics could incorrectly outweigh repository purpose.

---

# 9.3 Conflict Resolution Principles

ArcHive follows several principles when resolving competing repository classifications.

---

## Principle 1

Purpose always overrides implementation.

Example:

```text
Engineering Intelligence Platform
```

outranks:

```text
Frontend Application
```

---

## Principle 2

Specific engineering domains override generic engineering domains.

For example:

```text
Financial Infrastructure
```

is more specific than:

```text
Backend Service
```

Likewise:

```text
Engineering Intelligence Platform
```

is more informative than:

```text
JavaScript / TypeScript Project
```

---

## Principle 3

Multiple strong evidence sources outweigh isolated detector matches.

Example:

Engineering Intelligence receives evidence from:

- repository terminology
- architecture domains
- repository DNA
- reasoning signals
- engineering capabilities

while:

```text
Developer Tooling Platform
```

may receive evidence only from:

```text
CLI

Generator

Scaffolding
```

Engineering Intelligence therefore becomes the dominant classification.

---

## Principle 4

Conflicting secondary classifications may be removed.

If a secondary repository type introduces ambiguity without adding engineering value, ArcHive suppresses it.

For example:

Instead of displaying:

```text
Engineering Intelligence Platform

Developer Tooling Platform

Frontend Application

JavaScript / TypeScript Project
```

ArcHive may instead display:

```text
Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

The removed classification remains part of the internal evidence but is excluded from the public repository identity.

---

# 9.4 Evidence Consensus

Conflict Resolution considers detector agreement.

Suppose five detectors contribute evidence.

```text
Engineering Intelligence

★★★★★
```

```text
Developer Tooling

★★
```

```text
Frontend

★★★
```

Engineering Intelligence receives the strongest overall consensus.

Consensus therefore contributes to repository identity alongside evidence weighting.

---

# 9.5 Dominant Engineering Narrative

Rather than selecting the repository type with the highest individual score, ArcHive attempts to identify the dominant engineering narrative.

For example:

ArcHive is not simply:

```text
A frontend application.
```

Nor is it merely:

```text
A TypeScript repository.
```

Instead, the dominant engineering narrative is:

```text
An Engineering Intelligence Platform designed to analyse, classify and understand software repositories.
```

This narrative-based approach produces classifications that better reflect engineering intent.

---

# 9.6 Real-World Conflict Resolution Examples

## ArcHive

Initially Detected

```text
Engineering Intelligence Platform

Developer Tooling Platform

Frontend Application

JavaScript / TypeScript Project
```

Resolved

```text
Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

Developer Tooling is removed because the repository's primary purpose is repository intelligence rather than software generation.

---

## Backend Forge

Initially Detected

```text
Developer Tooling Platform

Backend Service

JavaScript / TypeScript Project
```

Resolved

```text
Developer Tooling Platform

JavaScript / TypeScript Project
```

Backend Service is removed because it describes implementation rather than the repository's engineering purpose.

---

## LedgerFlow

Initially Detected

```text
Financial Infrastructure

Backend Service

Queue Infrastructure

JavaScript / TypeScript Project
```

Resolved

```text
Financial Infrastructure

Backend Service

JavaScript / TypeScript Project
```

Queue Infrastructure remains part of the architectural analysis but is not promoted to repository identity.

---

# 9.7 Deterministic Classification

An important design goal of ArcHive is deterministic classification.

Running the same repository through the classification engine multiple times should always produce the same engineering identity provided the repository evidence remains unchanged.

This determinism improves:

- reproducibility
- testing
- debugging
- engineering confidence
- frontend consistency

Classification should never depend on detector execution order or random processing decisions.

---

# 9.8 Benefits of Conflict Resolution

The Conflict Resolution Engine provides several important engineering benefits.

It:

- removes contradictory classifications
- preserves engineering purpose
- reduces false positives
- improves frontend readability
- produces deterministic results
- simplifies repository comparison
- increases confidence in engineering intelligence

Without conflict resolution, repository identities would become increasingly ambiguous as additional detectors were introduced.

---

# 9.9 Classification Conflict Resolution Summary

Classification Conflict Resolution represents the final decision-making stage of ArcHive's Repository Classification Engine.

By resolving competing repository types using evidence strength, engineering specificity, detector consensus and repository purpose, ArcHive produces stable, explainable and meaningful repository identities.

The result is a classification system that consistently reflects **what a repository is designed to achieve**, rather than simply listing every technology or engineering concept detected during analysis.

# 10. Classification Confidence Model

Repository classification should never be treated as an absolute decision.

Engineering repositories vary significantly in size, complexity and available information. Some repositories provide extensive documentation, rich architectural history and highly descriptive engineering terminology. Others contain only a small collection of source files and minimal metadata.

Although both repositories can be analysed, the confidence associated with their classifications should not be identical.

For this reason, ArcHive implements a dedicated **Classification Confidence Model**.

Rather than simply assigning repository types, the classification engine also evaluates how strongly the available engineering evidence supports those classifications.

Confidence becomes an integral part of every repository intelligence report.

---

# 10.1 Purpose of Classification Confidence

The objective of confidence scoring is not to determine whether a repository is "correct" or "incorrect."

Instead, confidence communicates how reliable the current engineering conclusion appears based on the evidence available during analysis.

For example:

```text
Repository Type

Engineering Intelligence Platform

Confidence

97%
```

communicates significantly more information than:

```text
Engineering Intelligence Platform
```

alone.

Developers immediately understand that the classification is supported by substantial engineering evidence.

---

# 10.2 Confidence vs Probability

Although confidence is represented numerically, it should not be interpreted as statistical probability.

Instead, confidence represents engineering certainty.

A confidence score reflects:

- the amount of engineering evidence collected
- the quality of that evidence
- agreement between detectors
- engineering consistency
- repository specificity

Confidence therefore communicates engineering reliability rather than mathematical probability.

---

# 10.3 Factors Influencing Confidence

Several independent engineering factors contribute to classification confidence.

Current contributors include:

## Evidence Quantity

Repositories containing more engineering observations generally produce higher confidence.

Examples include:

- architecture changes
- repository descriptions
- engineering terminology
- detected capabilities
- engineering signals

---

## Evidence Diversity

Confidence increases when evidence originates from multiple independent sources.

For example:

```text
Repository Description

+

Architecture Changes

+

Technology Detection

+

Reasoning Signals

+

Repository DNA
```

provides significantly stronger confidence than:

```text
Repository Name
```

alone.

---

## Detector Agreement

Independent detectors often identify similar engineering conclusions.

For example:

Engineering Intelligence Detector

↓

Engineering Intelligence Platform

Architecture Detector

↓

Engineering Intelligence

Technology Fingerprint

↓

Repository Analysis

When multiple detectors independently reinforce the same engineering narrative, confidence increases naturally.

---

## Engineering Specificity

Specialised engineering terminology contributes considerably more confidence than generic implementation technologies.

For example:

```text
Repository DNA
```

provides stronger engineering confidence than:

```text
TypeScript
```

Likewise:

```text
Payment Reconciliation
```

provides stronger confidence than:

```text
Node.js
```

because it identifies a specialised engineering domain.

---

# 10.4 Confidence Levels

Although internally represented numerically, confidence can be interpreted through qualitative engineering levels.

Conceptually:

| Confidence | Interpretation |
|------------|----------------|
| 90–100 | Very High Confidence |
| 75–89 | High Confidence |
| 60–74 | Moderate Confidence |
| 40–59 | Low Confidence |
| Below 40 | Preliminary Classification |

These ranges help developers understand the reliability of repository classifications without requiring detailed knowledge of the underlying scoring model.

---

# 10.5 Confidence Evolution

Repository confidence is not static.

As repositories evolve, additional engineering evidence becomes available.

Examples include:

- new architecture changes
- additional engineering capabilities
- richer documentation
- infrastructure improvements
- repository restructuring

Each engineering improvement has the potential to increase classification confidence.

Similarly, removing engineering evidence or simplifying repository scope may reduce confidence.

Confidence therefore evolves alongside the repository itself.

---

# 10.6 Confidence and Repository Growth

Early-stage repositories often produce lower confidence scores.

For example:

```text
Repository

↓

Basic API

↓

Minimal Documentation

↓

Limited Architecture
```

↓

```text
Moderate Confidence
```

As the repository matures:

```text
Authentication

↓

Queue Infrastructure

↓

Repository Health

↓

Architecture Intelligence

↓

Engineering Assessment
```

↓

```text
High Confidence
```

This progression reflects the growing amount of engineering evidence available for analysis.

---

# 10.7 Confidence in Repository Comparisons

Confidence also plays an important role during benchmarking.

Two repositories may receive identical classifications while possessing different confidence levels.

For example:

```text
Repository A

Engineering Intelligence Platform

Confidence

98%
```

```text
Repository B

Engineering Intelligence Platform

Confidence

66%
```

Although both repositories belong to the same engineering domain, Repository A provides significantly stronger supporting evidence.

Benchmarking therefore considers confidence alongside repository identity.

---

# 10.8 Explainable Confidence

A major design objective of ArcHive is transparency.

Confidence should never appear as an unexplained number.

Instead, developers should understand why a repository achieved a particular confidence level.

Examples include:

```text
High confidence due to:

• Multiple engineering detectors agreed.

• Rich architecture history detected.

• Strong repository-specific terminology identified.

• Consistent engineering capabilities observed.
```

Likewise:

```text
Lower confidence due to:

• Limited engineering evidence.

• Minimal repository metadata.

• Few architecture changes.

• Generic implementation technologies.
```

This explainability reinforces trust in the classification process.

---

# 10.9 Confidence Model Benefits

The Classification Confidence Model provides several engineering advantages.

It:

- communicates engineering certainty
- reduces ambiguity
- improves repository benchmarking
- supports explainable engineering intelligence
- highlights repositories requiring additional analysis
- strengthens trust in classification outcomes

Confidence therefore becomes an essential component of ArcHive's engineering intelligence rather than an optional metric.

---

# 10.10 Classification Confidence Summary

The Classification Confidence Model ensures that ArcHive not only identifies what a repository represents but also communicates how strongly that conclusion is supported by engineering evidence.

By combining evidence quantity, evidence diversity, detector agreement and engineering specificity, the platform produces confidence scores that evolve alongside repository development and provide valuable context for every engineering decision.


# 11. False Positive Prevention

Accurate repository classification requires more than identifying engineering terminology.

Many engineering concepts naturally appear across multiple software domains, making naive keyword matching insufficient for reliable repository intelligence.

For example, the presence of:

```text
Redis
```

does not imply that a repository is an infrastructure platform.

Likewise:

```text
Docker
```

does not necessarily indicate a DevOps platform.

Similarly:

```text
Authentication
```

appears in healthcare systems, financial platforms, engineering intelligence platforms and countless backend services.

Without appropriate safeguards, repositories would frequently receive misleading classifications.

To minimise this risk, ArcHive incorporates several false positive prevention mechanisms throughout its Repository Classification Engine.

---

# 11.1 Understanding False Positives

A false positive occurs when a repository is assigned a repository type that does not accurately represent its engineering purpose.

For example:

```text
Repository

↓

Contains BullMQ

↓

Incorrectly Classified As

Developer Tooling Platform
```

BullMQ indicates asynchronous processing.

It does **not** indicate developer tooling.

Similarly:

```text
Repository

↓

Contains Redis

↓

Incorrectly Classified As

Infrastructure Platform
```

Redis alone provides insufficient engineering evidence to support that conclusion.

False positives reduce confidence in engineering intelligence and negatively affect every downstream intelligence engine.

Preventing them is therefore a critical architectural objective.

---

# 11.2 Domain-Specific Evidence

One of the primary mechanisms for reducing false positives is requiring domain-specific engineering evidence.

Generic implementation technologies are intentionally insufficient.

For example:

```text
Fastify

Redis

PostgreSQL
```

These technologies appear in thousands of repositories.

Conversely:

```text
Repository Intelligence

Technology Fingerprint

Repository DNA

Architecture Radar
```

strongly indicate an Engineering Intelligence Platform.

Similarly:

```text
Ledger

Settlement

Payment Reconciliation

Audit Trail
```

strongly indicate Financial Infrastructure.

Requiring specialised engineering terminology significantly improves classification accuracy.

---

# 11.3 Multiple Evidence Requirement

ArcHive rarely classifies repositories based upon a single engineering observation.

Instead, multiple supporting signals are required.

Conceptually:

```text
Repository Intelligence

+

Repository DNA

+

Architecture Intelligence

+

Engineering Assessment
```

↓

```text
Engineering Intelligence Platform
```

This multi-evidence strategy prevents isolated keywords from dominating repository classification.

---

# 11.4 Detector Consensus

False positives are also reduced through detector agreement.

Consider:

Engineering Intelligence Detector

↓

Engineering Intelligence Platform

Technology Fingerprint

↓

Repository Analysis

Architecture Detector

↓

Engineering Intelligence

All three detectors support the same engineering narrative.

Classification confidence therefore increases.

Conversely:

Developer Tooling Detector

↓

Developer Tooling Platform

while every other detector identifies Engineering Intelligence.

In this situation, the isolated detector contributes evidence but does not override the dominant engineering narrative.

---

# 11.5 Purpose Overrides Generic Matches

Another important safeguard is repository purpose prioritisation.

Generic implementation characteristics are never allowed to replace engineering purpose.

For example:

Detected:

```text
JavaScript / TypeScript Project
```

Detected:

```text
Engineering Intelligence Platform
```

The repository is ultimately classified as:

```text
Engineering Intelligence Platform
```

because engineering purpose carries significantly greater weight.

This prevents implementation technologies from producing misleading repository identities.

---

# 11.6 Context-Aware Detection

Many engineering concepts are meaningful only within a specific context.

Consider:

```text
Generator
```

This term may appear within:

- developer tooling
- engineering documentation
- educational material
- artificial intelligence

Rather than immediately assigning:

```text
Developer Tooling Platform
```

ArcHive evaluates surrounding engineering evidence.

Only when multiple supporting observations are present does the detector contribute significant classification weight.

This context-aware strategy substantially reduces accidental classifications.

---

# 11.7 Suppressing Weak Classifications

Repository types supported only by weak evidence may be intentionally excluded from the final repository identity.

For example:

Detected:

```text
Developer Tooling Platform
```

Evidence:

```text
CLI
```

only.

Meanwhile:

Engineering Intelligence receives evidence from:

- repository intelligence
- repository health
- repository DNA
- architecture intelligence
- repository analysis
- engineering quality

The weak Developer Tooling classification remains part of the internal evidence graph but is suppressed from the public repository identity.

This behaviour improves the quality of engineering reports while preserving valuable engineering observations.

---

# 11.8 Continuous Classification Improvement

False positive prevention is not considered a completed feature.

Instead, ArcHive continuously improves classification quality as new engineering domains and repository examples become available.

Typical improvements include:

- refining detector rules
- introducing additional engineering terminology
- adjusting evidence weights
- improving repository ranking
- enhancing conflict resolution
- expanding detector coverage

This iterative approach allows repository classification to become progressively more accurate over time.

---

# 11.9 Real-World Examples

### ArcHive

Early Classification

```text
Engineering Intelligence Platform

Developer Tooling Platform

Frontend Application

JavaScript / TypeScript Project
```

After improving false positive prevention:

```text
Engineering Intelligence Platform

Frontend Application

JavaScript / TypeScript Project
```

The Developer Tooling classification was suppressed because insufficient evidence supported it as the repository's dominant engineering purpose.

---

### Backend Forge

Detected:

```text
Developer Tooling Platform

JavaScript / TypeScript Project
```

This classification remains valid because the repository contains strong domain-specific evidence including:

- scaffolding
- module generation
- CLI workflows
- backend generation
- template creation

Unlike ArcHive, the engineering narrative genuinely represents developer tooling.

---

# 11.10 False Positive Prevention Summary

False positive prevention is essential for producing reliable engineering intelligence.

Rather than relying on isolated keywords or implementation technologies, ArcHive combines specialised engineering terminology, detector consensus, repository purpose prioritisation and context-aware evidence weighting to minimise incorrect classifications.

These safeguards ensure that repository identities remain meaningful, explainable and consistent as the platform expands to support additional engineering domains.

