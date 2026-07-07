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

# 4. Authentication & Authorization

Before engineering intelligence can be generated or repository data accessed, every request must pass through ArcHive's authentication and authorisation layers.

Security is treated as a first-class engineering concern throughout the platform.

Rather than allowing unrestricted access to repository intelligence, ArcHive ensures that every protected request is associated with an authenticated user and that permissions are evaluated before business logic is executed.

This approach protects repository information while providing a consistent security model for both the dashboard and future third-party integrations.

---

# 4.1 Authentication Model

ArcHive authenticates users through GitHub OAuth.

GitHub serves as the platform's identity provider, allowing developers to sign in using their existing GitHub accounts without creating separate ArcHive credentials.

The authentication workflow follows a standard OAuth 2.0 authorisation flow.

Conceptually:

```text
User

↓

GitHub OAuth

↓

Authorization Code

↓

ArcHive Backend

↓

GitHub Access Token

↓

User Identity

↓

JWT

↓

Authenticated Session
```

Once authentication succeeds, ArcHive generates its own JSON Web Token (JWT), which becomes the primary authentication mechanism for subsequent API requests.

This separation allows ArcHive to maintain its own session model while delegating user identity verification to GitHub.

---

# 4.2 Why GitHub OAuth?

GitHub OAuth was selected for several reasons.

First, ArcHive is designed primarily for software engineers, making GitHub the most natural identity provider.

Second, OAuth eliminates the need for password storage within ArcHive.

Finally, authenticated GitHub access enables the platform to import repositories and retrieve engineering metadata securely.

By relying on GitHub for identity verification, ArcHive reduces security risk while simplifying the user onboarding experience.

---

# 4.3 JSON Web Tokens (JWT)

After successful authentication, ArcHive issues a signed JSON Web Token.

The JWT represents the authenticated session and is included with every protected API request.

Typical request format:

```http
Authorization: Bearer <jwt-token>
```

The backend validates the token before processing the request.

If validation fails, the request is rejected immediately without executing application logic.

This ensures that protected engineering resources remain accessible only to authenticated users.

---

# 4.4 Protected Resources

Most engineering endpoints require authentication.

Examples include:

```text
Repository Dashboard

Repository Intelligence

Architecture Radar

Repository Narrative

Repository Reprocessing

Timeline

Repository Benchmarking
```

Public endpoints remain limited to health checks and other non-sensitive resources.

This security model ensures that repository intelligence is only available to authorised users.

---

# 4.5 Authorization

Authentication answers the question:

> Who is making this request?

Authorisation answers:

> What is this user allowed to access?

After authentication succeeds, ArcHive verifies that the authenticated user has permission to access the requested resource.

For example:

```text
User

↓

Owns Repository

↓

Access Granted
```

Whereas:

```text
User

↓

Attempts To Access Another User's Repository

↓

Access Denied
```

This ownership-based authorisation model prevents users from viewing or modifying repositories that do not belong to them.

---

# 4.6 Repository Ownership

Every repository imported into ArcHive is associated with a specific user.

Ownership is validated before sensitive engineering operations are performed.

Examples include:

- viewing repository intelligence
- refreshing engineering intelligence
- accessing repository timelines
- viewing architecture reports
- generating repository narratives

Ownership validation is performed on the backend rather than relying on frontend restrictions.

This ensures that authorisation remains enforceable regardless of the client consuming the API.

---

# 4.7 Authentication Middleware

Authentication is implemented through reusable middleware.

Conceptually, the request lifecycle follows:

```text
Incoming Request

↓

JWT Validation

↓

User Resolution

↓

Ownership Validation

↓

Business Logic

↓

API Response
```

By centralising authentication within middleware, security logic remains consistent across every protected endpoint.

This also avoids duplicating authentication checks throughout the codebase.

---

# 4.8 Token Validation

Every JWT undergoes several validation steps before access is granted.

Typical validation includes:

- signature verification
- expiration validation
- token integrity checks
- user existence verification

Requests containing invalid or expired tokens are rejected before reaching application services.

This defensive approach minimises unnecessary processing while strengthening API security.

---

# 4.9 Authentication Error Responses

Authentication failures follow a consistent response format.

Example:

```json
{
  "success": false,
  "message": "Authentication required."
}
```

Invalid or expired tokens produce similar responses with appropriate HTTP status codes.

Providing consistent error structures simplifies frontend error handling and improves developer experience.

---

# 4.10 Security Principles

ArcHive's authentication layer follows several engineering principles.

### Least Privilege

Users are granted access only to repositories they own.

---

### Stateless Authentication

Authentication information is carried entirely within the JWT.

No server-side session state is required.

---

### Backend Enforcement

Authorisation decisions are always performed on the backend.

Frontend applications cannot bypass repository ownership checks.

---

### Secure by Default

