# Bookstore Laravel Backend

Backend này thay thế `backend/project-web` Spring Boot bằng Laravel, giữ nguyên contract API mà frontend hiện tại đang gọi:

- `auth/*`
- `users/*`
- `roles/*`
- `permissions/*`
- `books/*`
- `cart/*`
- `api/orders/*`
- `admin/settings`
- `admin/reviews/*`

## Cấu trúc

- `app/Http/Controllers/Api`: controller theo nhóm chức năng.
- `app/Http/Middleware`: JWT auth, role check, CORS.
- `app/Models`: model Eloquent cho user, role, book, cart, order, review, settings.
- `app/Support`: helper response, serializer JSON, JWT service, constants.
- `database/migrations`: schema cho bookstore.

## Chạy local

1. Cài dependency:

```powershell
composer install
```

2. Tạo DB và migrate:

```powershell
php artisan migrate
php artisan storage:link
```

3. Chạy API:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

## Tài khoản admin bootstrap

Mặc định trong `.env`:

- Email: `admin@admin.com`
- Password: `12345678`

Laravel sẽ tự tạo role `USER`, `ADMIN`, system settings mặc định và admin bootstrap khi bảng đã tồn tại.

## Frontend local

- `Frontend/bookstore-ui` mặc định gọi `http://127.0.0.1:8000`
- `Frontend/bookstore-admin` mặc định gọi `http://127.0.0.1:8000`
- Admin app mặc định: `http://127.0.0.1:5173`
- User app login mặc định từ admin: `http://127.0.0.1:3000/#/login`

Nếu cần đổi host/port, override bằng:

- User app: `REACT_APP_API_BASE_URL`, `REACT_APP_ADMIN_APP_URL`
- Admin app: `VITE_API_BASE_URL`, `VITE_USER_APP_LOGIN_URL`
