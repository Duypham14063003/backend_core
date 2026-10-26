---
name: backend-review-nestjs
description: Review and audit a NestJS + PostgreSQL + TypeORM backend codebase objectively against 44 enterprise criteria across 9 standard architectural categories. Produces an objective, unvarnished audit report (INDEPENDENT_REPORT.md) with exact status (Đạt / Chưa đạt / N/A), file citations, and code evidence.
---

# Skill: Backend Review NestJS (Objective Codebase Audit)

This skill performs an objective, multi-tier code audit for NestJS backend applications. It evaluates the source code across **44 standardized enterprise criteria** divided into 9 architectural categories, identical to the standard review rubric used by Technical Leads.

## Evaluation Methodology (3 Tiers)

1. **AST & Syntax Analysis (TypeScript Compiler API)**:
   - Traverses Abstract Syntax Trees (AST) to verify decorators, class hierarchies, method signatures, exception throwing (`BadRequestException` vs `UnauthorizedException`), and redundant statements.
2. **Static & Linter Verification**:
   - Executes ESLint rules and verifies naming conventions, explicit return types, strict typing (`no-explicit-any`), and clean code policies (`no-console`).
3. **Runtime & Behavioral Verification**:
   - Asserts HTTP response status codes, payload structures, pagination metadata, and role-based access control (RBAC).

---

## 44 Standard Assessment Criteria (9 Categories)

### 1. Database & TypeORM (1.1 - 1.8)
- `1.1` DB PostgreSQL: Configured via environment variables (host, port, user, db, password, pool).
- `1.2` TypeORM: `forRootAsync` at root level, `forFeature` within domain modules.
- `1.3` Synchronize policy: `synchronize: false` in production/migration mode.
- `1.4` Migrations: Migration files present with matching `up()` and `down()` methods, CLI scripts configured.
- `1.5` Entity-Migration alignment: Tables, column names (snake_case), UUIDs, types, and timestamps match.
- `1.6` Seed data integrity: Uses valid role enums, bcrypt hashed passwords, and inactive test records.
- `1.7` Pagination metadata: `total` count via `getManyAndCount()`, `totalPages` calculated correctly.
- `1.8` Query optimization (N+1): Proper relations/join usage when relationships exist.

### 2. Business Features (2.1 - 2.5)
- `2.1` User authentication: Login endpoint with email/password verification and JWT issuance.
- `2.2` Admin authentication: Separate admin login endpoint enforcing `ADMIN` role.
- `2.3` User profile: View, update profile, and change password with old password verification.
- `2.4` Public gift catalog: Active gifts only (`isActive = true`), pagination, search, and detail view.
- `2.5` Admin gift management: Full CRUD (POST, GET, PUT, DELETE) protected by `RolesGuard` and `@Roles(ADMIN)`.

### 3. NestJS Architecture Standards (3.1 - 3.6)
- `3.1` JwtModule: Configured with secret and validated expiration time.
- `3.2` ConfigModule: Initialized as `isGlobal: true` for centralized config.
- `3.3` Global ValidationPipe: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
- `3.4` Modular architecture: Feature controllers declared in feature modules, not cluttered in `AppModule`.
- `3.5` Dependency Injection: Clean constructor injection for Repositories, Services, and Config.
- `3.6` Exception handling: Standard `HttpException` subclasses used instead of generic errors.

### 4. RESTful & HTTP Specifications (4.1 - 4.6)
- `4.1` Resource creation route: `POST /resources` (no RPC verbs like `/resources/create`).
- `4.2` HTTP Status Codes: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `204 No Content` for DELETE.
- `4.3` Creation response: Returns created resource entity with ID.
- `4.4` Empty collections: Returns HTTP 200 with empty array (`[]`), not 404.
- `4.5` Route parameters: Validated with `ParseUUIDPipe` or `ParseIntPipe`.
- `4.6` Invalid login credentials: Returns **HTTP 400 Bad Request** (`BadRequestException`). HTTP 401 is strictly reserved for missing/invalid bearer tokens.

### 5. MVC & Layered Structure (5.1 - 5.4)
- `5.1` Thin Controllers: Controllers only delegate to Services, no database logic.
- `5.2` Dedicated Entities: Database models reside in `entities/` folders.
- `5.3` Request/Response DTOs: DTOs separate input validation (`class-validator`) from output formatting.
- `5.4` Formatted Responses: Transformed via DTOs/Interceptors, never leaking raw entities.

### 6. Logic & Security (6.1 - 6.5)
- `6.1` Password security: Hashed via bcrypt (salt rounds $\ge$ 10), excluded from queries (`select: false`).
- `6.2` Token expiration: `JWT_EXPIRES_IN` parsed and validated (positive number or valid unit).
- `6.3` Upload paths: No double-prefix pathing.
- `6.4` File deletion: Handles leading slash safely.
- `6.5` Anti-enumeration: Uniform error messages for non-existent users and bad passwords.

### 7. Naming Conventions (7.1 - 7.4)
- `7.1` Classes & Types: PascalCase (`UserEntity`, `CreateGiftDto`).
- `7.2` Methods & Variables: camelCase (`findGiftsForUser`, `accessToken`).
- `7.3` File naming: kebab-case (`jwt-auth.guard.ts`, `database.config.ts`).
- `7.4` Spelling: Zero typographical errors in symbol and file names.

### 8. Format & Tooling (8.1 - 8.3)
- `8.1` ESLint & Prettier: Configured with automated lint/format scripts.
- `8.2` Clean logging: Zero `console.log` in production code; uses NestJS `Logger`.
- `8.3` Imports: Consistent relative or alias paths.

### 9. Code Cleanliness & Logic (9.1 - 9.3)
- `9.1` Zero redundant queries: No dead code or double-fetching (e.g. single query in `changePassword`).
- `9.2` Zero magic strings: Centralized constants/enums for error and success messages.
- `9.3` Async/await consistency: Every asynchronous call is awaited.

---

## Output Report Format

The audit produces `INDEPENDENT_REPORT.md` with:
1. Executive Verdict (Total: X Passed / Y Failed / Z N/A).
2. Clean 9-category markdown tables with exact notes and file references.
3. List of Caveats & Recommendations for Production Readiness.
