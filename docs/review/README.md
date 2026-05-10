# Chức năng đánh giá

## API chính

- `GET /books/{book}/reviews`
- `POST /books/{book}/reviews`
- `PUT /books/{book}/reviews/{review}`
- `DELETE /books/{book}/reviews/{review}`
- `POST /books/{book}/reviews/{review}/reply`
- `PUT /books/{book}/reviews/{review}/replies/{reply}`
- `DELETE /books/{book}/reviews/{review}/replies/{reply}`
- `GET /admin/reviews`
- `GET /admin/reviews/summary`
- `PATCH /admin/reviews/{review}/status`
- `POST /admin/reviews/{review}/reply`
- `POST /admin/reviews/{review}/discussion-replies`
- `DELETE /admin/reviews/{review}/discussion-replies/{reply}`

## Use case

```mermaid
flowchart LR
    user["Người dùng"]
    admin["Quản trị viên"]

    main([Đánh giá])
    list([Xem đánh giá của sách])
    own([Kiểm tra quyền sở hữu])
    verify([Kiểm tra verified purchase])
    create([Viết đánh giá])
    update([Sửa hoặc xóa đánh giá])
    reply([Trả lời thảo luận])
    moderate([Duyệt hoặc từ chối đánh giá])
    adminReply([Phản hồi với tư cách admin])
    summary([Xem tổng hợp đánh giá])
    error([Thông báo lỗi hoặc không đủ quyền])

    user --> main
    admin --> main
    main -.->|"&lt;&lt;include&gt;&gt;"| list
    main -.->|"&lt;&lt;include&gt;&gt;"| own
    main -.->|"&lt;&lt;include&gt;&gt;"| verify
    create -.->|"&lt;&lt;extend&gt;&gt;"| main
    update -.->|"&lt;&lt;extend&gt;&gt;"| main
    reply -.->|"&lt;&lt;extend&gt;&gt;"| main
    moderate -.->|"&lt;&lt;extend&gt;&gt;"| main
    adminReply -.->|"&lt;&lt;extend&gt;&gt;"| main
    summary -.->|"&lt;&lt;extend&gt;&gt;"| main
    error -.->|"&lt;&lt;extend&gt;&gt;"| main
```

## Sequence diagram

```mermaid
%%{init: {"themeVariables": {"fontSize": "14px"}} }%%
sequenceDiagram
    actor User as Người dùng
    actor Admin as Quản trị viên
    participant UI as Frontend/Admin Frontend
    participant API as ReviewController
    participant DB as Reviews/ReviewReplies/Orders/OrderItems

    alt Xem đánh giá của sách
        User->>UI: Mở trang chi tiết sách
        UI->>API: GET /books/{book}/reviews
        API->>DB: Lấy reviews APPROVED của sách
        API-->>UI: Danh sách reviews
    else Viết hoặc sửa đánh giá
        User->>UI: Gửi rating và nội dung
        UI->>API: POST hoặc PUT /books/{book}/reviews
        opt Khi tạo mới
            API->>DB: Kiểm tra verified_purchase từ các đơn đã xác nhận
        end
        API->>DB: Tạo hoặc cập nhật review
        API-->>UI: Review mới nhất
    else Xóa đánh giá hoặc reply của chính mình
        User->>UI: Xác nhận xóa
        UI->>API: DELETE review hoặc review reply
        API->>DB: Kiểm tra quyền sở hữu
        API->>DB: Xóa dữ liệu
        API-->>UI: Kết quả xóa
    else Trả lời thảo luận
        User->>UI: Gửi reply
        UI->>API: POST /books/{book}/reviews/{review}/reply
        API->>DB: Kiểm tra parent reply nếu có
        API->>DB: Tạo review reply
        API-->>UI: Review kèm replies mới nhất
    else Admin kiểm duyệt và phản hồi
        Admin->>UI: Mở màn hình đánh giá
        UI->>API: GET /admin/reviews và GET /admin/reviews/summary
        API-->>UI: Danh sách và số liệu tổng hợp
        alt Duyệt hoặc từ chối
            UI->>API: PATCH /admin/reviews/{review}/status
            API->>DB: Cập nhật status
        else Phản hồi đánh giá hoặc thảo luận
            UI->>API: POST /admin/reviews/{review}/reply hoặc /discussion-replies
            API->>DB: Cập nhật admin_reply hoặc tạo discussion reply
        end
        API-->>UI: Review sau cập nhật
    end
```
