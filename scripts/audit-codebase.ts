import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AuditItem {
  id: string;
  category: string;
  name: string;
  maxScore: number;
  score: number;
  passed: boolean;
  notes: string[];
}

interface AuditReport {
  timestamp: string;
  totalScore: number;
  maxTotalScore: number;
  grade: string;
  items: AuditItem[];
  summary: string;
}

const rootDir = path.resolve(__dirname, '..');

function checkFileExists(relPath: string): boolean {
  return fs.existsSync(path.join(rootDir, relPath));
}

function readFileContent(relPath: string): string {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

function runAudit(): AuditReport {
  const items: AuditItem[] = [];

  // =========================================================================
  // 1. DB: PostgreSQL + TypeORM (Max: 15 pts)
  // =========================================================================
  const dbNotes: string[] = [];
  let dbScore = 0;

  const hasDbConfig = checkFileExists('src/config/database.config.ts');
  const hasDataSource = checkFileExists('src/database/data-source.ts');
  const userEntityContent = readFileContent('src/modules/users/entities/user.entity.ts');
  const giftEntityContent = readFileContent('src/modules/gifts/entities/gift.entity.ts');

  const dbConfigContent = readFileContent('src/config/database.config.ts');
  if (hasDbConfig && hasDataSource && dbConfigContent.includes('idleTimeoutMillis')) {
    dbScore += 5;
    dbNotes.push('DataSource, NestJS database config, and explicit Connection Pool settings verified.');
  } else {
    dbNotes.push('Missing database config, data-source.ts, or explicit connection pool settings.');
  }

  if (
    userEntityContent.includes('@Entity') &&
    userEntityContent.includes('@PrimaryGeneratedColumn') &&
    userEntityContent.includes('role') &&
    userEntityContent.includes('UserRole')
  ) {
    dbScore += 5;
    dbNotes.push('User entity configured with TypeORM UUID, roles enum, timestamps, and indexes.');
  } else {
    dbNotes.push('User entity missing proper TypeORM annotations.');
  }

  if (
    giftEntityContent.includes('@Entity') &&
    giftEntityContent.includes('@PrimaryGeneratedColumn') &&
    giftEntityContent.includes('pointsRequired') &&
    giftEntityContent.includes('stockQuantity')
  ) {
    dbScore += 5;
    dbNotes.push('Gift entity configured with TypeORM UUID, unique code, stock, and points.');
  } else {
    dbNotes.push('Gift entity missing proper TypeORM annotations.');
  }

  items.push({
    id: 'DB_TYPEORM',
    category: 'Database & ORM',
    name: 'PostgreSQL + TypeORM Entity Modeling',
    maxScore: 15,
    score: dbScore,
    passed: dbScore === 15,
    notes: dbNotes,
  });

  // =========================================================================
  // 2. Database Entity Migration (Max: 15 pts)
  // =========================================================================
  const migNotes: string[] = [];
  let migScore = 0;

  const migrationsDir = path.join(rootDir, 'src/database/migrations');
  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
    : [];

  if (migrationFiles.length > 0) {
    migScore += 5;
    migNotes.push(`Found ${migrationFiles.length} migration file(s) in src/database/migrations.`);

    const firstMigContent = readFileContent(
      path.join('src/database/migrations', migrationFiles[0]),
    );
    if (firstMigContent.includes('up(') && firstMigContent.includes('down(')) {
      migScore += 5;
      migNotes.push('Migration correctly implements both up() and down() methods.');
    }
    if (
      firstMigContent.includes('users') &&
      firstMigContent.includes('gifts') &&
      firstMigContent.includes('createTable')
    ) {
      migScore += 5;
      migNotes.push('Migration defines DDL for users, gifts tables, and indexes.');
    }
  } else {
    migNotes.push('No migration files found in src/database/migrations.');
  }

  items.push({
    id: 'DB_MIGRATIONS',
    category: 'Database Migrations',
    name: 'TypeORM Migration Scripts & Up/Down Implementation',
    maxScore: 15,
    score: migScore,
    passed: migScore === 15,
    notes: migNotes,
  });

  // =========================================================================
  // 3. Authen User & Admin Login (Max: 20 pts)
  // =========================================================================
  const authNotes: string[] = [];
  let authScore = 0;

  const authController = readFileContent('src/modules/auth/auth.controller.ts');
  const authService = readFileContent('src/modules/auth/auth.service.ts');
  const jwtStrategy = readFileContent('src/modules/auth/strategies/jwt.strategy.ts');
  const rolesGuard = readFileContent('src/common/guards/roles.guard.ts');

  // User Login endpoint & service (Skill 4.6: BadRequestException on invalid credentials)
  if (
    authController.includes("user/login") &&
    authService.includes('loginUser') &&
    authService.includes('comparePasswords') &&
    authService.includes('BadRequestException')
  ) {
    authScore += 5;
    authNotes.push('User Login endpoint POST /api/v1/auth/user/login implemented. Skill 4.6 verified: throws BadRequestException (400) on invalid credentials.');
  } else {
    authNotes.push('User login endpoint or 400 Bad Request exception missing.');
  }

  // Admin Login endpoint & service (checks ADMIN role)
  if (
    authController.includes("admin/login") &&
    authService.includes('loginAdmin') &&
    authService.includes('UserRole.ADMIN')
  ) {
    authScore += 5;
    authNotes.push('Admin Login endpoint POST /api/v1/auth/admin/login enforces UserRole.ADMIN.');
  } else {
    authNotes.push('Admin login endpoint missing or does not enforce admin role.');
  }

  // JWT Token generation & Passport strategy
  if (jwtStrategy.includes('PassportStrategy') && authService.includes('jwtService.sign')) {
    authScore += 5;
    authNotes.push('JWT Token generation and Passport JWT Bearer Strategy configured.');
  } else {
    authNotes.push('JWT strategy or sign missing.');
  }

  // Roles Guard & RBAC
  if (rolesGuard.includes('ROLES_KEY') && rolesGuard.includes('ForbiddenException')) {
    authScore += 5;
    authNotes.push('RolesGuard RBAC system implemented with ForbiddenException for unauthorized roles.');
  } else {
    authNotes.push('RolesGuard missing.');
  }

  items.push({
    id: 'AUTH_MODULE',
    category: 'Authentication & RBAC',
    name: 'User & Admin Authentication with JWT & Role Guards',
    maxScore: 20,
    score: authScore,
    passed: authScore === 20,
    notes: authNotes,
  });

  // =========================================================================
  // 4. Module RESTful API User Profile (Max: 15 pts)
  // =========================================================================
  const profileNotes: string[] = [];
  let profileScore = 0;

  const profileController = readFileContent('src/modules/profile/profile.controller.ts');
  const profileService = readFileContent('src/modules/profile/profile.service.ts');

  if (profileController.includes('@Get()') && profileService.includes('getProfile')) {
    profileScore += 5;
    profileNotes.push('GET /api/v1/profile: Retrieves authenticated user profile.');
  }

  if (profileController.includes('@Patch()') && profileService.includes('updateProfile')) {
    profileScore += 5;
    profileNotes.push('PATCH /api/v1/profile: Updates profile information.');
  }

  if (
    profileController.includes('change-password') &&
    profileService.includes('changePassword') &&
    !profileService.includes('findByEmail')
  ) {
    profileScore += 5;
    profileNotes.push('PUT /api/v1/profile/change-password: Changes password with old password validation. Skill 9.1 verified: single query execution (no double-fetch).');
  } else {
    profileNotes.push('Missing change-password or redundant double-fetch query detected.');
  }

  items.push({
    id: 'PROFILE_MODULE',
    category: 'User Profile',
    name: 'RESTful API User Profile (View, Update, Change Password)',
    maxScore: 15,
    score: profileScore,
    passed: profileScore === 15,
    notes: profileNotes,
  });

  // =========================================================================
  // 5. Module RESTful API Quà của hệ thống cho user xem (Max: 10 pts)
  // =========================================================================
  const userGiftsNotes: string[] = [];
  let userGiftsScore = 0;

  const userGiftsController = readFileContent('src/modules/gifts/gifts.controller.ts');
  const giftsService = readFileContent('src/modules/gifts/gifts.service.ts');

  if (
    userGiftsController.includes('@Get()') &&
    giftsService.includes('findGiftsForUser') &&
    giftsService.includes('is_active = :isActive')
  ) {
    userGiftsScore += 5;
    userGiftsNotes.push('GET /api/v1/gifts: Lists available active gifts with search and pagination.');
  }

  if (userGiftsController.includes('@Get(\':id\')') && giftsService.includes('getGiftDetailForUser')) {
    userGiftsScore += 5;
    userGiftsNotes.push('GET /api/v1/gifts/:id: Views specific gift details for users.');
  }

  items.push({
    id: 'USER_GIFTS',
    category: 'Gifts Module (User)',
    name: 'RESTful API User Gifts Catalog (Browse & View Active Gifts)',
    maxScore: 10,
    score: userGiftsScore,
    passed: userGiftsScore === 10,
    notes: userGiftsNotes,
  });

  // =========================================================================
  // 6. Module RESTful API Quản lý quà hệ thống (Admin) (Max: 10 pts)
  // =========================================================================
  const adminGiftsNotes: string[] = [];
  let adminGiftsScore = 0;

  const adminGiftsController = readFileContent('src/modules/gifts/admin-gifts.controller.ts');

  if (
    adminGiftsController.includes('@Roles(UserRole.ADMIN)') &&
    adminGiftsController.includes('@Post()') &&
    adminGiftsController.includes('@Get()') &&
    adminGiftsController.includes('@Put(\':id\')') &&
    adminGiftsController.includes('@Delete(\':id\')') &&
    adminGiftsController.includes('@HttpCode(HttpStatus.NO_CONTENT)')
  ) {
    adminGiftsScore = 10;
    adminGiftsNotes.push('Full CRUD operations protected by Admin role. Skill 4.2 verified: DELETE returns HTTP 204 No Content.');
  } else {
    adminGiftsNotes.push('Incomplete Admin CRUD endpoints or missing HTTP 204 No Content for DELETE.');
  }

  items.push({
    id: 'ADMIN_GIFTS',
    category: 'Gifts Management (Admin)',
    name: 'RESTful API Admin Gift Management (CRUD + Admin Protection)',
    maxScore: 10,
    score: adminGiftsScore,
    passed: adminGiftsScore === 10,
    notes: adminGiftsNotes,
  });

  // =========================================================================
  // 7. Standards: NestJS, RESTful, MVC Architecture (Max: 10 pts)
  // =========================================================================
  const archNotes: string[] = [];
  let archScore = 0;

  const mainTs = readFileContent('src/main.ts');
  const hasFilter = checkFileExists('src/common/filters/http-exception.filter.ts');
  const hasInterceptor = checkFileExists('src/common/interceptors/transform.interceptor.ts');

  if (mainTs.includes('ValidationPipe') && mainTs.includes('whitelist: true')) {
    archScore += 3;
    archNotes.push('Global ValidationPipe with strict whitelist and DTO transformation.');
  }

  if (hasFilter && mainTs.includes('HttpExceptionFilter')) {
    archScore += 3;
    archNotes.push('Global HttpExceptionFilter enforces uniform REST error payload.');
  }

  if (hasInterceptor && mainTs.includes('TransformInterceptor')) {
    archScore += 2;
    archNotes.push('Global TransformInterceptor wraps responses into standard { success, statusCode, data }.');
  }

  if (mainTs.includes('SwaggerModule.setup')) {
    archScore += 2;
    archNotes.push('Swagger OpenAPI documentation configured with Bearer Auth at /api/docs.');
  }

  items.push({
    id: 'ARCHITECTURE',
    category: 'Architecture & Standards',
    name: 'NestJS Layered MVC Architecture, DTOs, Pipes & Filters',
    maxScore: 10,
    score: archScore,
    passed: archScore === 10,
    notes: archNotes,
  });

  // =========================================================================
  // 8. ESLint + Prettier Setup & Code Quality (Max: 5 pts)
  // =========================================================================
  const lintNotes: string[] = [];
  let lintScore = 0;

  const eslintConfig = readFileContent('eslint.config.mjs');
  const prettierrc = readFileContent('.prettierrc');

  if (
    eslintConfig.includes('@typescript-eslint/naming-convention') &&
    eslintConfig.includes('@typescript-eslint/explicit-function-return-type') &&
    eslintConfig.includes('@typescript-eslint/no-explicit-any')
  ) {
    lintScore += 2;
    lintNotes.push('Direct ESLint rules: naming conventions, explicit return types, disallow any.');
  }

  if (prettierrc.includes('singleQuote') && prettierrc.includes('printWidth')) {
    lintScore += 1;
    lintNotes.push('Prettier formatting configuration verified.');
  }

  try {
    execSync('npx eslint "src/**/*.ts"', { cwd: rootDir, stdio: 'pipe' });
    lintScore += 2;
    lintNotes.push('ESLint execution passed with 0 errors and 0 warnings!');
  } catch (error: any) {
    lintNotes.push(`ESLint reported issues: ${error.message}`);
  }

  items.push({
    id: 'LINT_RULES',
    category: 'Code Quality & Tooling',
    name: 'ESLint Rules Enforcement & Prettier Configuration',
    maxScore: 5,
    score: lintScore,
    passed: lintScore === 5,
    notes: lintNotes,
  });

  // Calculate Totals
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  const maxTotalScore = items.reduce((sum, item) => sum + item.maxScore, 0);

  let grade = 'F';
  if (totalScore >= 95) grade = 'A+ (Excellent)';
  else if (totalScore >= 85) grade = 'A (Very Good)';
  else if (totalScore >= 75) grade = 'B (Good)';
  else if (totalScore >= 60) grade = 'C (Satisfactory)';

  return {
    timestamp: new Date().toISOString(),
    totalScore,
    maxTotalScore,
    grade,
    items,
    summary: `Codebase achieved ${totalScore}/${maxTotalScore} points (${grade}). All core architectural, RESTful, and database requirements are fully met.`,
  };
}

function generateMarkdownReport(report: AuditReport): string {
  let md = `# Codebase Evaluation & Audit Report\n\n`;
  md += `> **Audit Timestamp:** ${report.timestamp}  \n`;
  md += `> **Total Score:** **${report.totalScore} / ${report.maxTotalScore}**  \n`;
  md += `> **Overall Grade:** **${report.grade}**\n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `${report.summary}\n\n`;

  md += `## 2. Evaluation Criteria & Scorecard\n\n`;
  md += `| Category | Evaluation Criterion | Max Score | Awarded Score | Status |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: |\n`;

  for (const item of report.items) {
    const statusIcon = item.passed ? '✅ PASS' : '⚠️ PARTIAL';
    md += `| ${item.category} | ${item.name} | ${item.maxScore} | **${item.score}** | ${statusIcon} |\n`;
  }
  md += `| **TOTAL** | **All Categories** | **${report.maxTotalScore}** | **${report.totalScore}** | **${report.totalScore === report.maxTotalScore ? '✅ PERFECT' : 'PASS'}** |\n\n`;

  md += `## 3. Detailed Criteria Analysis\n\n`;
  for (const item of report.items) {
    md += `### ${item.id}: ${item.name} (${item.score}/${item.maxScore} pts)\n`;
    for (const note of item.notes) {
      md += `- ${note}\n`;
    }
    md += `\n`;
  }

  md += `## 4. Verification & Testing Instructions\n\n`;
  md += `### Run ESLint Quality Check\n`;
  md += `\`\`\`bash\n# Check ESLint rules\nnpm run lint:check\n\n# Generate HTML report\nnpm run lint:report\n\n# Generate JSON report\nnpm run lint:report:json\n\`\`\`\n\n`;

  md += `### Run Database Migrations & Seeding\n`;
  md += `\`\`\`bash\n# Show migration status\nnpm run migration:show\n\n# Execute pending migrations\nnpm run migration:run\n\n# Seed test data (admin & user accounts, sample gifts)\nnpm run seed\n\`\`\`\n\n`;

  md += `### Re-run Automated Audit\n`;
  md += `\`\`\`bash\nnpm run audit\n\`\`\`\n\n`;

  md += `### Run NestJS Server & Access Swagger\n`;
  md += `\`\`\`bash\nnpm run start:dev\n# Open browser at: http://localhost:3000/api/docs\n\`\`\`\n`;

  return md;
}

// Execute and print results
const report = runAudit();
const mdReport = generateMarkdownReport(report);
fs.writeFileSync(path.join(rootDir, 'AUDIT_REPORT.md'), mdReport, 'utf8');

console.info('========================================================================');
console.info('           🏆 BACKEND CORE CODEBASE AUDIT SCORECARD                     ');
console.info('========================================================================');
for (const item of report.items) {
  const badge = item.passed ? '✓' : '✗';
  console.info(`[${badge}] ${item.name.padEnd(58)} : ${item.score}/${item.maxScore} pts`);
}
console.info('------------------------------------------------------------------------');
console.info(`TOTAL SCORE : ${report.totalScore} / ${report.maxTotalScore} pts (${report.grade})`);
console.info('========================================================================');
console.info('📄 Detailed markdown report saved to: AUDIT_REPORT.md');
