---
name: codebase-audit
description: >-
  Audits the NestJS + PostgreSQL + TypeORM codebase against all enterprise criteria:
  database modeling, migrations, user & admin authentication, user profile RESTful APIs,
  system gifts catalog for users, admin gift management CRUD, MVC architecture, and strict ESLint rules.
  Evaluates each criterion, calculates a total score (out of 100), and exports AUDIT_REPORT.md.
---

# Codebase Quality & Architecture Audit Skill

Use this skill when you need to evaluate, audit, and score a NestJS backend codebase against enterprise architectural requirements and strict code validation rules.

---

## Evaluation Criteria & Scoring Rubric (Total: 100 Points)

| Category | Evaluation Criteria | Max Points | Verification Method |
| :--- | :--- | :---: | :--- |
| **1. Database & ORM** | PostgreSQL + TypeORM configuration, UUID entities (`User`, `Gift`), column decorators, enums, indexes | 15 pts | Check `src/config/database.config.ts`, `src/database/data-source.ts`, `src/modules/*/entities/*.entity.ts` |
| **2. Migrations** | TypeORM migration setup with both `up()` and `down()` implementing complete DDL & rollbacks | 15 pts | Check `src/database/migrations/*` and verify `MigrationInterface` |
| **3. Authentication & RBAC** | User Login (`POST /api/v1/auth/user/login`), Admin Login (`POST /api/v1/auth/admin/login`), bcrypt hashing, JWT strategy, `JwtAuthGuard`, `RolesGuard` | 20 pts | Check `src/modules/auth/*`, `src/common/guards/*`, test endpoints |
| **4. User Profile** | RESTful User Profile module: View profile (`GET /api/v1/profile`), Update profile (`PATCH /api/v1/profile`), Change password (`PUT /api/v1/profile/change-password`) | 15 pts | Check `src/modules/profile/*`, verify JWT token injection via `@CurrentUser()` |
| **5. User Gifts Catalog** | RESTful API for users to browse active gifts with pagination, search, and min/max points filters (`GET /api/v1/gifts`, `GET /api/v1/gifts/:id`) | 10 pts | Check `src/modules/gifts/gifts.controller.ts` and `gifts.service.ts` |
| **6. Admin Gift Management** | Full CRUD for administrators: Create, Read, Update, Delete gifts (`/api/v1/admin/gifts`), protected by `@Roles(UserRole.ADMIN)` and `RolesGuard` | 10 pts | Check `src/modules/gifts/admin-gifts.controller.ts` |
| **7. Architecture & REST Standards** | Strict NestJS layered MVC architecture: DTOs, `ValidationPipe` (whitelist + transform), `HttpExceptionFilter`, `TransformInterceptor`, Swagger docs at `/api/docs` | 10 pts | Check `src/main.ts`, `src/common/filters/*`, `src/common/interceptors/*` |
| **8. ESLint & Prettier Rules** | Direct ESLint rules in config (`naming-convention`, `explicit-function-return-type`, `no-explicit-any`, strict typing), Prettier formatting, 0 errors | 5 pts | Execute `npx eslint "src/**/*.ts"` and verify zero errors/warnings |

---

## Step-by-Step Execution Workflow for AI Agent

When an AI agent is tasked with running an audit of this codebase, execute the following steps:

### Step 1: Run the Automated Audit Engine
Execute the built-in audit script from the terminal:
```bash
npm run audit
```
This script checks the source code AST/tokens, verifies the presence of required endpoints, decorators, DTOs, and runs ESLint.

### Step 2: Run ESLint Quality Check & Export Reports
Generate the ESLint inspection reports:
```bash
# Generate interactive HTML report
npm run lint:report

# Generate machine-readable JSON report
npm run lint:report:json
```
Verify that `eslint-report.html` and `eslint-report.json` are created in the root directory.

### Step 3: Verify Database Migrations
Check the migration status against PostgreSQL:
```bash
npm run migration:show
```
Ensure that `InitialSchema1740000000000` is present.

### Step 4: Validate Generated Scorecard in AUDIT_REPORT.md
Read the generated `AUDIT_REPORT.md` file:
- Confirm that the total score is calculated out of 100.
- Verify that each criteria has specific evidence notes attached.
- Present the final scorecard and summary to the user.

---

## Scoring Standards & Grade Matrix

- **95 – 100 pts**: Grade **A+ (Excellent)** — Codebase fully conforms to all enterprise standards, zero lint errors, complete test coverage and proper migrations.
- **85 – 94 pts**: Grade **A (Very Good)** — Minor non-critical improvements possible.
- **75 – 84 pts**: Grade **B (Good)** — Missing minor validations or secondary endpoints.
- **60 – 74 pts**: Grade **C (Satisfactory)** — Basic functionality works, but architectural or typing rules have violations.
- **< 60 pts**: Grade **F (Needs Rework)** — Core requirements incomplete.
