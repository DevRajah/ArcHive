# Contributing to ArcHive

First of all, thank you for taking the time to contribute to ArcHive.

Whether you are fixing a bug, improving documentation, proposing a new engineering intelligence feature or reporting an issue, every contribution helps make ArcHive a better platform for software engineers.

ArcHive is built as an open engineering platform whose goal is to help developers better understand software systems through explainable repository intelligence.

This document explains how to contribute effectively while maintaining the quality, consistency and architectural principles of the project.

---

# Welcome

There are many ways to contribute to ArcHive.

Examples include:

- fixing bugs
- improving documentation
- improving engineering intelligence
- adding repository detectors
- improving architecture analysis
- implementing frontend features
- enhancing API endpoints
- improving developer experience
- improving test coverage
- reviewing pull requests

Every contribution is appreciated.

---

# Project Philosophy

Before contributing, it is important to understand the philosophy behind ArcHive.

ArcHive is **not** another Git repository viewer.

ArcHive exists to generate explainable engineering intelligence.

Every contribution should strengthen one or more of the following principles:

- Engineering-first design
- Explainable intelligence
- Modular architecture
- Stable APIs
- Backend-driven intelligence
- Excellent developer experience

When making design decisions, these principles should always take precedence.

---

# Before You Start

Before opening an issue or writing code, please:

- Read the README
- Read the Architecture Guide
- Read the Intelligence Engine documentation
- Read the Classification Engine documentation
- Read the API Reference

Understanding the overall architecture makes contributions significantly easier.

---

# Ways to Contribute

## Report Bugs

If you discover unexpected behaviour, please open a GitHub Issue.

A good bug report includes:

- operating system
- Node.js version
- repository information
- reproduction steps
- expected behaviour
- actual behaviour
- screenshots where applicable

---

## Suggest Features

Feature requests are welcome.

Please explain:

- the engineering problem
- proposed solution
- expected benefit
- possible implementation ideas

Well-structured feature requests are much easier to evaluate.

---

## Improve Documentation

Documentation is treated as an important part of ArcHive.

Contributions may include:

- correcting mistakes
- improving explanations
- expanding examples
- adding diagrams
- improving developer onboarding

High-quality documentation benefits every contributor.

---

## Improve Engineering Intelligence

Engineering intelligence is the heart of ArcHive.

Examples include:

- new detectors
- improved evidence weighting
- better classification rules
- additional engineering domains
- repository personas
- architecture intelligence
- engineering recommendations

Contributors are encouraged to improve repository understanding wherever possible.

---

# Development Setup

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
npm install
```

Configure environment variables.

```bash
cp .env.example .env
```

Start required services.

```bash
docker compose up -d
```

Run the development servers.

```bash
npm run dev
```

Verify that:

- API starts successfully
- Frontend loads
- Redis is running
- PostgreSQL is running
- Workers connect successfully

---

# Project Structure

The repository follows a modular architecture.

```text
apps/
    api/
    web/

packages/
    detectors/
    intelligence/
    shared/

docs/

docker/

scripts/
```

Each package has a clearly defined responsibility.

Avoid introducing unnecessary coupling between packages.

---

# Coding Standards

Please follow the existing coding style.

General expectations include:

- TypeScript first
- meaningful variable names
- reusable functions
- modular architecture
- descriptive comments when necessary
- avoid duplicated logic

Code should prioritise readability over cleverness.

---

# Engineering Principles

When implementing new functionality, contributors should preserve the architectural principles of ArcHive.

## Explainability

Engineering conclusions should always be explainable.

---

## Modularity

Keep responsibilities isolated.

Large files should be avoided where practical.

---

## Backend Intelligence

Engineering decisions belong on the backend.

Avoid moving intelligence logic into the frontend.

---

## Purpose Before Implementation

Repository purpose should always take precedence over implementation technologies.

---

## Stable Contracts

Avoid introducing breaking API changes unless absolutely necessary.

---

# Adding New Repository Types

Adding support for a new engineering domain generally involves:

1. Create a detector.
2. Register the detector.
3. Define engineering terminology.
4. Assign repository evidence.
5. Configure repository ranking.
6. Add frontend display labels if required.
7. Add tests.

Repository classification should remain deterministic and explainable.

---

# Pull Requests

Before opening a pull request, please ensure that:

- the project builds successfully
- tests pass
- documentation is updated
- new functionality is documented
- unnecessary files have been removed

A good pull request should focus on a single logical change.

Large unrelated changes should be split into separate pull requests.

---

# Commit Messages

Use descriptive commit messages.

Good examples:

```text
feat: add repository similarity engine

fix: improve engineering intelligence ranking

docs: expand architecture documentation

refactor: simplify detector registration

test: improve repository classification coverage
```

Avoid generic messages such as:

```text
update

changes

fix stuff

misc
```

---

# Documentation Requirements

Significant engineering features should include documentation updates where appropriate.

This may involve updating:

- README
- Architecture Guide
- Intelligence Engine
- Classification Engine
- API Reference
- Roadmap

Keeping documentation aligned with implementation is a project expectation rather than an optional task.

---

# Testing

All new engineering functionality should be tested where practical.

Typical areas include:

- detector behaviour
- repository classification
- API endpoints
- engineering assessment
- recommendation generation

Tests should verify behaviour rather than implementation details.

---

# Code Reviews

Every contribution is reviewed with attention to:

- correctness
- maintainability
- architecture
- readability
- performance
- consistency

Feedback is intended to improve the project and should be viewed as part of the collaborative engineering process.

---

# Community Guidelines

Please be respectful and constructive when interacting with other contributors.

We encourage:

- thoughtful discussions
- respectful disagreement
- knowledge sharing
- collaborative problem solving

Everyone contributing to ArcHive should feel welcome regardless of experience level.

---

# Recognition

Every accepted contribution helps improve the Engineering Intelligence Platform.

Whether your contribution is a documentation improvement, bug fix, architectural enhancement or intelligence engine, your effort is valued and appreciated.

Thank you for helping make ArcHive a better platform for the engineering community.