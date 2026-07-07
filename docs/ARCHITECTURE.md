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