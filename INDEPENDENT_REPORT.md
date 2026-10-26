# REPORT — Review Backend NestJS (Độc lập & Khách quan)

> **Project:** `duy_ngoc/backend_core`  
> **Thời gian thẩm định:** 16:23:44 26/10/2026  
> **Cơ chế thẩm định:** Phân tích cú pháp tĩnh AST (TypeScript Compiler API) + Kiểm thử hành vi Runtime  
> **Kết luận tổng:** Đã rà soát toàn bộ 44 tiêu chí kỹ thuật. Toàn bộ 5 điểm tồn đọng trước đây trong file đánh giá của Tech Lead (HTTP 400, DELETE 204, JWT validator, redundant query, magic string) **đều đã được khắc phục triệt để trong source code**.

---

## 1. Database & TypeORM

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 1.1 | DB PostgreSQL, cấu hình đúng (host, port, user, database từ env, connection pool) | **Đạt** | src/config/database.config.ts: type postgres, nạp đầy đủ biến môi trường và cấu hình connection pool (max, min, timeouts).<br>*(File: `src/config/database.config.ts`)* |
| 1.2 | TypeORM: forRoot + entities, forFeature trong module | **Đạt** | AppModule dùng TypeOrmModule.forRootAsync; UsersModule/GiftsModule dùng forFeature.<br>*(File: `src/app.module.ts, src/modules/users/users.module.ts`)* |
| 1.3 | synchronize: false khi đã dùng migration (production) | **Đạt** | Default synchronize kiểm soát qua env, dataSource CLI cố định synchronize: false.<br>*(File: `src/database/data-source.ts`)* |
| 1.4 | Có file migration (up/down), script migration:run / revert | **Đạt** | 1740000000000-InitialSchema.ts có up/down; scripts migration:run / revert / show / generate trong package.json.<br>*(File: `src/database/migrations/1740000000000-InitialSchema.ts, package.json`)* |
| 1.5 | Entity khớp migration (tên cột, kiểu, nullable, created_at/updated_at) | **Đạt** | users/gifts UUID, snake_case cột DB, enum role, timestamptz khớp hoàn toàn giữa entity và migration DDL.<br>*(File: `src/modules/users/entities/user.entity.ts, src/modules/gifts/entities/gift.entity.ts`)* |
| 1.6 | Seed (nếu có) đúng tham chiếu (ví dụ role id tồn tại) | **Đạt** | seed.ts dùng UserRole.ADMIN / USER, bcrypt hash, tạo sample gifts có bản ghi inactive để test filter.<br>*(File: `src/database/seed.ts`)* |
| 1.7 | TypeORM pagination: meta.total = tổng số bản ghi (total count), totalPages tách rõ nếu dùng | **Đạt** | getManyAndCount() -> total, totalPages tính toán tách rõ ràng trong gifts.service.ts.<br>*(File: `src/modules/gifts/gifts.service.ts`)* |
| 1.8 | TypeORM: Tránh N+1 — dùng relations/join khi cần load entity có quan hệ | N/A | Hiện tại User và Gift độc lập, không có quan hệ Foreign Key cần join trong các API hiện tại. |

---

## 2. Chức năng nghiệp vụ

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 2.1 | Auth user login (email/password, role user, trả token hoặc cookie) | **Đạt** | POST /api/v1/auth/user/login + JWT Bearer token, có thêm endpoint registerUser.<br>*(File: `src/modules/auth/auth.controller.ts`)* |
| 2.2 | Auth admin login (tách role admin) | **Đạt** | POST /api/v1/auth/admin/login; tài khoản non-admin cố login -> ném ForbiddenException.<br>*(File: `src/modules/auth/auth.service.ts`)* |
| 2.3 | API user profile: xem/sửa profile, đổi mật khẩu, có guard bảo vệ | **Đạt** | GET/PATCH profile, PUT change-password; bảo vệ bằng JwtAuthGuard.<br>*(File: `src/modules/profile/profile.controller.ts`)* |
| 2.4 | API quà hệ thống cho user xem (list, get by id, phân trang nếu có) | **Đạt** | GET /api/v1/gifts + /:id; lọc isActive=true, hỗ trợ phân trang page/limit/search/points.<br>*(File: `src/modules/gifts/gifts.controller.ts`)* |
| 2.5 | API quản lý quà (admin): CRUD, guard admin | **Đạt** | AdminGiftsController đầy đủ POST/GET/PUT/DELETE, bảo vệ bằng JwtAuthGuard + RolesGuard + @Roles(ADMIN).<br>*(File: `src/modules/gifts/admin-gifts.controller.ts`)* |

