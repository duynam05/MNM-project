# Bookstore User App

Đây là frontend cho người dùng cuối của hệ thống bookstore. Ứng dụng được viết bằng React và hiện làm việc với backend Laravel trong `backend/laravel-api`.

## Chức năng chính

- Đăng ký, đăng nhập
- Xem danh sách và chi tiết sách
- Thêm vào giỏ hàng
- Checkout và theo dõi đơn hàng
- Xem và cập nhật hồ sơ cá nhân
- Viết và quản lý review sách

## Cài đặt và chạy local

```powershell
npm install
npm start
```

Ứng dụng mặc định chạy ở `http://localhost:3000`.

## Biến môi trường

Tạo file `.env` nếu cần override cấu hình mặc định:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
REACT_APP_ADMIN_APP_URL=http://127.0.0.1:5173
```

## Script hỗ trợ

- `npm start`: chạy môi trường dev
- `npm test`: chạy test
- `npm run build`: build production
- `npm run deploy`: deploy GitHub Pages

## Liên kết liên quan

- README gốc của repo: [`../../README.md`](../../README.md)
- Tài liệu chức năng: [`../../docs/README.md`](../../docs/README.md)
