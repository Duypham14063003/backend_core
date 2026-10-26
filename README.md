# Backend Core - NestJS + PostgreSQL + TypeORM

Enterprise-grade NestJS RESTful API platform built with PostgreSQL, TypeORM, Role-Based Access Control (RBAC), User Profile management, System Gifts catalog, and Admin Gift CRUD operations. Conforms to MVC architecture, strict ESLint rules, and automated audit scoring.

---

## 🌟 Features Overview

- **Database & ORM**: PostgreSQL integration via TypeORM DataSource with UUID primary keys and index optimization.
- **TypeORM Migrations**: Automated migration scripts with complete DDL (`up`) and rollback (`down`) operations.
- **Authentication**:
  - **User Login & Register**: JWT token issuance with password hashing via `bcrypt`.
  - **Admin Login**: Enforces administrator privileges with custom `RolesGuard` and `@Roles(UserRole.ADMIN)`.
- **User Profile Module**:
  - View authenticated profile (`GET /api/v1/profile`)
  - Update user profile (`PATCH /api/v1/profile`)
  - Securely change password with verification (`PUT /api/v1/profile/change-password`)
- **System Gifts Catalog (User)**:
  - Browse available active gifts with search, pagination, and point filters (`GET /api/v1/gifts`)
  - View single gift detail (`GET /api/v1/gifts/:id`)
- **System Gifts Management (Admin)**:
  - Full CRUD management endpoints protected by Admin role (`/api/v1/admin/gifts`)
- **Architectural Standards**:
  - Standard Layered MVC Architecture (Controller -> Service -> Repository/Entity)
  - Global `ValidationPipe` with whitelist and automatic type transformation
  - Global `HttpExceptionFilter` for uniform REST error responses
  - Global `TransformInterceptor` for standard API response envelopes (`{ success, statusCode, message, data, timestamp }`)
  - Swagger OpenAPI interactive documentation at `/api/docs`
- **Code Quality**:
  - Strict direct ESLint rules (naming conventions, explicit return types, disallow any, promise safety)
  - Prettier formatting
  - Interactive HTML report and JSON report generation
  - Built-in AI Skill for codebase audit & scoring (`100/100 A+`)

---

## 🚀 Quick Start

### 1. Environment Setup

Ensure PostgreSQL is running and configure `.env`:
```env
PORT=3000
NODE_ENV=development

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=backendcore_db
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT Security
JWT_SECRET=super-secret-jwt-key-for-backendcore-system-2026
JWT_EXPIRES_IN=86400s
```

### 2. Run Database Migrations & Seed Data

```bash
# Execute TypeORM migrations
npm run migration:run

# Seed initial Admin & User accounts along with sample gifts
npm run seed
```

Default seeded credentials:
- **Admin**: `admin@example.com` / `Admin123@` (Role: `ADMIN`)
- **User**: `user@example.com` / `User123@` (Role: `USER`)

### 3. Start Application

```bash
# Development mode
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```

API Documentation (Swagger UI) is available at:  
👉 **http://localhost:3000/api/docs**

---

## 📡 RESTful API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/user/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/user/login` | Login user & retrieve JWT token | Public |
| `POST` | `/api/v1/auth/admin/login` | Login administrator (Requires ADMIN role) | Public |

### 👤 User Profile (`/api/v1/profile`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/profile` | Get current user's profile | Bearer JWT |
| `PATCH` | `/api/v1/profile` | Update profile (fullName, avatar, phone) | Bearer JWT |
| `PUT` | `/api/v1/profile/change-password` | Change user password | Bearer JWT |

### 🎁 System Gifts Catalog for User (`/api/v1/gifts`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/gifts` | Browse active gifts (Pagination & Search) | Bearer JWT |
| `GET` | `/api/v1/gifts/:id` | View details of a specific gift | Bearer JWT |

### 🛠️ Admin Gifts Management (`/api/v1/admin/gifts`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/admin/gifts` | Create a new gift | Admin JWT |
| `GET` | `/api/v1/admin/gifts` | List all system gifts (Active & Inactive) | Admin JWT |
| `GET` | `/api/v1/admin/gifts/:id` | Get gift details for admin | Admin JWT |
| `PUT` | `/api/v1/admin/gifts/:id` | Update gift details | Admin JWT |
| `DELETE` | `/api/v1/admin/gifts/:id` | Delete gift from system | Admin JWT |

---

## 🔍 ESLint Rules & Reporting

### Direct Rules in `eslint.config.mjs`
- `@typescript-eslint/naming-convention`: Strict camelCase for methods, PascalCase for classes & types, UPPER_CASE for constants.
- `@typescript-eslint/explicit-function-return-type`: Enforces explicit return types on all functions/methods.
- `@typescript-eslint/explicit-module-boundary-types`: Enforces explicit boundary types on exports.
- `@typescript-eslint/no-explicit-any`: Strictly prohibits the `any` type (`error`).
- `@typescript-eslint/no-floating-promises`: Forbids unhandled promises.
- `prettier/prettier`: Automatic code formatting enforcement.

### Lệnh chạy kiểm tra ESLint & Xuất Báo Cáo:

```bash
# 1. Kiểm tra toàn bộ source code
npm run lint:check

# 2. Tự động sửa lỗi format & cú pháp
npm run lint

# 3. Xuất báo cáo trực quan dưới dạng HTML
npm run lint:report
# => Tạo file eslint-report.html (có thể mở trực tiếp bằng trình duyệt)

# 4. Xuất báo cáo cấu trúc JSON
npm run lint:report:json
# => Tạo file eslint-report.json
```

---

## 🤖 Skill AI Kiểm Tra Code Base & Xuất Report

Skill AI được đặt tại thư mục:  
👉 [`.agents/skills/codebase-audit/SKILL.md`](.agents/skills/codebase-audit/SKILL.md)

### Cách chạy kiểm tra & xuất bảng chấm điểm:
```bash
npm run audit
```

Lệnh này sẽ tự động:
1. Thẩm định 8 danh mục tiêu chí theo yêu cầu kỹ thuật.
2. Kiểm tra tính hợp lệ của TypeORM Entity, DDL Migration, Auth, Profile, Gifts, Guards, Interceptors.
3. Chạy ESLint để xác nhận 0 lỗi.
4. Chấm điểm theo thang điểm 100 và phân loại xếp hạng.
5. Xuất báo cáo chi tiết ra file **[`AUDIT_REPORT.md`](AUDIT_REPORT.md)**.

### Kết quả thẩm định Scorecard hiện tại:
```
========================================================================
           🏆 BACKEND CORE CODEBASE AUDIT SCORECARD                     
========================================================================
[✓] PostgreSQL + TypeORM Entity Modeling                       : 15/15 pts
[✓] TypeORM Migration Scripts & Up/Down Implementation         : 15/15 pts
[✓] User & Admin Authentication with JWT & Role Guards         : 20/20 pts
[✓] RESTful API User Profile (View, Update, Change Password)   : 15/15 pts
[✓] RESTful API User Gifts Catalog (Browse & View Active Gifts) : 10/10 pts
[✓] RESTful API Admin Gift Management (CRUD + Admin Protection) : 10/10 pts
[✓] NestJS Layered MVC Architecture, DTOs, Pipes & Filters     : 10/10 pts
[✓] ESLint Rules Enforcement & Prettier Configuration          : 5/5 pts
------------------------------------------------------------------------
TOTAL SCORE : 100 / 100 pts (A+ (Excellent))
========================================================================
```
# backend_core
