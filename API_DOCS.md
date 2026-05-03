# TÀI LIỆU API (API SPECIFICATION)

Tài liệu này đặc tả các endpoint giao tiếp giữa Frontend (Web Portal / Mobile App) và Backend API Server. Hệ thống tuân thủ thiết kế **RESTful API** và giao tiếp bằng định dạng **JSON**.

- **Base URL**: `https://api.yourdomain.com/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

---

## 1. Phân hệ Authentication (Xác thực)

### 1.1. Đăng nhập
- **Endpoint:** `POST /auth/login`
- **Mô tả:** Đăng nhập để nhận chuỗi mã thông báo Access Token và Refresh Token.
- **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "full_name": "Nguyen Van A",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "refreshToken": "dGVzdC1yZWZyZXNoLXRva2Vu..."
  }
}
```

### 1.2. Lấy thông tin tài khoản (Profile)
- **Endpoint:** `GET /auth/me`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response (200 OK):** Trả về toàn bộ thông tin chi tiết của người dùng đang nắm giữ Token.

### 1.3. Đăng ký (Dành cho thành viên)
- **Endpoint:** `POST /auth/register`
- **Request Body:** Gồm `username`, `email`, `password`, `full_name`. Vai trò mặc định được gán là `borrower`.

---

## 2. Phân hệ Equipment (Quản lý Thiết bị)

### 2.1. Lấy danh sách thiết bị (Có lọc & Phân trang)
- **Endpoint:** `GET /equipment`
- **Query Parameters:** 
  - `page=1` & `limit=20`
  - `status=available` (Tuỳ chọn lọc theo trạng thái)
  - `categoryId=2` (Tuỳ chọn lọc theo danh mục)
  - `search=Laptop` (Tìm theo tên hoặc SKU)
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 101,
        "name": "MacBook Pro M2",
        "serial_number": "MBP-2023-001",
        "category": { "id": 2, "name": "Laptop" },
        "status": "available",
        "qr_code_data": "EQ-101-MBP2023001"
      }
    ],
    "meta": { 
      "totalItems": 45, 
      "itemCount": 20, 
      "itemsPerPage": 20, 
      "totalPages": 3, 
      "currentPage": 1 
    }
  }
}
```

### 2.2. Xem chi tiết & Lịch trống thiết bị
- **Endpoint:** `GET /equipment/:id`
- **Mô tả:** Trả về thông tin chi tiết và danh sách các khoảng thời gian thiết bị đang bị "book" để Mobile App vẽ Calendar block ngày.
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 101,
    "name": "MacBook Pro M2",
    "serial_number": "MBP-2023-001",
    "specifications": {
      "ram": "16GB",
      "storage": "512GB SSD"
    },
    "booked_ranges": [
      {
        "start_date": "2026-05-10T08:00:00Z",
        "end_date": "2026-05-12T17:00:00Z"
      }
    ]
  }
}
```

### 2.3. Tạo mới thiết bị
- **Endpoint:** `POST /equipment`
- **Headers:** `Authorization: Bearer <accessToken>` *(Admin Only)*
- **Request Body:**
```json
{
  "name": "Sony A7IV",
  "categoryId": 3,
  "serial_number": "SNY-A74-009",
  "specifications": {
    "resolution": "33MP",
    "sensor": "Full-frame"
  }
}
```
*(Hệ thống sẽ tự động generate ra chuỗi `qr_code_data` lưu vào database)*

---

## 3. Phân hệ Transactions (Nghiệp vụ Mượn/Trả)

### 3.1. Tạo yêu cầu mượn
- **Endpoint:** `POST /transactions/borrow`
- **Headers:** `Authorization: Bearer <accessToken>` *(Borrower Role)*
- **Mô tả:** Người dùng gửi đơn đặt mượn. Backend sử dụng Pessimistic Locking để chống Double-Booking trong DB.
- **Request Body:**
```json
{
  "equipment_id": 101,
  "start_date": "2026-05-15T08:00:00Z",
  "due_date": "2026-05-17T17:00:00Z",
  "notes": "Mượn đi quay sự kiện chào tân sinh viên"
}
```
- **Response (201 Created):**
```json
{
  "status": "success",
  "message": "Yêu cầu mượn đã được tạo thành công, chờ phê duyệt.",
  "data": { "transaction_id": 5052 }
}
```