Engineering intelligence endpoints are protected unless explicitly intended to be public.

This reduces the likelihood of unintentionally exposing sensitive repository information.

---

# 4.11 Authentication Summary

Authentication and authorisation form the security foundation of the ArcHive API.

By combining GitHub OAuth, JWT-based authentication and ownership-based authorisation, the platform ensures that engineering intelligence remains both secure and easily accessible to authorised users.

This layered security model allows frontend applications, background workers and future API consumers to interact with the platform through a consistent and well-defined authentication mechanism.

The next section introduces the **Repository API**, which serves as the primary entry point for importing repositories, managing engineering data and initiating repository intelligence generation.

# 5. Repository API

The Repository API forms the operational core of the ArcHive platform.

Every engineering intelligence workflow begins with a repository.

Before ArcHive can classify software, analyse architecture or generate engineering insights, repositories must first be imported, tracked and processed.

The Repository API provides the interfaces responsible for managing this lifecycle.

Unlike a traditional CRUD API, the Repository API does considerably more than create and retrieve database records.

It orchestrates repository onboarding, engineering event collection, intelligence generation and repository reprocessing while acting as the primary gateway into the ArcHive Intelligence Platform.

---

# 5.1 Repository Lifecycle

Every repository progresses through a predictable lifecycle after being imported.

Conceptually, the workflow is:

```text
GitHub Repository

↓

Repository Import

↓

Repository Stored

↓

Engineering Events Collected

↓

Architecture Changes Generated

↓

Technology Fingerprint

↓

Repository Intelligence

↓

Dashboard Visualisation
```

Each stage contributes additional engineering context until the repository becomes fully analysed.

This staged workflow allows engineering intelligence to evolve naturally as new repository activity is observed.

---

# 5.2 Repository Import

Repository import is the entry point into the ArcHive platform.

After authenticating with GitHub, users may import one or more repositories into their engineering workspace.

The import process retrieves repository metadata including:

- repository name
- owner
- description
- programming language
- visibility
- GitHub identifiers

The imported repository becomes the canonical representation used throughout the remainder of the intelligence pipeline.

Repository import intentionally performs minimal engineering analysis.

Instead, analysis is delegated to background processing so that repository onboarding remains responsive.

---

# 5.3 Repository Retrieval

Once repositories have been imported, the Repository API provides endpoints for retrieving engineering information.

Typical operations include:

- listing repositories
- retrieving repository details
- viewing engineering summaries
- opening repository dashboards

Repository retrieval focuses on presenting engineering context rather than raw persistence models.

This allows frontend applications to display meaningful engineering information immediately after retrieval.

---

# 5.4 Repository Dashboard

Each repository has a dedicated dashboard that aggregates engineering information from multiple intelligence engines.

Rather than requiring numerous API requests, the Repository API assembles a concise engineering summary suitable for dashboard presentation.

Typical dashboard information includes:

- repository identity
- engineering profile
- engineering quality
- repository maturity
- architecture summary
- recent engineering activity

The dashboard endpoint therefore acts as an aggregation layer rather than a simple data retrieval endpoint.

---

# 5.5 Repository Intelligence

The Repository API also provides access to the complete Repository Intelligence model.

This includes:

```text
Repository Identity

↓

Repository DNA

↓

Repository Persona

↓

Architecture Intelligence

↓

Engineering Assessment

↓

Recommendations

↓

Benchmarking
```

Rather than exposing these components individually, the API returns a unified intelligence model that serves as the single source of truth for frontend applications.

This significantly reduces client-side orchestration.

---

# 5.6 Repository Reprocessing

Engineering intelligence evolves continuously.

As detector logic improves or repositories change, previously generated intelligence may become outdated.

To address this, ArcHive supports repository reprocessing.

Reprocessing regenerates engineering intelligence using the latest detector implementations without requiring the repository to be re-imported.

Typical reasons for reprocessing include:

- detector improvements
- classification enhancements
- engineering engine updates
- repository evolution
- architecture changes

This capability ensures that engineering intelligence remains current as both repositories and the platform evolve.

---

# 5.7 Portfolio Reprocessing

In addition to refreshing individual repositories, ArcHive supports portfolio-wide intelligence regeneration.

Conceptually:

```text
Repositories

↓

Queue Reprocessing Jobs

↓

Engineering Workers

↓

Repository Intelligence

↓

Updated Dashboard
```

This functionality becomes particularly valuable after major improvements to the classification engine or engineering assessment modules.

Rather than requiring users to refresh repositories individually, ArcHive can regenerate intelligence across an entire engineering portfolio.

---

# 5.8 Repository Ownership

Every repository managed by the Repository API belongs to a specific authenticated user.

Ownership is enforced before engineering operations are executed.

Examples include:

- viewing repository intelligence
- refreshing engineering analysis
- accessing architecture reports
- retrieving engineering narratives
- viewing benchmark results

