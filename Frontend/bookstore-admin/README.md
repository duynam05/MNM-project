# Bookstore Admin App

Đây là frontend quản trị của hệ thống bookstore. Ứng dụng được viết bằng React và Vite, dùng để quản lý dữ liệu vận hành của cửa hàng.

## Chức năng chính

- Dashboard quản trị
- Quản lý sách
- Quản lý người dùng
- Quản lý đơn hàng
- Quản lý đánh giá
- Quản lý cấu hình hệ thống

## Cài đặt và chạy local

```powershell
npm install
npm run dev
```

Ứng dụng chạy local bằng Vite. Cấu hình `base` hiện tại là `/MNM-project/admin/` để phục vụ deploy GitHub Pages.

## Biến môi trường

Tạo file `.env` nếu cần override:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USER_APP_LOGIN_URL=http://127.0.0.1:3000/#/login
```

## Script hỗ trợ

- `npm run dev`: chạy môi trường dev
- `npm run build`: build production
- `npm run lint`: kiểm tra lint
- `npm run preview`: xem bản build local
- `npm run deploy`: deploy GitHub Pages

## Liên kết liên quan

- README gốc của repo: [`../../README.md`](../../README.md)
- Tài liệu chức năng: [`../../docs/README.md`](../../docs/README.md)
