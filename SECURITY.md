# Security Policy

MNM Project là dự án học tập, nhưng vẫn có các thành phần liên quan đến xác thực, thanh toán và dịch vụ ngoài. Vì vậy các vấn đề bảo mật cần được xử lý cẩn trọng.

## Phạm vi cần lưu ý

- JWT authentication
- Phân quyền admin và user
- Tích hợp payOS
- Upload ảnh qua Cloudinary
- Cấu hình `.env` và secrets deploy

## Cách báo cáo lỗ hổng

- Không mở issue công khai nếu lỗi có thể bị khai thác trực tiếp.
- Chuẩn bị mô tả ngắn gọn gồm:
  - vị trí lỗi
  - mức độ ảnh hưởng
  - bước tái hiện
  - đề xuất giảm thiểu nếu có
- Gửi riêng cho nhóm duy trì repo theo kênh nội bộ đã thống nhất trong môn học.

## Cam kết xử lý

- Xác nhận đã nhận báo cáo trong thời gian hợp lý.
- Đánh giá mức độ ảnh hưởng trước khi công khai chi tiết.
- Ưu tiên vá các lỗi liên quan đến đăng nhập, phân quyền, thanh toán và lộ secrets.

## Nguyên tắc công khai

Chỉ công khai chi tiết kỹ thuật sau khi:

- đã có bản vá hoặc biện pháp giảm thiểu rõ ràng
- không còn nguy cơ lộ khóa thật, dữ liệu thật hoặc đường dẫn nội bộ nhạy cảm