Ownership validation ensures repository intelligence remains isolated between users while allowing future support for shared workspaces and collaborative engineering teams.

---

# 5.9 Repository Deletion

Repository deletion removes repository records together with their associated engineering intelligence.

Depending on deployment requirements, deletion strategies may include:

- soft deletion
- hard deletion
- archival

The current implementation removes repository intelligence while preserving overall system consistency.

Future versions of ArcHive may introduce repository archival to preserve historical engineering intelligence for long-term portfolio analysis.

---

# 5.10 Repository API Response Model

Repository endpoints follow the same consistent response structure used throughout the platform.

Conceptually:

```json
{
  "success": true,
  "message": "Repository fetched successfully.",
  "data": {
    "...": "..."
  }
}
```

Maintaining a uniform response format simplifies frontend integration, reduces duplicated parsing logic and provides a predictable developer experience.

---

# 5.11 Repository API Design Principles

Several engineering principles guided the design of the Repository API.

### Engineering Before Persistence

Repository endpoints expose engineering concepts rather than database tables.

---

### Aggregated Responses

Endpoints combine related engineering information whenever practical, reducing unnecessary client requests.

---

### Stable Contracts

Response structures remain consistent even as underlying intelligence engines evolve.

---

### Backend Intelligence

Engineering analysis is generated on the backend before being returned to clients.

Frontend applications remain presentation-focused.

---

### Asynchronous Processing

Expensive engineering analysis is delegated to background workers whenever possible, ensuring that repository management remains responsive.

---

# 5.12 Repository API Summary

The Repository API represents the operational foundation of the ArcHive platform.

By managing repository onboarding, engineering intelligence generation, dashboard aggregation and intelligence reprocessing, it provides the primary entry point into every engineering workflow supported by ArcHive.

Rather than exposing simple CRUD operations, the Repository API orchestrates the complete lifecycle of repository intelligence, ensuring that software systems evolve from imported GitHub repositories into fully analysed engineering assets.

The next section introduces the **Engineering Intelligence API**, which exposes the specialised endpoints responsible for Repository DNA, Repository Persona, Architecture Radar, Repository Narrative, Engineering Assessment and Benchmarking.

# 6. Engineering Intelligence API

The Engineering Intelligence API represents the defining capability of the ArcHive platform.

While the Repository API manages repository lifecycle operations, the Engineering Intelligence API is responsible for transforming engineering evidence into structured software intelligence.

Rather than exposing raw repository metadata, these endpoints deliver high-level engineering insights including repository identity, engineering profile, architecture analysis, repository narratives, engineering assessments and benchmarking results.

Collectively, these endpoints provide the primary value offered by ArcHive.

---

# 6.1 Engineering Intelligence Overview

Every intelligence endpoint derives its information from the same canonical Repository Intelligence model.

Conceptually:

```text
Repository

↓

Evidence Collection

↓

Technology Fingerprint

↓

Repository Classification

↓

Repository DNA

↓

Architecture Intelligence

↓

Engineering Assessment

↓

Recommendations

↓

Benchmarking

↓

Repository Intelligence API
```

Because every endpoint is backed by the same intelligence pipeline, engineering information remains consistent throughout the platform.

---

# 6.2 Repository Intelligence Endpoint

The Repository Intelligence endpoint serves as the primary engineering intelligence resource.

Rather than requiring clients to call multiple APIs, this endpoint aggregates outputs from every major intelligence engine.

Typical response sections include:

```text
Identity

Signals

Repository DNA

Assessment

Advisor

Benchmarking
```

This endpoint acts as the canonical engineering intelligence interface used throughout the frontend.

Future intelligence engines can contribute additional information without changing the overall response structure.

---

# 6.3 Repository Identity

Repository Identity describes what a repository fundamentally represents.

Typical information includes:

- primary repository type
- repository purpose
- repository types
- repository persona
- engineering profile

Examples:

```text
Engineering Intelligence Platform
```

```text
Developer Tooling Platform
```

```text
Financial Infrastructure
```

Repository Identity intentionally communicates engineering purpose before implementation.

---

# 6.4 Repository DNA

Repository DNA provides a concise engineering summary describing the overall engineering characteristics of a repository.

Typical fields include:

```text
Engineering Profile

Dominant Technologies

Engineering Focus

Strongest Capabilities

Complexity Score

Maturity Score

Confidence Score
```

Repository DNA is intended for dashboards, portfolio summaries and engineering overview pages where concise intelligence is preferred over detailed reports.

---

# 6.5 Repository Persona

Repository Persona represents the engineering personality of a repository.

Unlike Repository Identity, which focuses on classification, Repository Persona communicates how the repository behaves from an engineering perspective.

Examples include:

- Engineering Intelligence Platform
- Backend Infrastructure
- Developer Platform
- Financial Systems Platform