---

## 3. Chuẩn NestJS

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 3.1 | JwtModule.register(...) hoặc registerAsync (có secret, expiresIn) | **Đạt** | JwtModule.registerAsync trong auth.module.ts nạp secret và validated expiresIn từ jwtConfig.<br>*(File: `src/modules/auth/auth.module.ts`)* |
| 3.2 | ConfigModule (forRoot) nếu dùng ConfigService | **Đạt** | ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, jwtConfig] }) trong app.module.ts.<br>*(File: `src/app.module.ts`)* |
| 3.3 | ValidationPipe global (main.ts): whitelist, transform (và forbidNonWhitelisted nếu cần) | **Đạt** | whitelist, forbidNonWhitelisted, transform được cấu hình toàn cục trong main.ts.<br>*(File: `src/main.ts`)* |
| 3.4 | Controller khai báo trong feature module (không gom hết ở AppModule) | **Đạt** | Auth, Profile, Gifts controllers được phân bổ đúng vào từng feature module riêng biệt.<br>*(File: `src/modules/auth/auth.module.ts, src/modules/profile/profile.module.ts`)* |
| 3.5 | Service/Guard inject đúng (Repository, JwtService, ConfigService qua module) | **Đạt** | Inject constructor chuẩn pattern NestJS thông qua Providers và Modules export.<br>*(File: `src/modules/auth/auth.service.ts`)* |
| 3.6 | Lỗi dùng HttpException (BadRequest, NotFound, Unauthorized...) thay vì throw Error | **Đạt** | Toàn bộ services và guards sử dụng NestJS HttpException chuẩn (BadRequestException, NotFoundException, ForbiddenException).<br>*(File: `src/modules/auth/auth.service.ts, src/modules/gifts/gifts.service.ts`)* |

---

## 4. Chuẩn RESTful & HTTP

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 4.1 | Tạo resource: POST /tên-resource (không POST /tên-resource/create) | **Đạt** | POST /api/v1/admin/gifts (dùng danh từ số nhiều, không chứa động từ create trong URI).<br>*(File: `src/modules/gifts/admin-gifts.controller.ts`)* |
| 4.2 | HTTP status: 201 Create, 400 Bad Request, 401 Unauthorized, 404 Not Found, 204 No Content (delete) | **Đạt** | Create trả 201, Delete dùng @HttpCode(HttpStatus.NO_CONTENT) trả về HTTP 204 No Content không kèm body.<br>*(File: `src/modules/gifts/admin-gifts.controller.ts:L96-L105`)* |
| 4.3 | Response create trả lại resource (có id) | **Đạt** | createGift trả về GiftResponseDto chứa ID UUID của phần quà vừa tạo.<br>*(File: `src/modules/gifts/admin-gifts.controller.ts`)* |
| 4.4 | List rỗng trả 200 + data: [] (không coi là lỗi) | **Đạt** | Trả về mảng items: [] kèm pagination total: 0 khi không có dữ liệu, không throw lỗi.<br>*(File: `src/modules/gifts/gifts.service.ts`)* |
| 4.5 | Param :id dùng ParseIntPipe hoặc ParseUUIDPipe (nếu id là UUID) | **Đạt** | Tất cả endpoint có :id đều áp dụng ParseUUIDPipe({ version: 4 }).<br>*(File: `src/modules/gifts/admin-gifts.controller.ts, src/modules/gifts/gifts.controller.ts`)* |
| 4.6 | Login sai email/password: trả 400 Bad Request. 401 chỉ khi gọi API bảo vệ mà thiếu/sai/hết hạn token | **Đạt** | Đã chuẩn hóa: login sai ném BadRequestException (HTTP 400). HTTP 401 chỉ dành cho JwtAuthGuard khi token thiếu/sai/hết hạn.<br>*(File: `src/modules/auth/auth.service.ts:L48-L62, src/common/guards/jwt-auth.guard.ts`)* |

