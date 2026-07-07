# ArcHive API Reference

# 1. Introduction

The ArcHive API provides the primary interface through which clients interact with the Engineering Intelligence Platform.

Every feature available within the ArcHive dashboard—including repository import, engineering intelligence generation, architecture analysis, repository narratives, benchmarking and engineering recommendations—is exposed through a consistent RESTful API.

Rather than acting as a thin database wrapper, the API serves as the orchestration layer between repository data, engineering intelligence engines and frontend applications.

Its responsibilities include:

- repository management
- GitHub integration
- engineering intelligence generation
- architecture analysis
- repository benchmarking
- asynchronous processing
- engineering reporting
- intelligence reprocessing

By centralising these responsibilities within a unified API layer, ArcHive provides a stable contract that allows frontend applications, background workers and future third-party integrations to interact with the platform consistently.

This document describes the design philosophy, architectural principles and major resources exposed by the ArcHive API.

---

# 2. API Philosophy

The ArcHive API was designed around one guiding principle:

> **Expose engineering concepts rather than database tables.**

Many REST APIs simply mirror their underlying database schema.

For example:

```text
/users

/repositories

/events

/timeline
```

Although functional, this approach often forces frontend applications to combine multiple responses before meaningful information can be presented.

ArcHive instead exposes engineering-oriented resources.

Examples include:

```text
Repository Intelligence
```

```text
Repository DNA
```

```text
Repository Narrative
```

```text
Architecture Radar
```

```text
Repository Benchmark
```

These endpoints represent engineering concepts rather than persistence models.

This philosophy significantly reduces frontend complexity while improving long-term maintainability.

---

# 2.1 Backend as the Source of Truth

One of the primary architectural decisions within ArcHive is that all engineering intelligence is generated on the backend.

The frontend is intentionally designed as a presentation layer.

Responsibilities are divided as follows.

Backend:

- engineering analysis
- repository classification
- repository DNA generation
- architecture intelligence
- engineering assessment
- benchmarking
- recommendation generation

Frontend:

- rendering dashboards
- visualising intelligence
- displaying architecture radar
- formatting engineering labels
- repository navigation

By preventing intelligence logic from leaking into the frontend, ArcHive ensures that engineering decisions remain consistent regardless of which client consumes the API.

---

# 2.2 Stable API Contracts

The API has been designed around stable contracts.

Every endpoint returns a predictable response structure regardless of the underlying engineering engine responsible for generating the data.

For example:

```text
{
    success,
    message,
    data
}
```

This consistent response model provides several benefits:

- predictable frontend integration
- simplified error handling
- easier API documentation
- improved testing
- backwards compatibility

As additional engineering engines are introduced, existing clients continue to function without modification.

---

# 2.3 Engineering-Centric Resources

Unlike traditional CRUD APIs, ArcHive exposes engineering intelligence as first-class resources.

Examples include:

```text
Repository Intelligence
```

```text
Repository DNA
```

```text
Repository Persona
```

```text
Architecture Radar
```

```text
Engineering Assessment
```

```text
Repository Narrative
```

These resources represent the core value of the platform and are treated independently from persistence models.

---

# 3. REST Design Principles

Although ArcHive provides highly specialised engineering intelligence, its API follows established REST principles wherever practical.

The API is organised around resources rather than actions.

Examples include:

```text
/api/repositories
```

```text
/api/intelligence
```

```text
/api/architecture
```

```text
/api/dashboard
```

Each endpoint represents a logical engineering resource with clearly defined responsibilities.

This organisation improves discoverability while reducing unnecessary endpoint duplication.

---

# 3.1 Resource-Oriented URLs

URLs describe engineering resources rather than implementation details.

Examples include:

```text
/api/repositories
```

rather than:

```text
/api/getRepositories
```

Similarly:

```text
/api/repositories/{repositoryId}/narrative
```

communicates considerably more information than:

```text
/api/generateNarrative
```

This resource-oriented design improves readability while aligning with established REST conventions.

---

# 3.2 HTTP Method Semantics