Repository Persona enables richer engineering descriptions while complementing the repository's primary identity.

---

# 6.6 Architecture Radar

Architecture Radar visualises the architectural composition of a repository.

Rather than listing detected technologies, it highlights the dominant engineering domains identified throughout repository analysis.

Typical domains include:

```text
API Layer

Database Layer

Authentication

Queue Infrastructure

Realtime Systems

Repository Analysis

Engineering Intelligence

Frontend Architecture
```

Each domain receives a score based on engineering evidence gathered during analysis.

The resulting radar provides an intuitive visual summary of repository architecture.

---

# 6.7 Repository Narrative

The Repository Narrative endpoint converts structured engineering intelligence into a human-readable description.

Rather than requiring developers to interpret numerous engineering metrics, ArcHive automatically generates an engineering summary describing:

- repository purpose
- engineering characteristics
- architecture style
- dominant technologies
- engineering capabilities
- overall engineering focus

For example:

> ArcHive is an Engineering Intelligence Platform designed to analyse software repositories, generate engineering intelligence and provide explainable architectural insights through a modular multi-stage analysis pipeline.

Repository narratives improve onboarding while making engineering reports easier to interpret.

---

# 6.8 Engineering Assessment

The Engineering Assessment endpoint aggregates outputs from multiple specialised assessment engines.

Typical assessment areas include:

```text
Engineering Quality

Repository Health

Repository Maturity

Production Readiness

Technical Debt

Architecture Intelligence
```

Unlike Repository DNA, which summarises engineering characteristics, Engineering Assessment evaluates repository quality.

These assessments support engineering decision-making while providing a consistent view of repository condition.

---

# 6.9 Recommendation Report

Recommendations are generated after engineering assessment has completed.

The Recommendation endpoint provides structured engineering guidance rather than static observations.

Typical recommendation categories include:

- architecture
- infrastructure
- engineering quality
- scalability
- maintainability
- security

Each recommendation is supported by engineering evidence and accompanied by reasoning describing why the recommendation was generated.

---

# 6.10 Benchmarking

Benchmarking compares repositories across a common engineering framework.

Typical benchmarking dimensions include:

- engineering quality
- repository maturity
- repository health
- complexity
- engineering confidence
- architecture diversity

Benchmarking enables developers to understand repositories relative to one another rather than analysing repositories in isolation.

---

# 6.11 Engineering Signals

Engineering Signals provide transparency into the reasoning behind repository classification.

Examples include:

```text
Detected Repository Intelligence Concepts

Detected Queue Infrastructure

Detected Financial Reconciliation

Detected Authentication Workflow
```

These signals explain how engineering conclusions were reached and support ArcHive's commitment to explainable engineering intelligence.

---

# 6.12 Evidence Results

Every repository classification is supported by structured engineering evidence.

Evidence results include information such as:

- repository type
- confidence
- evidence strength
- supporting engineering observations
- strongest evidence

Presenting evidence alongside repository classifications allows developers to understand not only what ArcHive concluded, but why those conclusions were reached.

---

# 6.13 Canonical Intelligence Response

Although multiple endpoints expose specialised engineering information, they all derive from the same canonical model.

Conceptually:

```text
repositoryIntelligence

├── identity
├── signals
├── repositoryDNA
├── assessment
├── advisor
└── benchmarking
```

Maintaining a single intelligence model ensures consistency across every dashboard, report and engineering visualisation within ArcHive.

---

# 6.14 Engineering Intelligence API Design Principles

Several architectural principles guided the design of the Engineering Intelligence API.

### Canonical Responses

Every endpoint contributes to a shared intelligence model.

---

### Explainability

Engineering conclusions are always accompanied by reasoning signals and supporting evidence.

---

### Extensibility

New intelligence engines can introduce additional sections without breaking existing API contracts.

---

### Backend Intelligence

Engineering analysis is generated exclusively on the backend, ensuring consistent behaviour across all clients.

---

### Engineering-Centric Design

Endpoints expose engineering concepts rather than persistence models or implementation details.

---

# 6.15 Engineering Intelligence API Summary

The Engineering Intelligence API is the analytical heart of ArcHive.

By exposing Repository Identity, Repository DNA, Repository Persona, Architecture Radar, Repository Narrative, Engineering Assessment, Recommendations and Benchmarking through a unified intelligence model, the API enables frontend applications and future integrations to consume sophisticated engineering insights through a simple, consistent interface.

Rather than exposing isolated metrics or raw repository data, the Engineering Intelligence API transforms software repositories into explainable engineering assets capable of supporting architectural analysis, engineering decision-making and portfolio-wide intelligence.

The next section introduces the **Timeline and Engineering Events API**, which captures repository evolution over time and provides the historical engineering context that powers architecture analysis and repository intelligence.