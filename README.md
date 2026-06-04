# 💻 Equipment Management System: Web Portal Management

Cổng thông tin quản trị và vận hành tập trung của dự án **Hệ thống Quản lý Thiết bị Đa nền tảng (Equipment Management System)**. Được thiết kế chuyên biệt dành cho các vai trò **Quản trị viên (Admin)** và **Thủ kho (Storekeeper)** để theo dõi tổng thể, phê duyệt nhanh chóng và quản lý chuyên sâu toàn bộ tài sản.

---

### 🌐 Cổng kết nối trực tuyến
* **Cổng thông tin Web Portal (Production):** [https://equipmentmanagementsystem.netlify.app/](https://equipmentmanagementsystem.netlify.app/)
* **Tải xuống ứng dụng di động Android (APK):** [Tải về EquipmentManagement.apk](https://github.com/Nor262/APP_Equipment_Management_System/releases/download/v1.0.0/EquipmentManagement.apk)
* 🚀 **Mã nguồn Backend:** [Backend_Equipment_Management_System](https://github.com/Nor262/Backend_Equipment_Management_System)
* 📱 **Mã nguồn App di động:** [APP_Equipment_Management_System](https://github.com/Nor262/APP_Equipment_Management_System)
---

### 📊 Công nghệ sử dụng & Huy hiệu

<p align="left">
  <a href="https://equipmentmanagementsystem.netlify.app/"><img src="https://img.shields.io/badge/Production%20Web-Live%20Demo-blue?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/Nor262/APP_Equipment_Management_System/releases/download/v1.0.0/EquipmentManagement.apk"><img src="https://img.shields.io/badge/Android%20App-APK%20Download-green?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" /></a>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/UmiJS-1890FF?style=for-the-badge&logo=react&logoColor=white" alt="UmiJS" />
  <img src="https://img.shields.io/badge/Ant_Design_Pro-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design Pro" />
  <img src="https://img.shields.io/badge/ApexCharts-3A55FE?style=for-the-badge&logo=googlecharts&logoColor=white" alt="ApexCharts" />
  <img src="https://img.shields.io/badge/Zustand-443322?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</p>

---

## ⚡ Tính năng chính của Web Portal

1. **Bảng điều khiển (Dashboard) trực quan:** Biểu đồ thống kê thời gian thực của ApexCharts về số lượng thiết bị theo trạng thái (`Sẵn sàng`, `Đang mượn`, `Hỏng hóc`, `Bảo trì`), xu hướng đặt mượn theo thời gian và danh sách sinh viên vi phạm bị phạt.
2. **Quản lý tài sản nâng cao:** Tích hợp bộ lọc ProTable của Ant Design Pro, cho phép tìm kiếm nâng cao, chỉnh sửa specifications JSON động, nhập tài sản hàng loạt qua Excel (.xlsx) và in mã QR thiết bị hàng loạt với định dạng chuẩn 3x3cm.
3. **Phê duyệt đơn mượn/trả:** Giao diện duyệt đơn mượn từ sinh viên gửi lên, cho phép xem lịch trống của thiết bị trước khi duyệt, từ chối đơn kèm lý do phản hồi chi tiết.
4. **Quản lý vận hành kho:** Thực hiện Check-in / Check-out bàn giao thiết bị tại kho trực tiếp bằng mã serial hoặc mã QR, cập nhật tình trạng thiết bị sau khi nhận lại kèm biên bản hư hỏng.
5. **Quản trị người dùng & Phân quyền (RBAC):** Quản lý quyền truy cập của các thành viên trong hệ thống, thực hiện khóa/mở khóa quyền mượn đồ của sinh viên vi phạm, theo dõi lịch sử Logs hoạt động (Audit Logs).

---

## 📋 Yêu cầu hệ thống

* **Node.js:** Phiên bản 20.x trở lên.
* **NPM / Yarn:** Để thực hiện cài đặt thư viện và khởi chạy dự án.

---

## 🛠 Hướng dẫn thiết lập chi tiết

### 1. Cài đặt thư viện
Di chuyển vào thư mục `frontend` và chạy lệnh cài đặt:
```bash
npm install
# hoặc sử dụng yarn
yarn install
```

### 2. Thiết lập cấu hình kết nối API
Mặc định Cổng thông tin Web Portal sẽ kết nối tới Backend chạy cục bộ tại `http://localhost:3000`. 
Để kết nối tới Backend server production hoặc cấu hình cụ thể hơn, bạn có thể tạo tệp `.env` ở thư mục gốc của frontend:
```env
UMI_APP_API_URL=https://btl-thltw-api.onrender.com/v1
```
*(Hoặc tùy chỉnh các giá trị định tuyến proxy trong tệp `config/config.ts`)*

### 3. Khởi chạy dev server
Khởi động ứng dụng React/UmiJS ở chế độ phát triển:
```bash
npm run dev
# hoặc sử dụng yarn
yarn dev
```
Sau khi khởi chạy thành công, trình duyệt sẽ tự động mở trang web tại địa chỉ: [http://localhost:8000](http://localhost:8000).

---

## 📂 Cấu trúc thư mục chính của Web Portal

```
frontend/
├── config/                 # Cấu hình dự án UmiJS, Routing và Proxy
│   ├── config.ts           # Tệp cấu hình cấu trúc router chính và plugins
│   └── defaultSettings.ts  # Cấu hình layout, màu sắc chủ đạo (Ant Design)
├── src/
│   ├── components/         # Các UI components dùng chung (Header, Footer, v.v.)
│   ├── pages/              # Trang nghiệp vụ của ứng dụng
│   │   ├── Dashboard/      # Trang chủ thống kê đồ thị và chỉ số KPI
│   │   ├── Equipment/      # Giao diện CRUD thiết bị, in mã QR, danh mục
│   │   ├── Transactions/   # Quản lý đơn mượn trả, thực hiện check-in/out
│   │   └── Users/          # Quản lý tài khoản, phân quyền, xem Logs hoạt động
│   ├── services/           # Các lớp gọi REST API đến NestJS Backend
│   ├── access.ts           # Tệp cấu hình phân quyền dựa theo quyền hạn tài khoản (RBAC)
│   └── app.tsx             # Cấu hình runtime (Xử lý request interceptor, lỗi chung)
└── public/                 # Các assets tĩnh như Logo, Favicon
```

---

## 🧪 Đóng gói Production (Build)

Để tiến hành build tối ưu ứng dụng cho môi trường chạy chính thức:
```bash
npm run build
# hoặc sử dụng yarn
yarn build
```
Toàn bộ mã nguồn sau khi tối ưu và nén (HTML, CSS, JS tĩnh) sẽ nằm trong thư mục `dist/`, sẵn sàng để triển khai lên Render, Netlify, Vercel hoặc Nginx.

---
*Ghi chú: UmiJS sử dụng cơ chế nén code rất mạnh khi build. Hãy đảm bảo máy tính của bạn có cấu hình RAM tối thiểu 4GB để tiến trình build không gặp lỗi tràn bộ nhớ (Out of Memory).*