ArcHive uses HTTP methods according to their intended meaning.

Typical examples include:

| Method | Purpose |
|---------|---------|
| GET | Retrieve engineering information |
| POST | Create resources or initiate engineering workflows |
| PUT | Replace an existing resource |
| PATCH | Modify selected resource attributes |
| DELETE | Remove a resource |

This consistent use of HTTP semantics makes the API predictable for developers already familiar with RESTful systems.

---

# 3.3 Stateless Communication

Every API request contains the information required to process it.

The server does not depend on previous client requests to understand the current operation.

Authentication, authorisation and repository context are resolved independently for each request.

This stateless design simplifies horizontal scaling and improves reliability across distributed deployments.

---

# 3.4 Consistent Naming

Resource names are intentionally descriptive and use plural nouns where appropriate.

Examples include:

```text
/repositories
```

```text
/events
```

```text
/timeline
```

Nested resources describe relationships naturally.

For example:

```text
/repositories/{repositoryId}/intelligence
```

```text
/repositories/{repositoryId}/architecture-radar
```

```text
/repositories/{repositoryId}/narrative
```

This structure allows developers to understand endpoint behaviour without consulting implementation details.

---

# 3.5 API Design Goals

The ArcHive API is designed to satisfy several engineering objectives.

These include:

- consistency
- predictability
- readability
- scalability
- maintainability
- discoverability
- extensibility

Every endpoint introduced into the platform is expected to follow these principles, ensuring that the API remains coherent as ArcHive continues to evolve.

The following sections describe the major resources exposed by the platform, beginning with authentication and identity management before progressing to repository management, engineering intelligence and background processing services.

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

# 7. Timeline & Engineering Events API

Software repositories are continuously evolving systems.

Every commit, pull request, architectural change and engineering decision contributes to the long-term evolution of a software project.

Rather than analysing repositories as static snapshots, ArcHive records these engineering events over time and exposes them through the Timeline & Engineering Events API.

This historical perspective allows developers to understand not only the current state of a repository, but also **how it reached that state**.

The Timeline API therefore complements the Engineering Intelligence API by providing chronological engineering context.

---

# 7.1 Purpose of the Timeline API

Engineering intelligence becomes significantly more valuable when supported by historical evidence.

For example, a repository may currently be classified as an Engineering Intelligence Platform.

The Timeline API explains how that classification emerged by recording engineering events throughout the repository lifecycle.

Typical timeline events include:

- repository import
- GitHub synchronisation
- architecture changes
- technology detection
- intelligence regeneration
- engineering assessments
- repository reprocessing

Rather than storing isolated engineering observations, ArcHive organises them into a coherent engineering history.

---

# 7.2 Timeline Architecture

Conceptually, repository evolution follows the workflow below.

```text
GitHub Activity

↓

Webhook Events

↓

Engineering Event Queue

↓

Worker Processing

↓

Timeline Entries

↓

Architecture Changes

↓

Repository Intelligence

↓

Timeline API
```

Each engineering event contributes additional historical context that later intelligence engines can consume.

---

# 7.3 Timeline Entries

Timeline entries represent meaningful engineering milestones throughout repository evolution.

Examples include:

- repository imported
- repository analysed
- engineering intelligence regenerated
- architecture updated
- new technology detected
- repository reprocessed

Each timeline entry records:

- title
- description
- timestamp
- related repository
- engineering metadata

This allows engineering history to be presented chronologically while remaining understandable to developers.

---

# 7.4 Engineering Events

Engineering events differ from timeline entries.

Timeline entries are designed for human consumption.

Engineering events are intended primarily for internal processing.

Examples include:

```text
Repository Imported

GitHub Push Received

Architecture Updated

Technology Detected

Repository Reprocessed
```

Engineering events act as the raw operational data that ultimately produces timeline entries and repository intelligence.

---

# 7.5 Event Processing Pipeline

Events generated throughout the platform are processed asynchronously.

Conceptually:

