# Contributing Guide

Cảm ơn bạn đã quan tâm đến MNM Project. Tài liệu này mô tả cách đóng góp để repo giữ được chất lượng và phù hợp với bối cảnh môn học Phần mềm mã nguồn mở.

## Nguyên tắc chung

- Tôn trọng phạm vi hiện tại của dự án: bookstore với 2 frontend React và 1 backend Laravel.
- Ưu tiên thay đổi nhỏ, rõ mục đích và dễ review.
- Không đưa secrets thật vào repo.
- Không sửa lớn API contract nếu chưa đánh giá ảnh hưởng đến frontend.

## Quy trình đề xuất thay đổi

1. Kiểm tra issue hiện có để tránh trùng lặp.
2. Nếu là bug hoặc đề xuất mới, tạo issue trước khi sửa.
3. Tạo branch riêng từ `main`.
4. Thực hiện thay đổi và tự kiểm tra lại.
5. Mở pull request theo template của repo.

## Quy ước branch

- `docs/...` cho tài liệu
- `feat/...` cho tính năng mới
- `fix/...` cho sửa lỗi
- `refactor/...` cho cải tổ cấu trúc hoặc mã nguồn
- `chore/...` cho việc bảo trì

Ví dụ:

- `docs/root-readme`
- `fix/order-admin-route`
- `feat/payos-webhook-hardening`

## Quy ước commit

Khuyến khích dùng Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

Ví dụ:

- `docs: add root repository readme`
- `fix: constrain admin order routes to uuid`

## Yêu cầu trước khi mở pull request

- README hoặc tài liệu liên quan đã được cập nhật nếu hành vi thay đổi.
- Không còn lỗi cú pháp hiển nhiên.
- Đã chạy các lệnh kiểm tra phù hợp với phần mình sửa:
  - Backend Laravel: `php artisan test`
  - Frontend user: `npm test` hoặc ít nhất `npm run build`
  - Frontend admin: `npm run lint` và `npm run build`

## Chuẩn tài liệu

- Viết rõ mục tiêu thay đổi và tác động của thay đổi.
- Nếu thêm biến môi trường, phải cập nhật `.env.example` hoặc tài liệu cấu hình.
- Nếu thay đổi luồng nghiệp vụ chính, nên cập nhật tài liệu trong `docs/`.

## Những điều không nên làm

- Commit file cấu hình chứa khóa thật của payOS, Cloudinary hoặc DB production.
- Trộn nhiều mục tiêu không liên quan trong cùng một pull request.
- Xóa hoặc phá vỡ logic cũ mà không ghi rõ lý do và phạm vi ảnh hưởng.

## Thắc mắc

Nếu chưa chắc một thay đổi có phù hợp hay không, hãy mở issue thảo luận trước khi code.