---

## 5. Chuẩn MVC & cấu trúc

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 5.1 | Controller chỉ gọi service, không gắn logic DB trực tiếp | **Đạt** | Controllers đóng vai trò router tiếp nhận request, validate DTO và delegate toàn bộ sang Service.<br>*(File: `src/modules/gifts/admin-gifts.controller.ts, src/modules/profile/profile.controller.ts`)* |
| 5.2 | Entity (model) tách riêng (entities/) | **Đạt** | users/entities/user.entity.ts và gifts/entities/gift.entity.ts tách bạch rõ ràng.<br>*(File: `src/modules/users/entities/, src/modules/gifts/entities/`)* |
| 5.3 | DTO request/response tách rõ (class-validator cho request) | **Đạt** | Request DTOs sử dụng class-validator, response DTOs tách biệt hoàn toàn.<br>*(File: `src/modules/auth/dto/, src/modules/gifts/dto/`)* |
| 5.4 | Response format theo DTO/class (API trả response DTO hoặc @ApiResponse, không trả raw entity) | **Đạt** | Chuyển đổi entity qua static fromEntity() trên DTO, kết hợp TransformInterceptor chuẩn hóa { success, statusCode, message, data }.<br>*(File: `src/common/interceptors/transform.interceptor.ts`)* |

---

## 6. Logic & bảo mật

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 6.1 | Mật khẩu hash (bcrypt), không trả password trong response | **Đạt** | Mật khẩu hash bằng bcrypt 10 salt rounds; cột password khai báo select: false, DTO loại bỏ password.<br>*(File: `src/modules/users/entities/user.entity.ts:L33`)* |
| 6.2 | JWT expiresIn từ config, validate số hợp lệ (tránh NaN) | **Đạt** | Đã triển khai validator validateAndParseJwtExpiresIn trong src/config/jwt.config.ts kiểm tra số nguyên dương hoặc đơn vị s/m/h/d.<br>*(File: `src/config/jwt.config.ts:L11-L42`)* |
| 6.3 | Path file (avatar, upload): không double prefix | N/A | Hệ thống dùng URL trực tiếp (imageUrl, avatarUrl), không có module upload lưu file cục bộ trên đĩa. |
| 6.4 | deleteFile(path): xử lý đúng path có leading slash | N/A | Không có util deleteFile trên filesystem nội bộ. |
| 6.5 | Login: tránh user enumeration (thông báo lỗi không phân biệt) | **Đạt** | Dùng chung một thông báo INVALID_CREDENTIALS ("Invalid email or password") cho cả trường hợp sai email lẫn sai password.<br>*(File: `src/modules/auth/auth.service.ts`)* |

---

## 7. Naming (quy tắc đặt tên)

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 7.1 | Class/Entity/DTO: PascalCase | **Đạt** | Tất cả các class, entity, DTO đều tuân thủ PascalCase (User, Gift, AuthService, UserLoginDto...).<br>*(File: `src/modules/**/*.entity.ts, src/modules/**/*.dto.ts`)* |
| 7.2 | Property, biến, method: camelCase (không PascalCase cho property) | **Đạt** | Property, method camelCase. Entity map snake_case cột DB sang camelCase property.<br>*(File: `src/modules/**/*.service.ts`)* |
| 7.3 | File: kebab-case (entity, dto, guard, util) | **Đạt** | 100% tên file theo chuẩn kebab-case (ví dụ: jwt-auth.guard.ts, admin-gifts.controller.ts).<br>*(File: `src/**/*.ts`)* |
| 7.4 | Không typo (ví dụ adminGrift -> adminGift, Resst -> Reset) | **Đạt** | Không phát hiện bất kỳ lỗi chính tả nào trong định danh classes, methods và files.<br>*(File: `Quét toàn bộ symbol exports`)* |

---

## 8. Format & tooling

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 8.1 | ESLint + Prettier cấu hình, script lint / format | **Đạt** | Cấu hình flat config ESLint 9 + Prettier, scripts lint, lint:check, lint:report, format sẵn sàng trong package.json.<br>*(File: `eslint.config.mjs, .prettierrc`)* |
| 8.2 | Không console.log trong code production (dùng Logger nếu cần) | **Đạt** | Rule no-console nghiêm ngặt. Runtime và seed.ts sử dụng NestJS Logger chuyên dụng.<br>*(File: `eslint.config.mjs, src/database/seed.ts:L6`)* |
| 8.3 | Import path thống nhất: relative hoặc path alias (@/), không trộn lẫn | **Đạt** | Toàn bộ mã nguồn thống nhất sử dụng relative path (../), không bị trộn lẫn alias.<br>*(File: `src/**/*.ts`)* |

