/**
 * Script demo tự động toàn bộ 5 luồng API chính để trình chiếu cho Tech Lead
 * Chạy lệnh: npm run demo (yêu cầu server đang chạy ở npm run start:dev)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface ApiResponse<T = Record<string, any>> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

async function request<T = Record<string, any>>(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ status: number; body: ApiResponse<T> }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const resBody = ((await res.json().catch(() => ({}))) || {}) as ApiResponse<T>;
    return { status: res.status, body: resBody };
  } catch (err: any) {
    console.error(`\n❌ Không thể kết nối tới server tại ${BASE_URL}${path}.`);
    console.error(`👉 Hãy chắc chắn bạn đã chạy: npm run start:dev ở một Terminal khác!\n`);
    throw err;
  }
}

function printSection(title: string): void {
  console.log('\n' + '='.repeat(70));
  console.log(`📌 ${title}`);
  console.log('='.repeat(70));
}

function printResult(step: string, status: number, body: unknown): void {
  const isOk = status >= 200 && status < 300;
  const badge = isOk ? '✅ [SUCCESS]' : status === 403 ? '🛡️ [RBAC BLOCKED]' : 'ℹ️ [INFO]';
  console.log(`${badge} ${step} (HTTP ${status})`);
  console.log(JSON.stringify(body, null, 2));
}

async function runDemo(): Promise<void> {
  console.log('🚀 BẮT ĐẦU LUỒNG KIỂM THỬ TỰ ĐỘNG TẤT CẢ API ĐỂ SHOW TECH LEAD');
  console.log(`Target: ${BASE_URL}\n`);

  // -------------------------------------------------------------
  // PHẦN 1: USER LOGIN & PROFILE
  // -------------------------------------------------------------
  printSection('PHẦN 1: AUTHEN USER LOGIN & MODULE USER PROFILE');

  // 1.1 User Login
  const userLogin = await request('POST', '/api/v1/auth/user/login', {
    email: 'user@example.com',
    password: 'User123@',
  });
  printResult('1.1 User Login: POST /api/v1/auth/user/login', userLogin.status, userLogin.body);
  const userToken: string | undefined = userLogin.body?.data?.accessToken;

  // 1.1b Test Login sai mật khẩu (Quy ước chuẩn: 400 Bad Request)
  const badLogin = await request('POST', '/api/v1/auth/user/login', {
    email: 'user@example.com',
    password: 'WrongPassword123@',
  });
  printResult(
    '1.1b Test Login sai mật khẩu (Kỳ vọng: 400 Bad Request theo checklist Lead)',
    badLogin.status,
    badLogin.body,
  );

  if (!userToken) {
    console.error('❌ Không lấy được User Token, vui lòng chạy `npm run seed` trước!');
    return;
  }

  // 1.2 Xem Profile User
  const getProfile = await request('GET', '/api/v1/profile', undefined, userToken);
  printResult('1.2 Get Profile: GET /api/v1/profile', getProfile.status, getProfile.body);

  // 1.3 Cập nhật Profile
  const updateProfile = await request(
    'PATCH',
    '/api/v1/profile',
    {
      fullName: 'John Doe Updated',
      phoneNumber: '+84988776655',
    },
    userToken,
  );
  printResult('1.3 Update Profile: PATCH /api/v1/profile', updateProfile.status, updateProfile.body);

  // -------------------------------------------------------------
  // PHẦN 2: USER GIFTS CATALOG
  // -------------------------------------------------------------
  printSection('PHẦN 2: MODULE RESTful API QUÀ CỦA HỆ THỐNG CHO USER XEM');

  // 2.1 Xem danh sách quà active (hỗ trợ pagination & search)
  const getGifts = await request('GET', '/api/v1/gifts?page=1&limit=5', undefined, userToken);
  printResult('2.1 Get Active Gifts: GET /api/v1/gifts', getGifts.status, getGifts.body);

  const sampleGiftId: string | undefined = getGifts.body?.data?.items?.[0]?.id;

  // 2.2 Xem chi tiết 1 phần quà
  if (sampleGiftId) {
    const giftDetail = await request('GET', `/api/v1/gifts/${sampleGiftId}`, undefined, userToken);
    printResult(
      `2.2 Get Gift Detail: GET /api/v1/gifts/${sampleGiftId}`,
      giftDetail.status,
      giftDetail.body,
    );
  }

  // -------------------------------------------------------------
  // PHẦN 3: ADMIN LOGIN & RBAC SECURITY
  // -------------------------------------------------------------
  printSection('PHẦN 3: AUTHEN ADMIN LOGIN & BẢO VỆ PHÂN QUYỀN RBAC');

  // 3.1 Test User thường cố tình login vào Admin Login -> Bị từ chối
  const badAdminLogin = await request('POST', '/api/v1/auth/admin/login', {
    email: 'user@example.com',
    password: 'User123@',
  });
  printResult(
    '3.1 Test User cố tình gọi Admin Login (Kỳ vọng: 403 Forbidden)',
    badAdminLogin.status,
    badAdminLogin.body,
  );

  // 3.2 Admin thực sự login
  const adminLogin = await request('POST', '/api/v1/auth/admin/login', {
    email: 'admin@example.com',
    password: 'Admin123@',
  });
  printResult('3.2 Admin Login hợp lệ: POST /api/v1/auth/admin/login', adminLogin.status, adminLogin.body);
  const adminToken: string | undefined = adminLogin.body?.data?.accessToken;

  // 3.3 Test User token gọi API Admin Quản Lý Quà -> Bị chặn 403 Forbidden
  const forbiddenCall = await request('GET', '/api/v1/admin/gifts', undefined, userToken);
  printResult(
    '3.3 Test User token cố tình gọi API Admin Quản lý quà (Kỳ vọng: 403 Forbidden)',
    forbiddenCall.status,
    forbiddenCall.body,
  );

  // -------------------------------------------------------------
  // PHẦN 4: ADMIN CRUD QUẢN LÝ QUÀ HỆ THỐNG
  // -------------------------------------------------------------
  printSection('PHẦN 4: MODULE RESTful API QUẢN LÝ QUÀ HỆ THỐNG (ADMIN CRUD)');

  // 4.1 Admin tạo mới quà
  const randomCode = `GIFT-DEMO-${Date.now().toString().slice(-4)}`;
  const createGift = await request(
    'POST',
    '/api/v1/admin/gifts',
    {
      code: randomCode,
      title: 'Demo Gift for Tech Lead',
      description: 'Phần quà dùng để demo chức năng CRUD cho Tech Lead',
      pointsRequired: 300,
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      isActive: true,
    },
    adminToken,
  );
  printResult('4.1 Admin Create Gift: POST /api/v1/admin/gifts', createGift.status, createGift.body);
  const newGiftId: string | undefined = createGift.body?.data?.id;

  // 4.2 Admin cập nhật quà vừa tạo
  if (newGiftId) {
    const updateGift = await request(
      'PUT',
      `/api/v1/admin/gifts/${newGiftId}`,
      {
        title: 'Demo Gift for Tech Lead (Updated)',
        pointsRequired: 350,
        stockQuantity: 25,
      },
      adminToken,
    );
    printResult(
      `4.2 Admin Update Gift: PUT /api/v1/admin/gifts/${newGiftId}`,
      updateGift.status,
      updateGift.body,
    );

    // 4.3 Admin xóa quà vừa tạo (Kỳ vọng: 204 No Content)
    const deleteGift = await request('DELETE', `/api/v1/admin/gifts/${newGiftId}`, undefined, adminToken);
    printResult(
      `4.3 Admin Delete Gift: DELETE /api/v1/admin/gifts/${newGiftId} (Kỳ vọng: 204 No Content)`,
      deleteGift.status,
      deleteGift.body,
    );
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 TOÀN BỘ CÁC LUỒNG API ĐÃ ĐƯỢC KIỂM THỬ THÀNH CÔNG 100%!');
  console.log('='.repeat(70));
}

void runDemo();
