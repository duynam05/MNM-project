# Website quản lý và bán sách online N&P

Website bán sách gồm 3 phần chính:

- `backend/laravel-api`: REST API xây dựng bằng Laravel 12
- `Frontend/bookstore-ui`: giao diện người dùng xây dựng bằng React
- `Frontend/bookstore-admin`: giao diện quản trị xây dựng bằng React + Vite

Hệ thống hỗ trợ các chức năng chính như đăng ký, đăng nhập, quản lý sách, giỏ hàng, đặt hàng, thanh toán chuyển khoản, đánh giá sách và quản trị hệ thống.

## 1. Giới thiệu hệ thống

Website quản lý và bán sách online N&P là đồ án web bán sách với mô hình tách riêng backend API, giao diện người dùng và giao diện quản trị. Người dùng có thể duyệt sách, thêm vào giỏ hàng, đặt hàng, thanh toán và đánh giá sản phẩm. Quản trị viên có thể quản lý người dùng, sách, đơn hàng, đánh giá và cấu hình hệ thống.

## 2. Danh sách thành viên

| Họ và tên | MSSV |
| --- | --- |
| Trịnh Duy Nam | 23810310255 |
| Phạm Thị Phượng | 23810310265 |

## 3. Phân công nhiệm vụ cụ thể

Lưu ý: cập nhật lại đúng theo thực tế nhóm trước khi nộp nếu có thay đổi.

| Thành viên | Phụ trách chính | Mức độ đóng góp |
| --- | --- | --- |
| Trịnh Duy Nam | Backend Laravel API, xác thực JWT, giỏ hàng, đơn hàng, thanh toán, tích hợp Cloudinary/payOS, cấu hình deploy | Cập nhật theo thực tế nhóm |
| Phạm Thị Phượng | Frontend người dùng, frontend quản trị, giao diện, luồng thao tác người dùng, tài liệu minh họa và kiểm thử giao diện | Cập nhật theo thực tế nhóm |

## 4. Chức năng chính

### Người dùng

- Đăng ký, đăng nhập, đăng xuất
- Làm mới token, đổi mật khẩu
- Xem danh sách sách, chi tiết sách
- Thêm vào giỏ hàng, cập nhật số lượng, xóa sản phẩm trong giỏ
- Đặt hàng và chọn phương thức thanh toán
- Theo dõi đơn hàng và trạng thái thanh toán
- Xem hồ sơ cá nhân
- Đánh giá sách và thảo luận trong review

### Quản trị

- Xác thực tài khoản `ADMIN`
- Xem dashboard quản trị
- Quản lý người dùng
- Quản lý sách
- Quản lý đơn hàng
- Quản lý đánh giá
- Quản lý cấu hình hệ thống

## 5. Công nghệ sử dụng

### Backend

- PHP 8.2
- Laravel 12
- MySQL
- Composer
- JWT custom authentication
- Cloudinary
- payOS

### Frontend người dùng

- React 18
- React Router DOM
- React Scripts
- Lucide React

### Frontend quản trị

- React
- Vite
- Tailwind CSS
- ESLint

### Hạ tầng và cộng tác

- GitHub
- GitHub Actions
- GitHub Pages
- Render

## 6. Kiến trúc hệ thống

Hệ thống được tách thành 3 khối:

1. `backend/laravel-api`: xử lý xác thực, phân quyền, dữ liệu sách, giỏ hàng, đơn hàng, thanh toán, review
2. `Frontend/bookstore-ui`: giao diện cho khách hàng
3. `Frontend/bookstore-admin`: giao diện quản trị cho admin

Luồng tổng quát:

1. Frontend gửi request tới backend API
2. Backend xác thực JWT nếu route yêu cầu đăng nhập
3. Controller xử lý nghiệp vụ
4. Model thao tác với MySQL
5. Backend trả JSON cho frontend
6. Với thanh toán chuyển khoản, backend tạo `payment_session` và theo dõi trạng thái thanh toán

## 7. Cấu trúc thư mục

