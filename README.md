# Equipment Management System - Web Portal

Cổng thông tin quản trị dành cho Admin để quản lý danh mục thiết bị, người dùng, phê duyệt yêu cầu mượn/trả và xem báo cáo tổng thể.

## 🚀 Tính năng chính

- **Dashboard**: Biểu đồ thống kê tình trạng thiết bị và hoạt động mượn/trả.
- **Quản lý thiết bị**: Thêm, sửa, xóa và quản lý mã QR thiết bị.
- **Quản lý người dùng**: Phân quyền (Admin, Storekeeper, Borrower).
- **Phê duyệt**: Duyệt các yêu cầu mượn thiết bị từ người dùng.
- **Báo cáo**: Xem danh sách các giao dịch và tình trạng thiết bị.

## 🛠 Tech Stack

- **Framework**: [UmiJS](https://umijs.org/) / [Ant Design Pro](https://pro.ant.design/)
- **UI Components**: Ant Design (v5)
- **State Management**: Umi Max (Initial State, Access)
- **Data Fetching**: Axios / Umi Request
- **Charts**: ApexCharts

## 📋 Yêu cầu hệ thống

- **Node.js**: v20 hoặc mới hơn
- **Yarn/NPM**: Trình quản lý thư viện

## 🛠 Hướng dẫn cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd frontend
```

### 2. Cài đặt dependency
```bash
npm install
# hoặc
yarn install
```

### 3. Thiết lập biến môi trường
Mặc định hệ thống kết nối tới Backend tại `http://localhost:3000`. Bạn có thể cấu hình trong `config/config.ts` hoặc tạo file `.env`.

### 4. Chạy ứng dụng
```bash
npm run dev
```
Ứng dụng sẽ chạy tại [http://localhost:8000](http://localhost:8000).

## 📂 Cấu trúc thư mục chính

```
src/
├── components/     # Các UI components dùng chung
├── pages/          # Các màn hình chức năng (Equipment, Users, etc.)
├── services/       # Các hàm gọi API
├── access.ts       # Cấu hình phân quyền
└── app.tsx         # Cấu hình runtime (Request, Error handling)
```

## 🧪 Build Production
```bash
npm run build
```
Dữ liệu build sẽ nằm trong thư mục `dist/`.