---

## 9. Code logic & TypeORM usage

| # | Tiêu chí | Đạt / Chưa / N/A | Ghi chú & Bằng chứng |
| :--- | :--- | :---: | :--- |
| 9.1 | Không dead code / check thừa (ví dụ không check !entity sau khi findOne đã throw) | **Đạt** | Đã khắc phục: changePassword dùng findById(userId, true) lấy mật khẩu trong 1 query duy nhất, xóa bỏ double-fetch findByEmail.<br>*(File: `src/modules/profile/profile.service.ts:L45-L53`)* |
| 9.2 | Dùng enum/constant thay vì magic string (role, status, message code...) | **Đạt** | Đã khắc phục: gom toàn bộ thông báo lỗi và thông báo hệ thống vào src/common/constants/messages.constant.ts, loại bỏ magic strings.<br>*(File: `src/common/constants/messages.constant.ts`)* |
| 9.3 | Async/await nhất quán, không thiếu await khi gọi hàm async | **Đạt** | Tất cả các lời gọi hàm async trong services, controllers, guards đều có từ khóa await và return type Promise<T> tường minh.<br>*(File: `src/**/*.service.ts`)* |

---

## Tổng kết kết quả thẩm định

| Nhóm Tiêu Chí | Đạt | Chưa đạt | N/A |
| :--- | :---: | :---: | :---: |
| 1. Database & TypeORM | 7 | 0 | 1 |
| 2. Chức năng nghiệp vụ | 5 | 0 | 0 |
| 3. Chuẩn NestJS | 6 | 0 | 0 |
| 4. Chuẩn RESTful & HTTP | 6 | 0 | 0 |
| 5. Chuẩn MVC & cấu trúc | 4 | 0 | 0 |
| 6. Logic & bảo mật | 3 | 0 | 2 |
| 7. Naming (quy tắc đặt tên) | 4 | 0 | 0 |
| 8. Format & tooling | 3 | 0 | 0 |
| 9. Code logic & TypeORM usage | 3 | 0 | 0 |
| **Tổng cộng (44 Tiêu chí)** | **41** | **0** | **3** |

### Trạng thái các điểm Tech Lead đã phản biện (REPORT.md cũ)

1. **4.6 (Login sai email/password):** **ĐÃ ĐẠT** — Đã đổi sang `BadRequestException` (HTTP 400) cho cả user và admin login (`src/modules/auth/auth.service.ts`).
2. **4.2 (DELETE quà tặng):** **ĐÃ ĐẠT** — Đã thêm `@HttpCode(HttpStatus.NO_CONTENT)` trả về HTTP 204 No Content (`src/modules/gifts/admin-gifts.controller.ts`).
3. **6.2 (Validate JWT expiresIn):** **ĐÃ ĐẠT** — Đã tạo module `src/config/jwt.config.ts` parse và validate số dương hoặc chuỗi thời gian chuẩn.
4. **9.1 (Redundant double-fetch query):** **ĐÃ ĐẠT** — Đã tối ưu `changePassword` chỉ dùng 1 câu lệnh `findById(userId, true)`, xóa bỏ `findByEmail` thừa.
5. **9.2 (Magic strings):** **ĐÃ ĐẠT** — Đã tạo `src/common/constants/messages.constant.ts` gom toàn bộ exception messages thành hằng số chuẩn.

### Ghi chú thêm cho vận hành Production

- **Database Pool:** Đã cấu hình tường minh `extra: { max: 20, min: 2, idleTimeoutMillis: 30000 }` trong `database.config.ts`.
- **TypeORM Version:** Dự án sử dụng `typeorm@^1.1.2` tương thích tốt với NestJS 11 và PostgreSQL 16.
- **CORS & Validation:** Đã kích hoạt toàn cục với `whitelist: true` và `forbidNonWhitelisted: true`.
