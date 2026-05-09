# Giải thích cách tạo chart trong Dashboard và Reports

Tài liệu này giải thích ngắn gọn, dễ đọc, về cách các biểu đồ được tạo ra trong app.

## 1. Dashboard tạo chart như thế nào?

File chính: [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx)

### Chart ở Dashboard là gì?
Dashboard dùng một biểu đồ dạng **Area Chart** để hiển thị **xu hướng chi tiêu trong 7 ngày gần nhất**.

### Dữ liệu lấy từ đâu?
- App gọi `getTransactions(...)` để lấy danh sách giao dịch trong tháng hiện tại.
- Sau đó chỉ giữ lại các giao dịch có `type = EXPENSE`.
- Mỗi giao dịch được đọc theo ngày tạo `createdAt`.

### Dữ liệu được xử lý ra sao?
- Code tạo sẵn 7 ô dữ liệu cho 7 ngày gần nhất.
- Mỗi ô có:
  - `day`: tên ngày, ví dụ `T2`, `T3`, `T4`
  - `spending`: tổng tiền chi tiêu của ngày đó
- Nếu một ngày có nhiều giao dịch, các số tiền sẽ được cộng lại.

### Chart được vẽ như thế nào?
- `ResponsiveContainer` giúp chart tự co giãn theo khung chứa.
- `AreaChart` vẽ đường xu hướng.
- `XAxis` hiển thị ngày.
- `YAxis` hiển thị giá trị tiền.
- `Tooltip` hiện số tiền khi rê chuột vào điểm trên chart.
- `Area` là phần vùng màu xanh bên dưới đường biểu diễn.

### Hiểu đơn giản
Dashboard trả lời câu hỏi:
**"7 ngày gần đây mình đã chi tiêu như thế nào?"**

---

## 2. Reports tạo chart như thế nào?

File chính: [src/pages/ReportsPage.jsx](src/pages/ReportsPage.jsx)

### Chart ở Reports là gì?
Reports dùng một biểu đồ dạng **Pie Chart** để hiển thị **tỷ trọng chi tiêu hoặc thu nhập** theo:
- **Danh mục** (`category`)
- **Ví tiền** (`wallet`)

### Dữ liệu lấy từ đâu?
Reports có 2 nguồn:
- API báo cáo: `getReportSummary`, `getReportByCategory`, `getReportByWallet`
- Dữ liệu dự phòng từ mảng `transactions` đang có trong app

Nếu API không trả về đúng dữ liệu, code sẽ tự gom nhóm từ `transactions` để chart vẫn hoạt động.

### Dữ liệu được xử lý ra sao?
- Người dùng chọn:
  - loại giao dịch: **chi tiêu** hoặc **thu nhập**
  - kiểu thống kê: **theo danh mục** hoặc **theo ví**
  - khoảng ngày bắt đầu và kết thúc
- Sau đó app gom dữ liệu theo nhóm.
- Mỗi nhóm có:
  - `name`: tên nhóm
  - `total`: tổng tiền của nhóm đó
- Chart chỉ lấy **top 6 nhóm lớn nhất** để biểu đồ dễ nhìn.

### Chart được vẽ như thế nào?
- `ResponsiveContainer` giúp chart co giãn linh hoạt.
- `PieChart` là khung biểu đồ tròn.
- `Pie` tạo các lát cắt theo `total`.
- `Cell` gán màu khác nhau cho từng lát.
- `Tooltip` hiện số tiền khi rê chuột.
- `Legend` hiển thị chú thích màu ở phía dưới.

### Hiểu đơn giản
Reports trả lời câu hỏi:
**"Tiền đang được phân bổ vào đâu nhiều nhất, theo danh mục hay theo ví?"**

---

## 3. Tóm tắt rất ngắn

- **Dashboard**: vẽ biểu đồ **xu hướng chi tiêu theo ngày**.
- **Reports**: vẽ biểu đồ **phân bổ tiền theo nhóm**.
- Cả hai đều dùng thư viện **Recharts**.
- Cả hai đều lấy dữ liệu từ giao dịch rồi xử lý thành format riêng trước khi vẽ.

---

## 4. Nếu muốn nhớ nhanh

- **Dashboard** = biểu đồ đường vùng, xem theo **thời gian**.
- **Reports** = biểu đồ tròn, xem theo **nhóm dữ liệu**.