### 3.2. Phê duyệt hoặc Từ chối yêu cầu
- **Endpoint:** `PUT /transactions/:id/review`
- **Headers:** `Authorization: Bearer <accessToken>` *(Admin Only)*
- **Request Body:**
```json
{
  "action": "approve", // hoặc "reject"
  "reason": "" // Bắt buộc nếu action="reject"
}
```
- **Response (200 OK):** Chuyển trạng thái transaction thành `approved` hoặc `rejected`. Tự động gọi Job đẩy Push Notification tới thiết bị người mượn qua Firebase.

### 3.3. Xác thực mã thiết bị (Verify Item - Manual Entry)
- **Endpoint:** `POST /transactions/verify-item`
- **Headers:** `Authorization: Bearer <accessToken>` *(Storekeeper Role)*
- **Mô tả:** Sử dụng khi thủ kho nhập tay Serial Number hoặc quét mã qua giao diện Web để kiểm tra tính hợp lệ của thiết bị trước khi Check-in/Check-out.
- **Request Body:**
```json
{
  "serial_number": "MBP-2023-001"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "equipment_id": 101,
    "name": "MacBook Pro M2",
    "status": "approved",
    "transaction_id": 5052
  }
}
```

### 3.4. Check-out: Bàn giao thiết bị qua QR Code
- **Endpoint:** `PUT /transactions/:id/checkout`
- **Headers:** `Authorization: Bearer <accessToken>` *(Storekeeper Role)*
- **Mô tả:** Quản lý kho dùng App quét mã QR thiết bị để tìm đơn mượn tương ứng của nó trong ngày hôm nay và hoàn tất quy trình lấy đồ.
- **Request Body:**
```json
{
  "qr_code_data": "EQ-101-MBP2023001"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "message": "Bàn giao thành công. Thiết bị đã chuyển sang trạng thái In Use."
}
```

### 3.5. Check-in: Nhận lại thiết bị qua QR Code
- **Endpoint:** `PUT /transactions/:id/checkin`
- **Headers:** `Authorization: Bearer <accessToken>` *(Storekeeper Role)*
- **Mô tả:** Trả đồ về kho và kiểm tra tình trạng vật lý.
- **Request Body:**
```json
{
  "qr_code_data": "EQ-101-MBP2023001",
  "condition_status": "good", // Nếu thiết bị hư hỏng, gửi "broken"
  "condition_notes": "Màn hình có xước xát nhỏ ở góc trái"
}
```
- **Response (200 OK):** Transaction chuyển thành `completed`. Nếu `condition_status="broken"`, thiết bị sẽ chuyển status thành `maintenance` (bảo trì) thay vì `available`.

---

## 4. Phân hệ Analytics & Reports (Báo cáo Thống kê)

### 4.1. Lấy dữ liệu Tổng quan cho Dashboard
- **Endpoint:** `GET /analytics/dashboard`
- **Headers:** `Authorization: Bearer <accessToken>` *(Admin Only)*
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_equipment": 150,
      "available_count": 90,
      "in_use_count": 50,
      "maintenance_count": 10
    },
    "alerts": {
      "pending_requests": 5,
      "overdue_transactions": 2
    },
    "charts": {
      "top_borrowed": [
        { "id": 101, "name": "MacBook Pro M2", "borrow_count": 24 },
        { "id": 204, "name": "Sony A7IV", "borrow_count": 18 }
      ],
      "borrow_frequency_by_month": [
        { "month": "2026-01", "count": 120 },
        { "month": "2026-02", "count": 145 }
      ]
    }
  }
}
```
