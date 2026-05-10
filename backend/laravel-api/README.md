# Bookstore Laravel Backend

Đây là backend Laravel 12 của hệ thống bookstore. Mục tiêu của phần này là thay thế backend Spring Boot cũ trong `backend/project-web` nhưng vẫn giữ API contract càng gần càng tốt để frontend không phải sửa lớn.

## API chính

Backend hiện phục vụ các nhóm API:

- `auth/*`
- `users/*`
- `roles/*`
- `permissions/*`
- `books/*`
- `cart/*`
- `api/orders/*`
- `admin/settings`
- `admin/reviews/*`
- `api/payments/payos/webhook`

## Cấu trúc đáng chú ý

- `app/Http/Controllers/Api`: controller theo nhóm chức năng
- `app/Http/Middleware`: JWT auth, kiểm tra role, CORS
- `app/Models`: model Eloquent cho các thực thể chính
- `app/Support`: `JwtService`, `ApiResponse`, `PayOsService`, `PaymentSessionService`
- `routes/api.php`: định nghĩa route API
- `routes/console.php`: command và scheduler
- `database/migrations`: schema của hệ thống

## Cài đặt và chạy local

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

## Cấu hình môi trường

Các nhóm cấu hình quan trọng:

- App URL: `APP_URL`
- Database: `DB_*`
- Cloudinary:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_FOLDER`
- payOS:
  - `APP_PAYMENT_PAYOS_ENABLED`
  - `APP_PAYMENT_PAYOS_USE_FOR_BANK_TRANSFER`
  - `PAYOS_CLIENT_ID`
  - `PAYOS_API_KEY`
  - `PAYOS_CHECKSUM_KEY`
  - `PAYOS_PARTNER_CODE`
  - `APP_PAYMENT_PAYOS_WEBHOOK_URL`
  - `APP_PAYMENT_PAYOS_RETURN_URL_BASE`
  - `APP_PAYMENT_PAYOS_CANCEL_URL_BASE`

## Script hữu ích

- `php artisan test`: chạy test backend
- `php artisan route:list`: kiểm tra route
- `php artisan payments:sync-payos`: đồng bộ payment session đang pending
- `php artisan schedule:work`: chạy scheduler local

## Tích hợp với frontend

- `Frontend/bookstore-ui` mặc định gọi `http://127.0.0.1:8000`
- `Frontend/bookstore-admin` mặc định gọi `http://127.0.0.1:8000`

Nếu thay đổi host hoặc port backend, cần cập nhật env của từng frontend:

- User app: `REACT_APP_API_BASE_URL`, `REACT_APP_ADMIN_APP_URL`
- Admin app: `VITE_API_BASE_URL`, `VITE_USER_APP_LOGIN_URL`

## Ghi chú

- Backend này đang là backend chính cho local và deploy.
- Spring Boot cũ vẫn được giữ lại để đối chiếu nghiệp vụ khi cần parity.
- Thông tin chi tiết cấp repo xem tại [`../../README.md`](../../README.md).
