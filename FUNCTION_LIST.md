# DANH SÁCH CHỨC NĂNG CHI TIẾT (FUNCTION LIST)

Tài liệu này định nghĩa chi tiết các chức năng của Hệ thống Quản lý Mượn/Trả Thiết bị, được chia làm 2 nền tảng: **Web Portal** (dành cho bộ phận quản lý) và **Mobile App** (dành cho người dùng cuối và thao tác kho).

---

## 1. Web Portal (Dành cho Quản trị viên & Quản lý kho)

### 1.1. Phân hệ Quản trị Hệ thống (System Admin)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| W-SYS-01 | Đăng nhập | Đăng nhập bằng email và mật khẩu. Hệ thống xác thực qua JWT. | Admin, Storekeeper | Cao |
| W-SYS-02 | Quản lý Vai trò (RBAC) | Cấp quyền cho các tài khoản: Admin, Storekeeper. Phân quyền truy cập các module dựa trên Role. | Admin | Cao |
| W-SYS-03 | Quản lý Người dùng | Xem danh sách, thêm, sửa, khóa (deactivate) tài khoản của sinh viên/người mượn khi có vi phạm. | Admin | Cao |
| W-SYS-04 | Logs hoạt động | Lưu vết (Audit log) lịch sử các thao tác nhạy cảm (như xóa thiết bị, duyệt đơn, thay đổi quyền). | Admin | Thấp |

### 1.2. Phân hệ Quản lý Thiết bị (Asset Management)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| W-AST-01 | Danh sách thiết bị | Hiển thị bảng thiết bị (có phân trang, bộ lọc theo danh mục, trạng thái, tìm kiếm theo tên/SKU). | Admin, Storekeeper | Cao |
| W-AST-02 | Thêm/Sửa/Xóa Thiết bị | Form nhập liệu (Tên, Category, Sê-ri, Hình ảnh). Có field linh hoạt cho Thông số kỹ thuật (Specifications JSON). | Admin | Cao |
| W-AST-03 | Tạo & In mã QR | Hệ thống tự động sinh mã QR duy nhất từ ID/Sê-ri thiết bị để in ra và dán nhãn lên đồ vật thực tế. | Admin, Storekeeper | Cao |
| W-AST-04 | Quản lý Danh mục (Category) | Thêm, sửa, xóa các nhóm thiết bị (VD: Máy ảnh, Laptop, Dây cáp, Tripod) để dễ dàng gom nhóm. | Admin | Trung bình |

### 1.3. Phân hệ Nghiệp vụ Mượn/Trả (Booking Management)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| W-BOK-01 | Danh sách Đơn mượn | Hiển thị các yêu cầu mượn thiết bị theo trạng thái (Chờ duyệt, Đã duyệt, Đang mượn, Đã trả, Từ chối). | Admin, Storekeeper | Cao |
| W-BOK-02 | Phê duyệt/Từ chối | Admin xem chi tiết yêu cầu, lịch trống thiết bị, click "Duyệt" hoặc "Từ chối" (bắt buộc nhập lý do nếu từ chối). | Admin | Cao |
| W-BOK-03 | Giao diện Check-in / Check-out | Giao diện trên máy tính (dự phòng cho app) để thủ kho click xác nhận bàn giao/thu hồi thiết bị thủ công. | Storekeeper | Trung bình |
| W-BOK-04 | Ghi nhận Hỏng hóc | Nếu thiết bị lỗi khi trả, quản lý cập nhật trạng thái "Broken" hoặc "Maintenance", ghi chú tình trạng hư hỏng. | Storekeeper | Trung bình |

### 1.4. Phân hệ Báo cáo & Thống kê (Dashboard & Analytics)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| W-RPT-01 | Dashboard Tổng quan | Biểu đồ (Ant Design Charts): tổng thiết bị, tỷ lệ Đang mượn/Sẵn sàng, thiết bị mượn nhiều nhất. | Admin | Trung bình |
| W-RPT-02 | Báo cáo Quá hạn | Danh sách những người mượn quá hạn. Cung cấp nút để gửi email/thông báo nhắc nhở thủ công nếu cần. | Admin | Cao |
| W-RPT-03 | Xuất báo cáo (Excel/CSV) | Trích xuất dữ liệu lịch sử mượn trả theo thời gian/danh mục/người dùng ra file Excel để báo cáo cấp trên. | Admin | Thấp |

---

## 2. Mobile App (Dành cho Người mượn & Quản lý kho thao tác nhanh)

### 2.1. Phân hệ Tài khoản (Account)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| M-ACC-01 | Đăng nhập/Đăng ký | Sinh viên/thành viên đăng nhập hệ thống, app hỗ trợ lưu phiên bằng Refresh Token ở Secure Storage. | All | Cao |
| M-ACC-02 | Hồ sơ cá nhân | Xem thông tin cá nhân, cập nhật mật khẩu, ảnh đại diện, xem các cảnh báo (nếu có). | All | Trung bình |

### 2.2. Phân hệ Tìm kiếm & Đăng ký mượn (Booking & Search)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| M-BOK-01 | Khám phá thiết bị | Xem danh sách thiết bị theo danh mục, hiển thị huy hiệu trạng thái xanh/đỏ ("Sẵn sàng" hoặc "Đang bận"). | Borrower | Cao |
| M-BOK-02 | Tra cứu Lịch trống | Xem lịch (calendar view) của 1 thiết bị để biết ngày nào trống, chặn không cho user chọn vào ngày đã có người đặt. | Borrower | Cao |
| M-BOK-03 | Tạo đơn mượn | Chọn thiết bị, thời gian bắt đầu, thời gian kết thúc, nhập lý do mượn (Project, sự kiện, v.v...) và gửi yêu cầu. | Borrower | Cao |
| M-BOK-04 | Lịch sử mượn trả cá nhân | Xem danh sách các đơn mượn của chính mình, phân loại tab (Chờ duyệt, Đang mượn, Đã trả, Quá hạn). | Borrower | Cao |

### 2.3. Phân hệ Tương tác Tại kho bằng Camera (On-site Operations)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| M-QR-01 | Quét QR nhận đồ (Check-out) | Storekeeper dùng camera app quét mã QR trên thiết bị để xác nhận giao đồ cho Borrower nhanh chóng. | Storekeeper | Cao |
| M-QR-02 | Quét QR trả đồ (Check-in) | Storekeeper quét QR khi Borrower đem trả. Chọn đánh giá tình trạng vật lý (Tốt/Hư hỏng) và hoàn tất. | Storekeeper | Cao |
| M-QR-03 | Tra cứu thiết bị qua QR | Quét mã QR dán trên thiết bị bất kỳ trong kho để xem ngay thông tin, thông số cấu hình và lịch sử sửa chữa. | All | Trung bình |

### 2.4. Phân hệ Thông báo (Notifications - FCM)
| ID | Chức năng | Mô tả nghiệp vụ chi tiết | Quyền | Ưu tiên |
|---|---|---|---|---|
| M-NOT-01 | Push Notification | Nhận thông báo Realtime lên điện thoại khi đơn được Duyệt, Từ chối, đã Check-out hoặc Check-in. | Borrower | Cao |
| M-NOT-02 | Nhắc nhở hạn trả tự động | Nhận thông báo nhắc nhở 1 ngày trước khi tới hạn trả (Trigger từ Cron jobs của Backend). | Borrower | Cao |
| M-NOT-03 | Cảnh báo Quá hạn | Chuông báo động khi đơn mượn đã bị lố giờ mà chưa đem tới kho trả. | Borrower | Cao |
