# Web Project - Bookstore

## Giới thiệu

Đây là dự án website bán sách gồm 3 phần chính đang được sử dụng trong repo hiện tại:

- `backend/laravel-api`: REST API xây dựng bằng Laravel 12
- `Frontend/bookstore-ui`: giao diện người dùng xây dựng bằng React
- `Frontend/bookstore-admin`: giao diện quản trị xây dựng bằng React + Vite

Hệ thống hỗ trợ các chức năng chính như đăng ký, đăng nhập, quản lý người dùng, sách, giỏ hàng, đơn hàng, thanh toán, đánh giá sách và một số thao tác quản trị.

## Thành viên

| Thành viên | Mã sinh viên |
| --- | --- |
| Trịnh Duy Nam | 23810310255 |
| Phạm Thị Phượng | 23810310265 |

## Công nghệ sử dụng

### Backend

- PHP 8.2
- Laravel 12
- JWT custom authentication
- MySQL
- Composer
- Dockerfile cho deploy
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
- ESLint
- Tailwind CSS

### Hạ tầng và cộng tác

- GitHub Actions
- GitHub Pages
- Render

## Cấu trúc thư mục

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
|-- NGUCANH.md
|-- SECURITY.md
`-- README.md
```

## Chức năng chính

### Người dùng

- Đăng ký, đăng nhập, đăng xuất
- Làm mới token, đổi mật khẩu
- Xem danh sách sách, chi tiết sách
- Thêm vào giỏ hàng, cập nhật số lượng, xóa sản phẩm trong giỏ
- Đặt hàng và chọn phương thức thanh toán
- Xem thông tin tài khoản
- Đánh giá sách và phản hồi thảo luận

### Quản trị

- Xác thực tài khoản `ADMIN`
- Xem dashboard
- Quản lý người dùng
- Quản lý sách
- Quản lý đơn hàng
- Quản lý đánh giá
- Quản lý cấu hình hệ thống

### Backend API

- Xác thực và phân quyền theo role
- CRUD user, role, permission
- CRUD book
- Quản lý giỏ hàng
- Tạo đơn hàng, xem đơn hàng, cập nhật trạng thái đơn hàng
- Tạo payment session và xử lý webhook payOS
- Upload ảnh sách qua Cloudinary

## Một số endpoint chính

API backend mặc định chạy tại:

```text
http://127.0.0.1:8000
```

Một số endpoint tiêu biểu:

- `POST /auth/register`
- `POST /auth/token`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`
- `GET /users`
- `GET /users/my-info`
- `GET /books`
- `GET /books/{book}`
- `POST /books`
- `POST /books/upload-image`
- `GET /cart`
- `POST /cart`
- `PUT /cart/{cartItem}`
- `DELETE /cart/{cartItem}`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/admin`
- `PATCH /api/orders/admin/{order}/status`
- `POST /api/payments/payos/webhook`

## Yêu cầu môi trường

- PHP 8.2+
- Composer 2
- Node.js 18+ và npm
- MySQL 8+ nếu chạy local
- Docker Desktop nếu cần build image backend

## Cấu hình backend

File cấu hình chính:

```text
backend/laravel-api/.env
```

File mẫu cấu hình:

```text
backend/laravel-api/.env.example
```

Một số cấu hình cần chú ý:

- `APP_URL`
- Kết nối MySQL: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SIGNER_KEY`
- Tài khoản admin khởi tạo ban đầu:
  - `APP_BOOTSTRAP_ADMIN_EMAIL`
  - `APP_BOOTSTRAP_ADMIN_PASSWORD`
- Cấu hình Cloudinary nếu cần upload ảnh
- Cấu hình payOS nếu cần bật thanh toán thật

Nếu chạy local, cần bảo đảm database sử dụng đúng tên:

```sql
CREATE DATABASE mybookstore;
```

## Cách chạy backend

### Cách 1: chạy local bằng Artisan

```powershell
cd backend/laravel-api
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Mặc định backend chạy qua cổng `8000`.

### Cách 2: build bằng Dockerfile

Từ thư mục `backend/laravel-api`:

```powershell
docker build -t mnm-laravel-api .
```

Repo hiện có `Dockerfile` và `docker/start.sh` phục vụ deploy backend.

## Cách chạy frontend người dùng

Từ thư mục `Frontend/bookstore-ui`:

```powershell
npm install
npm start
```

Frontend người dùng mặc định chạy tại:

```text
http://localhost:3000
```

Cấu hình API frontend người dùng nằm trong:

```text
Frontend/bookstore-ui/src/config/api.js
```

## Cách chạy frontend quản trị

Từ thư mục `Frontend/bookstore-admin`:

```powershell
npm install
npm run dev
```

Frontend quản trị thường chạy tại:

```text
http://localhost:5173
```

Cấu hình API frontend quản trị nằm trong:

```text
Frontend/bookstore-admin/src/config/api.js
```

## Build và test

### Backend

```powershell
cd backend/laravel-api
php artisan test
```

### Frontend người dùng

```powershell
cd Frontend/bookstore-ui
npm run build
```

### Frontend quản trị

```powershell
cd Frontend/bookstore-admin
npm run lint
npm run build
```

## Tài liệu mã nguồn mở

- [CONTRIBUTING.md](./CONTRIBUTING.md): hướng dẫn đóng góp
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md): quy tắc ứng xử
- [SECURITY.md](./SECURITY.md): quy trình báo cáo lỗi bảo mật
- [LICENSE](./LICENSE): giấy phép sử dụng
- `.github/ISSUE_TEMPLATE`: mẫu tạo issue
- `.github/pull_request_template.md`: mẫu pull request

## Ghi chú

- Backend hiện tại mặc định dùng port `8000`
- Frontend người dùng và frontend quản trị là 2 ứng dụng riêng
- Để đăng nhập vào admin, tài khoản cần có role `ADMIN`
- Nếu chạy local, cần kiểm tra lại cấu hình database, Cloudinary và payOS trước khi chạy
- Tài liệu chức năng hiện nằm trong thư mục [`docs`](./docs/README.md)

## Giấy phép

Dự án phát hành theo giấy phép [MIT](./LICENSE).