```text
MNM-Project/
|-- .github/
|   |-- workflows/
|   |-- ISSUE_TEMPLATE/
|   `-- pull_request_template.md
|-- backend/
|   `-- laravel-api/
|       |-- app/
|       |-- routes/
|       |-- database/
|       |-- Dockerfile
|       `-- composer.json
|-- Frontend/
|   |-- bookstore-ui/
|   `-- bookstore-admin/
|-- docs/
|-- database/
|-- CODE_OF_CONDUCT.md
|-- CONTRIBUTING.md
|-- LICENSE
|-- SECURITY.md
`-- README.md
```

## 8. API và mô hình xử lý dữ liệu

Một số endpoint chính:

- `POST /auth/register`
- `POST /auth/token`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`
- `GET /users/my-info`
- `GET /books`
- `GET /books/{book}`
- `GET /cart`
- `POST /cart`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{order}/payment-session`
- `GET /admin/reviews`
- `POST /api/payments/payos/webhook`

Mô hình dữ liệu chính:

- `users`, `roles`, `permissions`
- `books`
- `cart_items`
- `orders`, `order_items`
- `payment_session`
- `review`, `review_reply`
- `system_settings`
- `invalidated_tokens`

## 9. Hướng dẫn cài đặt

### Yêu cầu môi trường

- PHP 8.2+
- Composer 2+
- Node.js 18+
- npm
- MySQL 8+
- Docker Desktop nếu cần build image backend

### Chuẩn bị database

Tạo database local:

```sql
CREATE DATABASE mybookstore;
```

### Cấu hình backend

File cấu hình chính:

```text
backend/laravel-api/.env
```

File mẫu:

```text
backend/laravel-api/.env.example
```

Các biến quan trọng cần cấu hình:

- `APP_URL`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SIGNER_KEY`
- `APP_BOOTSTRAP_ADMIN_EMAIL`
- `APP_BOOTSTRAP_ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`

## 10. Hướng dẫn chạy project

### Chạy backend

```powershell
cd backend/laravel-api
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Backend mặc định chạy tại:

```text
http://127.0.0.1:8000
```

### Chạy frontend người dùng

```powershell
cd Frontend/bookstore-ui
npm install
npm start
```

Frontend người dùng mặc định chạy tại:

```text
http://localhost:3000
```

### Chạy frontend quản trị

```powershell
cd Frontend/bookstore-admin
npm install
npm run dev
```

Frontend quản trị mặc định chạy tại:

```text
http://localhost:5173
```

### Build nhanh để kiểm tra

```powershell
cd backend/laravel-api
php artisan test
```

```powershell
cd Frontend/bookstore-ui
npm run build
```

```powershell
cd Frontend/bookstore-admin
npm run lint
npm run build
```

## 11. Tài khoản demo

Nếu nhóm chuẩn bị tài khoản demo cố định trước khi nộp, cập nhật tại đây.

Hiện tại hệ thống hỗ trợ 2 cách dùng demo:

- Tài khoản người dùng: có thể tự đăng ký mới qua `POST /auth/register`
- Tài khoản quản trị: được bootstrap từ biến môi trường `APP_BOOTSTRAP_ADMIN_EMAIL` và `APP_BOOTSTRAP_ADMIN_PASSWORD`

Mẫu điền khi nộp:

- `User demo`: cập nhật trước khi nộp
- `Admin demo`: cập nhật trước khi nộp

## 12. Hình ảnh minh họa hệ thống

Thêm ảnh chụp màn hình chính của hệ thống tại đây trước khi nộp. Nên tối thiểu có:

- Trang chủ người dùng
- Trang danh sách sách
- Trang chi tiết sách
- Trang giỏ hàng
- Trang thanh toán/đặt hàng
- Trang quản trị sách
- Trang quản trị đơn hàng
- Trang quản trị review

Mẫu trình bày:

```md
![Trang chủ](duong-dan-anh-trang-chu.png)
![Giỏ hàng](duong-dan-anh-gio-hang.png)
![Quản trị đơn hàng](duong-dan-anh-admin-order.png)
```

## 13. Link video demo

Cập nhật link video demo tại đây trước khi nộp.

- `Video demo`: cập nhật trước khi nộp

## 14. Link online đã deploy

Nếu nhóm đã deploy hệ thống, cập nhật link tại đây.

- `Frontend user`: cập nhật trước khi nộp
- `Frontend admin`: cập nhật trước khi nộp
- `Backend API`: cập nhật trước khi nộp nếu có public endpoint

## 15. Tài liệu tham khảo trong repo

- [docs/README.md](./docs/README.md): danh sách tài liệu chức năng
- [docs/backend-function-deep-dive-vi.md](./docs/backend-function-deep-dive-vi.md): giải thích backend bằng tiếng Việt
- [docs/project-walkthrough.md](./docs/project-walkthrough.md): thuyết minh tổng thể project
- [CONTRIBUTING.md](./CONTRIBUTING.md): hướng dẫn đóng góp
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md): quy tắc ứng xử
- [SECURITY.md](./SECURITY.md): quy trình báo cáo lỗi bảo mật

## 16. Ghi chú

- Backend hiện tại mặc định dùng port `8000`
- Frontend người dùng và frontend quản trị là 2 ứng dụng riêng
- Để đăng nhập vào admin, tài khoản cần có role `ADMIN`
- Nếu chạy local, cần kiểm tra lại cấu hình database, Cloudinary và payOS trước khi demo
- Thanh toán `ONLINE` hiện tại là luồng mô phỏng; nhánh tích hợp thực tế tập trung ở `BANK_TRANSFER`

## 17. Giấy phép

Dự án phát hành theo giấy phép [MIT](./LICENSE).