```text
Incoming Event

↓

Event Queue

↓

Worker

↓

Repository Updated

↓

Timeline Generated

↓

Architecture Updated

↓

Repository Intelligence Regenerated
```

This asynchronous architecture prevents expensive engineering analysis from delaying API responses while improving scalability.

---

# 7.6 Architecture Change Tracking

One of the most valuable event types recorded by ArcHive is the Architecture Change.

Architecture changes capture engineering evolution over time.

Typical information includes:

- affected component
- detected technology
- architecture domain
- engineering reasoning
- repository classifications
- engineering summary

Rather than simply recording file modifications, ArcHive records engineering significance.

This enables Architecture Intelligence to reason about long-term repository evolution.

---

# 7.7 Repository Evolution

As timeline entries accumulate, ArcHive begins constructing an engineering narrative describing repository growth.

Examples include:

```text
Repository Imported

↓

Authentication Added

↓

Queue Infrastructure Introduced

↓

Engineering Intelligence Expanded

↓

Architecture Assessment Improved

↓

Repository Reprocessed
```

This engineering timeline provides significantly richer context than a traditional commit history.

---

# 7.8 Timeline Retrieval

Timeline endpoints expose engineering history in chronological order.

Typical operations include:

- retrieve repository timeline
- view engineering events
- inspect architecture history
- analyse repository evolution

Because timeline information is already structured, frontend applications can present repository history without additional processing.

---

# 7.9 Timeline Visualisation

The Timeline API is designed to support visual engineering dashboards.

Typical frontend visualisations include:

- chronological activity feeds
- engineering milestone timelines
- architecture evolution views
- repository growth summaries
- intelligence refresh history

These visualisations allow developers to understand repository evolution at a glance.

---

# 7.10 Relationship with Architecture Intelligence

Timeline data serves as one of the primary inputs to the Architecture Intelligence Engine.

Rather than analysing only the current repository snapshot, Architecture Intelligence also considers historical engineering evolution.

For example:

```text
Timeline

↓

Architecture Changes

↓

Engineering Signals

↓

Architecture Radar

↓

Repository Narrative
```

This historical perspective enables ArcHive to identify long-term engineering trends rather than isolated implementation details.

---

# 7.11 Timeline API Design Principles

The Timeline API follows several architectural principles.

### Historical Accuracy

Timeline entries preserve the chronological order of engineering events.

---

### Explainability

Every significant engineering event can be traced back to supporting repository activity.

---

### Separation of Concerns

Engineering events remain distinct from timeline entries.

Events support processing.

Timeline entries support presentation.

---

### Scalability

Event processing occurs asynchronously through background workers, allowing repository analysis to scale without blocking API requests.

---

### Intelligence Integration

Timeline information feeds directly into Architecture Intelligence, Repository Narratives and Engineering Assessment.

---

# 7.12 Timeline API Summary

The Timeline & Engineering Events API provides the historical foundation of ArcHive's Engineering Intelligence Platform.

By recording engineering milestones, architecture evolution and repository activity over time, the API enables developers to understand not only what a repository currently represents, but also how its engineering characteristics have evolved.

This historical context strengthens repository classification, architecture analysis and engineering assessment while providing a rich engineering narrative that extends far beyond traditional source control history.

The next section introduces the **GitHub Integration API**, which connects ArcHive to GitHub repositories, receives webhook events and continuously synchronises engineering activity into the intelligence pipeline.

# 8. GitHub Integration API

GitHub serves as the primary engineering data source for ArcHive.

Rather than requiring users to manually upload repository information, ArcHive integrates directly with GitHub to retrieve repository metadata, monitor engineering activity and continuously refresh engineering intelligence.

The GitHub Integration API acts as the bridge between GitHub's repository ecosystem and ArcHive's internal intelligence pipeline.

Its responsibilities extend beyond authentication, providing continuous synchronisation of repository activity into the Engineering Intelligence Platform.

---

# 8.1 Purpose of GitHub Integration

The purpose of the GitHub Integration API is to ensure that engineering intelligence reflects the current state of a repository.

