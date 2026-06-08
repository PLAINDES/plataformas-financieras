# Frontend Documentation - Plataformas Financieras

## Overview

This project is the frontend application for the Plataformas Financieras ecosystem. It follows a **Feature-Sliced Design** architecture to separate business logic and scale modularly, ensuring maintainability and clean code practices.

## Architecture & Tech Stack

### Main Technologies

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Rich Text / Editors:** Tiptap
- **UI Components:** Radix UI / shadcn/ui

### Directory Structure

- `src/features/`: Core business logic grouped by module. Each feature encapsulates:
  - `api/`: Service calls and endpoints fetching.
  - `components/`: Feature-specific UI components.
  - `hooks/`: Custom state and logic.
  - `types/`: Local TypeScript definitions.
- `src/shared/`: Reusable, cross-feature logic:
  - `components/`: Atomic UI components (e.g., buttons, inputs).
  - `services/`: Backend communication logic (CMS, Auth).
  - `utils/`: Helpers and data transformation functions.

---

## Project Features

The frontend is organized into independent modules inside `src/features/`.

### 1. `auth/` (Authentication)

Identity and security manager for the application.

- **Purpose:** Centralizes login, registration, session persistence, and access control via `ProtectedRoute`.
- **Key Components:** `LoginModal`, `RegisterModal`, and `AuthContext` for global user state.

### 2. `admin/` (Administration Panel)

Centralized dashboard for operational management of content and master data.

- **Purpose:** Allows administrators to manage users, update master tables (financial indicators, risk rates, etc.), and manage templates, reports, and covers.
- **Utilities:** Contains Excel parsers and PDF generators for management reports.

### 3. `finance/` (Financial Module)

The core module focused on financial calculation and visualization.

- **Kapital:** Advanced financial analysis engine. Handles complex forms, real-time calculations, results visualization, and specific report generation.
- **Valora:** Company valuation module. Includes template upload panels, financial statement analysis, and valuation methodologies.
- **Chatbot:** Integrated support interface ("Boa") that assists the user through financial workflows.

### 4. `landing/` (Main Landing Page)

Commercial showcase managed via a Headless CMS.

- **Purpose:** Visual presentation of the platform. Designed to be self-manageable; most sections (Hero, Clients, Team, WhatsApp) are editable from the admin panel.
- **Editable Components:** Uses the `EditableContent` pattern to allow dynamic changes to text, images, and collections without touching the codebase.

---

## Development Guide

### Environment Setup

Make sure you have [Bun](https://bun.sh/) installed.

1. Clone the repository.
2. Run `bun install` to install dependencies.
3. Create your `.env.local` based on the required environment variables (e.g., `VITE_API_URL`).

### Commands

| Command             | Description                                         |
| :------------------ | :-------------------------------------------------- |
| `bun run dev`       | Starts the Vite development server.                 |
| `bun run build`     | Validates types and bundles the app for production. |
| `bun run typecheck` | Runs strict TypeScript validation.                  |
| `bun run lint`      | Runs ESLint to check code quality.                  |

### Code Formatting & Standards

- **Formatting:** The project uses **Prettier**. Please ensure your IDE uses the provided `.prettierrc` file to format documents automatically on save.
- **Commits:** We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:
  - `feat:` (New feature)
  - `fix:` (Bug fix)
  - `refactor:` (Code change that neither fixes a bug nor adds a feature)
  - `chore:` (Maintenance, dependency updates)

### Development Conventions

- **Architecture:** Every feature must be autonomous. If a new functionality is required (e.g., "Consulting"), replicate the structure: `api/`, `components/`, `hooks/`, and `types/`.
- **Security:** Components with CMS editing capabilities must validate the session via `useAuthContext()` to verify the `isAdmin` role before rendering any editing controls.

---

## Docker Setup & Deployment Guide

The frontend is fully containerized and uses Docker Compose for different environments. Multi-stage builds are used to optimize production images.

### 1. Local Development

Runs the application with hot-module replacement (HMR) exposed on port `5173`. Volumes are mounted so local changes reflect instantly.
**Prerequisite:** Create a `.env.local` file.

```bash
docker compose -f compose.yaml -f compose.override.yaml --env-file .env.local up --build
```

### 2. Main/Dev Branch Deployment

Its the same as local development but with production environment variables. Make sure to create a `.env.prod` file with the correct settings.

```bash
# Change the compose file for dev or prod as needed
docker compose -f compose.yaml -f compose.prod.yaml up -d
```
