# Rabbit Hole

A knowledge-reader application for exploring, annotating, and sharing articles with an epistemic confidence model.

## Project Overview

Rabbit Hole is a monorepo knowledge-reader that lets users read articles, track claims with structured confidence levels, and share insights. The app is built around an epistemic model that labels each claim with a confidence tier and a support type so readers always know how certain the information is.

## Architecture Summary

```
apps/
  api/          — Backend API server
  mobile/       — React Native / Expo mobile reader

packages/
  contracts/    — Shared TypeScript types and interfaces

docs/
  system-architecture-v1.md — Canonical platform architecture (authoritative reference)
  epistemic-model.md        — Confidence + support model reference
  experience-layer-v1.md    — ArticleExperience and ExperienceSteps design
  share-surface-v1.md       — Native share surface implementation notes
```

### Core Layers

1. **Article Assembly** — identification → summary → context/content → evidence/trace → questions
2. **Epistemic Model** — structured confidence and support labels on every claim
3. **Experience Layer v1** — `ArticleExperience` with `ExperienceSteps`; Reader toggle (Read / Follow)
4. **Share Surface v1** — Native share sheet with title, summary, and URL

## Project Structure

```
Rabbit_Hole/
├── apps/
│   ├── api/              # API backend
│   └── mobile/           # Mobile reader (React Native / Expo)
├── packages/
│   └── contracts/        # Shared contracts (types, interfaces, schemas)
├── docs/
│   ├── system-architecture-v1.md  # Canonical platform architecture (authoritative reference)
│   ├── epistemic-model.md
│   ├── experience-layer-v1.md
│   └── share-surface-v1.md
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Setup Instructions

### Prerequisites

| Tool | Minimum version |
|------|-----------------|
| Node.js | 18 LTS |
| npm / yarn / pnpm | latest |
| Expo CLI | latest |
| Python (API only) | 3.11+ |

### 1. Clone the repository

```bash
git clone https://github.com/Swixixle/Rabbit_Hole.git
cd Rabbit_Hole
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in the required values
```

### 3. Install dependencies

```bash
# Install all workspace dependencies (from repo root)
npm install
```

## Running the API

```bash
cd apps/api
npm run dev
```

The API will start on `http://localhost:3000` by default (override with `API_PORT` in `.env`).

## Running the Mobile App

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with the Expo Go app, or press `i` / `a` to open in an iOS or Android simulator.

## Running Tests

```bash
# All packages
npm test

# API only
cd apps/api && npm test

# Mobile only
cd apps/mobile && npm test

# Contracts only
cd packages/contracts && npm test
```

## How Articles and Claims Work

Articles flow through the **assembly pipeline**:

| Stage | Description |
|-------|-------------|
| Identification | Source metadata, title, author, date |
| Summary | Short human-readable synopsis |
| Context / Content | Full article body with structured sections |
| Evidence / Trace | Citations, references, and provenance |
| Questions | Follow-up questions generated from the article |

Each article contains one or more **Claims**. Every claim is annotated with two epistemic properties (see below).

## Epistemic Model

Each claim carries two labels.

### Confidence

| Level | Meaning |
|-------|---------|
| `high` | Well-established; replicated evidence |
| `medium` | Supported but not definitive |
| `low` | Speculative or early-stage |

### Support Type

| Type | Meaning |
|------|---------|
| `direct` | Evidence directly demonstrates the claim |
| `inference` | Claim is logically inferred from evidence |
| `interpretation` | Claim is one reading of ambiguous evidence |
| `speculation` | Claim is an informed guess with limited evidence |

See [`docs/epistemic-model.md`](docs/epistemic-model.md) for the full specification.

## License

[MIT](LICENSE)