Instead of analysing repositories only once during import, ArcHive continuously observes repository evolution through GitHub events.

This allows engineering intelligence to remain current without requiring repeated manual imports.

The integration layer supports:

- GitHub authentication
- repository discovery
- repository import
- webhook processing
- repository synchronisation
- engineering event generation

These capabilities collectively enable continuous engineering analysis.

---

# 8.2 Repository Discovery

After authentication, ArcHive retrieves repositories associated with the authenticated GitHub account.

Repository discovery collects metadata including:

- repository name
- owner
- description
- default branch
- visibility
- primary language
- repository identifiers

This information provides the initial engineering context before repository intelligence generation begins.

Repository discovery intentionally performs minimal analysis.

Engineering intelligence is generated later by dedicated intelligence engines.

---

# 8.3 Repository Import Workflow

Repository onboarding follows a structured workflow.

Conceptually:

```text
GitHub Repository

↓

Repository Selected

↓

Metadata Retrieved

↓

Repository Stored

↓

Engineering Event Created

↓

Queue Processing

↓

Repository Intelligence Generated
```

Separating repository import from intelligence generation ensures that onboarding remains responsive while allowing engineering analysis to execute asynchronously.

---

# 8.4 GitHub Webhooks

One of ArcHive's most important integration features is GitHub webhook support.

Webhooks allow GitHub to notify ArcHive whenever meaningful repository activity occurs.

Typical webhook events include:

- repository pushes
- branch updates
- repository changes
- repository deletions
- metadata updates

Rather than polling GitHub continuously, ArcHive reacts to engineering events as they occur.

This event-driven architecture reduces unnecessary API traffic while keeping repository intelligence up to date.

---

# 8.5 Webhook Processing Pipeline

Incoming webhook requests pass through several stages before engineering intelligence is updated.

Conceptually:

```text
GitHub

↓

Webhook Request

↓

Webhook Validation

↓

Engineering Event Queue

↓

Background Worker

↓

Repository Analysis

↓

Architecture Changes

↓

Repository Intelligence Refresh
```

Delegating processing to background workers prevents webhook requests from timing out while improving scalability.

---

# 8.6 Engineering Event Generation

Each webhook produces one or more engineering events.

Examples include:

```text
Repository Updated

New Technology Detected

Architecture Changed

Repository Intelligence Reprocessed

Timeline Updated
```

These events become inputs to later intelligence engines including:

- Architecture Intelligence
- Timeline
- Repository Narrative
- Engineering Assessment

The event-driven design enables repository intelligence to evolve continuously as software changes.

---

# 8.7 Repository Synchronisation

Synchronisation ensures that ArcHive remains aligned with the corresponding GitHub repository.

Typical synchronisation activities include:

- refreshing repository metadata
- updating engineering events
- detecting architecture changes
- refreshing engineering signals
- regenerating repository intelligence

Synchronisation occurs automatically following webhook processing or manual repository refresh.

This approach minimises stale engineering information.

---

# 8.8 Manual Repository Refresh

Although webhook processing provides automatic synchronisation, ArcHive also supports manual refresh operations.

Manual refresh allows users to immediately regenerate engineering intelligence after:

- detector improvements
- repository restructuring
- engineering engine updates
- newly introduced repository capabilities

This functionality is particularly useful during active platform development when intelligence algorithms evolve frequently.

---

# 8.9 Integration Security

GitHub integration follows several security principles.

Webhook requests are validated before processing.

Authentication occurs through GitHub OAuth.

Repository ownership is verified before engineering intelligence becomes accessible.

Sensitive credentials remain stored securely within backend configuration rather than client applications.

These measures ensure that repository synchronisation remains both secure and reliable.

---

# 8.10 Failure Handling

External integrations inevitably encounter failures.

Examples include:

- unavailable GitHub services
- invalid webhook payloads
- expired authentication
- repository removal
- network interruptions

Rather than interrupting API availability, ArcHive isolates integration failures from engineering intelligence.

