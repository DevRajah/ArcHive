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