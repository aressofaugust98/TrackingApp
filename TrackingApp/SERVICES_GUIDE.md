# Service Layer Architecture Guide

Tài liệu này tổng hợp lại cách ứng dụng xử lý các cuộc gọi API và quản lý tầng **Service** (Client-Server Communication).

## Tổng quan (Overview)

Tầng Service trong project này đóng vai trò là một "cầu nối" trung gian giữa các React Components ở phía giao diện Frontend và các APIs ở Backend. Thay vì gọi `fetch` trực tiếp trong Component làm code trở nên cồng kềnh, khó tái sử dụng và quản lý lỗi, mọi logic tương tác dữ liệu đều được tách riêng vào thư mục `src/services/`.

## Cấu trúc Thư mục

Tất cả các thành phần liên quan đến kết nối API nằm trong hai thư mục chính:

```text
src/
├── utils/                # Các tiện ích cốt lõi hỗ trợ việc gọi API
│   ├── apiConfig.js      # Chứa cấu hình URL gốc của Backend
│   └── apiClient.js      # Cung cấp hàm fetchWithAuth để gọi API kèm Token
│
└── services/             # Tập hợp cục bộ hóa các API theo từng chức năng quản lý
    ├── authService.js        # Logic Đăng nhập, Đăng ký, Refresh Token
    ├── categoryService.js    # Lấy/Tạo danh mục (Category)
    ├── chatService.js        # Giao tiếp với AI Chatbot
    ├── ocrService.js         # API cho tính năng In-App Scanner (Đọc hóa đơn)
    ├── reportService.js      # Report và thống kê dữ liệu biểu đồ
    ├── transactionService.js # Xử lý giao dịch (CRUD)
    └── walletService.js      # Xử lý Ví và Tổng quan tài khoản
```

## Các Mẫu (Patterns) Hiện Có

Trong source code, hiện tại có 2 cơ chế để thực hiện lấy dữ liệu từ Backend.

### 1. Sử dụng `apiClient.js` (Khuyến nghị dùng)
`apiClient.js` export ra một hàm `fetchWithAuth`. Hàm này là một wrapper siêu tiện lợi thực hiện các logic sau:
- Tự động lấy `accessToken` từ `localStorage` đính kèm vào Headers.
- Tự động kiểm tra HTTP status. Nếu lỗi `401 Unauthorized`, nó sẽ clear token và bắn lỗi yêu cầu đăng nhập lại.
- Tự động parse response JSON hoặc Text.

**Ví dụ:**
```javascript
import { fetchWithAuth } from '../utils/apiClient';

export const getDashBoardStats = async () => {
  return await fetchWithAuth('/dashboard/stats', {
    method: 'GET'
  });
};
```

### 2. Triển khai thủ công trong từng Service (Pattern Cũ)
Một số file (như `transactionService.js`) vẫn đang tự khởi tạo `headers` và phân tích JSON thủ công.
- Tự dùng `localStorage.getItem('accessToken')`.
- Hàm `buildError` để nén các lỗi HTTP Status => `Error objects`.

**Ví dụ:**
```javascript
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export const getTransactionById = async (id) => {
  const response = await fetch(getApiUrl(`/transactions/${id}`), {
    headers: getAuthHeaders(),
  });
  // ... xử lý lỗi tay
  return await response.json();
};
```

*(Khuyến nghị refactor sau này: Chuyển đổi toàn bộ các hàm gọi API sử dụng `fetchWithAuth` trong `apiClient.js` để code được đồng bộ và thống nhất gọn gàng nhất)*.

## Quản lý Token (Authentication)
Dự án sử dụng chiến lược **Token-based Authentication (JWT)**:
- Token được cấp phát từ `authService.js` sau khi Đăng nhập và được lưu giữ tại `localStorage` với key là `accessToken`.
- Các request sau đó yêu cầu quyền (Private routes) sẽ lấy từ `localStorage` này đẩy lên Headers theo dạng `Authorization: Bearer <token>`.

## Quản lý Lỗi (Error Handling)
Khi Backend trả về lỗi (400, 404, 500...), Service sẽ `throw new Error(...)`.
Bên React Components khi gọi Service thường cần được bọc bởi `try...catch` để có thể nhận dạng lỗi này và tiến hành Toast hoặc hiển thị Message cho người dùng:

```javascript
import { updateTransaction } from '../services/transactionService';

const handleEdit = async (data) => {
  try {
    setIsLoading(true);
    await updateTransaction(data.id, data);
    toast.success('Giao dịch đã được cập nhật thành công!');
  } catch (error) {
    toast.error('Có lỗi xảy ra: ', error.message);
  } finally {
    setIsLoading(false);
  }
};
```

## Hướng Mở Rộng Sau Này
- Cân nhắc sử dụng kết hợp **React Query (TanStack Query)** ở tầng Components để quản lý caching, background refetching (tự làm mới dữ liệu) cho các thao tác get đơn giản thay vì phải viết `useEffect` và `useState` thủ công.
- Nếu dự án phức tạp hơn, có thể chuyển `fetchBase` từ `fetch` sang `axios` để hỗ trợ cơ chế Cancel Tokens mạnh mẽ hơn hoặc Axios Interceptors để làm mới token tự động (Refresh Token) khi token bị hết hạn.