Background workers record failures, allowing synchronisation to be retried without affecting frontend responsiveness.

This fault-tolerant design improves overall platform reliability.

---

# 8.11 Integration Design Principles

The GitHub Integration API follows several architectural principles.

### Event-Driven Processing

Engineering analysis is triggered by repository activity rather than periodic polling.

---

### Loose Coupling

GitHub remains responsible for repository hosting.

ArcHive focuses exclusively on engineering intelligence.

---

### Asynchronous Synchronisation

Long-running engineering analysis is delegated to background workers.

---

### Secure Integration

Authentication, ownership verification and webhook validation protect engineering data throughout the synchronisation process.

---

### Continuous Intelligence

Engineering intelligence evolves alongside repository evolution rather than remaining a static snapshot.

---

# 8.12 GitHub Integration API Summary

The GitHub Integration API forms the connection between GitHub and ArcHive's Engineering Intelligence Platform.

Through repository discovery, OAuth authentication, webhook processing, asynchronous synchronisation and engineering event generation, the integration layer ensures that repository intelligence continuously reflects the latest engineering state of every imported repository.

By adopting an event-driven architecture, ArcHive avoids unnecessary polling while maintaining accurate, explainable and up-to-date engineering intelligence across the entire repository portfolio.

The next section introduces the **Queue & Background Processing API**, explaining how ArcHive performs large-scale engineering analysis asynchronously while maintaining fast and responsive API interactions.


# 9. Queue & Background Processing API

Generating engineering intelligence is a computationally intensive process.

Repository classification, architecture analysis, engineering assessment, benchmarking and repository narrative generation all require multiple intelligence engines to execute sequentially.

Performing these operations synchronously during every API request would significantly increase response times while limiting platform scalability.

To address this challenge, ArcHive adopts an asynchronous processing architecture built around Redis and BullMQ.

Rather than performing expensive engineering analysis during HTTP requests, the API delegates long-running tasks to background workers through a distributed job queue.

This architecture enables the platform to remain responsive while continuously processing engineering intelligence in the background.

---

# 9.1 Why Background Processing?

Engineering intelligence involves considerably more work than retrieving data from a database.

A single repository refresh may require:

- analysing repository metadata
- executing engineering detectors
- generating technology fingerprints
- recalculating repository identity
- updating Repository DNA
- rebuilding Architecture Intelligence
- generating engineering assessments
- refreshing recommendations
- updating benchmarking information
- writing timeline entries

Executing these operations within a single HTTP request would introduce unnecessary latency.

Background processing separates engineering computation from user interaction.

---

# 9.2 Queue Architecture

ArcHive follows an event-driven queue architecture.

Conceptually:

```text
Client Request

↓

API

↓

Engineering Job

↓

BullMQ Queue

↓

Redis

↓

Worker

↓

Engineering Intelligence

↓

Database

↓

Frontend Refresh
```

Instead of waiting for engineering analysis to complete, the API immediately accepts the request and schedules background processing.

Workers then execute the required intelligence pipeline independently.

---

# 9.3 BullMQ

BullMQ provides the queue management layer within ArcHive.

Its responsibilities include:

- job scheduling
- job persistence
- retry handling
- failure recovery
- worker coordination
- queue monitoring

BullMQ was selected because it provides a robust and scalable foundation for asynchronous engineering workloads while integrating naturally with the Node.js ecosystem.

---

# 9.4 Redis

Redis acts as the underlying message broker for BullMQ.

Rather than storing jobs directly within the application, Redis maintains queue state independently.

This provides several engineering advantages:

- durable job storage
- efficient queue operations
- fast worker communication
- horizontal scalability
- distributed processing support

Separating queue infrastructure from application logic allows workers to scale independently of the API server.

---

# 9.5 Worker Architecture

Workers are responsible for executing engineering jobs retrieved from the queue.

Each worker processes jobs independently from incoming API requests.

Typical responsibilities include:

- repository classification
- engineering detector execution
- architecture analysis
- timeline generation
- engineering assessment
- repository benchmarking
- intelligence regeneration

