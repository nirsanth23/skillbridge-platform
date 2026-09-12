# SkillBridge Continuous Integration & Deployment (CI/CD) Architecture

**Document Version:** 1.0  
**Project:** SkillBridge – Smart Freelance & Mentorship Platform  
**CI Tooling:** GitHub Actions  
**Date:** September 2026  

---

## 1. Purpose & Continuous Integration Philosophy

For the SkillBridge project, **Continuous Integration (CI)** is the automated engineering practice of testing, linting, building, and validating codebase integrity on every commit and pull request before changes are integrated into shared branches (`develop`, `main`).

### Key CI Objectives:
1. **Prevent Regressions**: Ensure that every proposed change builds cleanly without breaking dependencies or syntax.
2. **Standardize Code Quality**: Enforce consistent linting and coding conventions across frontend and backend modules.
3. **Validate Stateless Portability**: Guarantee the application starts cleanly in an isolated environment without relying on local machine side-effects or hardcoded secrets.
4. **Accelerate Feedback**: Give contributors rapid, deterministic feedback on code health prior to peer review.

---

## 2. GitHub Actions CI Workflow Specification

The automated pipeline is defined in [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) and executes two parallel, independent matrix jobs on `ubuntu-latest`.

### 2.1 Workflow Triggers
* **Direct Pushes**:
  * `main` (Production release branch)
  * `develop` (Integration / active development branch)
* **Pull Requests**:
  * Targeting `main`
  * Targeting `develop`

---

### 2.2 Frontend CI Job (`frontend-ci`)
* **Environment:** `ubuntu-latest` with Node.js `20.x` LTS.
* **Working Directory:** `/frontend`
* **Execution Steps:**
  1. **Checkout Repository**: Clones target commit via `actions/checkout@v4`.
  2. **Dependency Cache & Install**: Uses `actions/setup-node@v4` with `npm` caching bound to `frontend/package-lock.json`, followed by deterministic `npm ci`.
  3. **Static Analysis & Linting**: Runs `npm run lint --if-present` (executing `oxlint` against React JSX components and services).
  4. **Production Build**: Executes `npm run build` (`vite build`) to verify bundle compilation, tree shaking, and zero syntax errors.

---

### 2.3 Backend CI Job (`backend-ci`)
* **Environment:** `ubuntu-latest` with Node.js `20.x` LTS.
* **Working Directory:** `/backend`
* **Execution Steps:**
  1. **Checkout Repository**: Clones target commit via `actions/checkout@v4`.
  2. **Dependency Cache & Install**: Uses `actions/setup-node@v4` with `npm` caching bound to `backend/package-lock.json`, followed by deterministic `npm ci`.
  3. **Static Analysis & Linting**: Runs `npm run lint --if-present`.
  4. **Automated Unit/Integration Tests**: Executes `npm test --if-present` (executed automatically as test suites are integrated in future phases).
  5. **Server Startup & Health Check Validation**:
     * Launches `node src/server.js` in background using test environment parameters (`PORT=5001`, `NODE_ENV=test`, `CLIENT_URL=http://localhost:5173`).
     * Verifies that the Express application initializes, registers middleware, and returns HTTP 200 from `/api/health`.
     * Gracefully terminates server process.
     * **Note:** Does not require live MongoDB Atlas connections or production secrets during CI execution.

---

## 3. Git Branching & Pull Request Workflow

SkillBridge follows a structured Git flow strategy ensuring all production code passes rigorous automated checks and peer reviews.

### Branch Strategy:
* `main`: Protected production branch. Represents deployable, verified release software.
* `develop`: Integration branch where completed features are merged and tested together.
* `feature/<feature-name>`: Topic branches branched off `develop` for specific modules (e.g., `feature/auth-jwt`, `feature/project-marketplace`).
* `bugfix/<fix-name>` / `hotfix/<fix-name>`: Targeted remediation branches.

### Future CI/CD Progression:

```text
feature/*
    ↓
Pull Request → develop
    ↓
CI (Automated Checks & Build Verification)
    ↓
Merge → develop
    ↓
Staging deployment (future)
    ↓
Staging Validation & Smoke Tests
    ↓
Pull Request → main
    ↓
CI (Full Automated Verification)
    ↓
Production deployment (future)
```

---

## 4. Security & Secret Management

* **No Hardcoded Secrets**: Secrets such as `MONGODB_URI`, `JWT_SECRET`, and external API keys are never stored in source control or workflow configuration files.
* **Environment Files Ignored**: `.env` and `.env.*` remain strictly listed in `.gitignore` (with exception for `.env.example` templates).
* **CI Environment Isolation**: CI jobs rely exclusively on mock/test environment variables supplied via GitHub Actions `env` blocks.

---

## 5. Future Continuous Deployment (CD) Roadmap

*(To be implemented in subsequent phases — not active currently)*

1. **Automated Testing Suite (Phase 10)**:
   * Frontend: Jest / React Testing Library for component rendering and user interaction flows.
   * Backend: Supertest / Jest for API endpoint testing with in-memory MongoDB (`mongodb-memory-server`).
2. **Staging Continuous Deployment (CD)**:
   * Trigger: Merge into `develop`.
   * Target: Staging server (e.g., Render / Railway / Vercel preview).
   * Automated smoke tests verifying database connectivity and WebSocket handshake.
3. **Production Continuous Deployment (CD)**:
   * Trigger: Tagged release or merge into `main`.
   * Target: Production cloud infrastructure (Vercel for Frontend, Render/AWS for Backend, MongoDB Atlas).