This separation ensures that engineering analysis continues even when the API is handling new client requests.

---

# 9.6 Job Lifecycle

Every engineering job progresses through a predictable lifecycle.

Conceptually:

```text
Job Created

↓

Queued

↓

Waiting

↓

Processing

↓

Completed

↓

Engineering Intelligence Updated
```

If a problem occurs during execution:

```text
Processing

↓

Failed

↓

Retry

↓

Completed
```

This lifecycle provides visibility into engineering operations while improving fault tolerance.

---

# 9.7 Repository Reprocessing Jobs

Repository reprocessing is one of the most common background operations.

Whenever users request an intelligence refresh, the API creates a new background job.

The worker then performs:

- technology fingerprint regeneration
- repository reclassification
- Repository DNA updates
- architecture intelligence refresh
- engineering assessment regeneration
- benchmarking updates
- recommendation regeneration

The frontend can continue operating while these computations occur asynchronously.

---

# 9.8 Webhook Processing Jobs

GitHub webhook events are also processed through the queue.

Conceptually:

```text
GitHub Webhook

↓

API

↓

Engineering Event

↓

BullMQ Queue

↓

Worker

↓

Architecture Changes

↓

Timeline Updates

↓

Repository Intelligence Refresh
```

This architecture prevents webhook requests from timing out while allowing complex engineering analysis to execute independently.

---

# 9.9 Queue Monitoring

ArcHive continuously monitors background processing activity.

Typical operational metrics include:

- queued jobs
- active jobs
- completed jobs
- failed jobs
- retry count
- processing duration

These metrics help developers understand platform activity while simplifying debugging and operational monitoring.

Future versions of ArcHive may expose richer operational dashboards for engineering teams.

---

# 9.10 Retry Strategy

Background processing occasionally encounters temporary failures.

Examples include:

- database connectivity issues
- GitHub availability
- Redis interruptions
- worker restarts

Rather than immediately discarding failed jobs, BullMQ automatically retries eligible operations.

Retry behaviour improves platform resilience while reducing manual intervention.

Permanent failures are recorded for later inspection.

---

# 9.11 Fault Isolation

One of the primary advantages of asynchronous processing is fault isolation.

If engineering analysis fails:

- API availability remains unaffected.
- Repository data remains accessible.
- Users continue interacting with the dashboard.
- Failed jobs can be retried later.

Separating engineering computation from request handling significantly improves overall platform reliability.

---

# 9.12 Scalability

The queue architecture enables ArcHive to scale horizontally.

Instead of increasing API server resources, additional workers can be introduced as engineering workloads grow.

Conceptually:

```text
API

↓

Queue

↓

Worker 1

Worker 2

Worker 3

Worker 4

↓

Repository Intelligence
```

This architecture supports large engineering portfolios without introducing bottlenecks within the API layer.

---

# 9.13 Queue API Design Principles

Several engineering principles influenced the design of ArcHive's background processing system.

### Asynchronous by Default

Long-running engineering operations execute outside the request lifecycle.

---

### Loose Coupling

API servers and workers remain independent services.

---

### Reliability

Jobs are persisted, monitored and retried automatically where appropriate.

---

### Scalability

Additional workers can be introduced without modifying API behaviour.

---

### Fault Tolerance

Processing failures are isolated from frontend interactions.

---

# 9.14 Queue & Background Processing Summary

The Queue & Background Processing API enables ArcHive to perform sophisticated engineering analysis without compromising responsiveness.

By combining BullMQ, Redis and independent worker processes, the platform separates computationally intensive intelligence generation from client interactions, ensuring that repository classification, architecture analysis and engineering assessments remain scalable, reliable and resilient.

This asynchronous architecture forms a critical part of ArcHive's Engineering Intelligence Platform, allowing repository intelligence to evolve continuously while maintaining a fast and predictable user experience.

The next section introduces the **Error Handling & Response Model**, explaining how ArcHive communicates success, failures and validation feedback through a consistent API contract.