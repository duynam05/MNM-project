# Chức năng quản lý người dùng

## API chính

- `GET /users`
- `POST /users`
- `GET /users/{user}`
- `PUT /users/{user}`
- `PATCH /users/{user}/status`
- `DELETE /users/{user}`
- `GET /roles`
- `POST /roles`
- `GET /permissions`

## Use case

```mermaid
flowchart LR
    admin["Quản trị viên"]

    main([Quản lý người dùng])
    auth([Xác thực JWT và vai trò ADMIN])
    list([Xem danh sách người dùng])
    search([Tìm kiếm và lọc])
    roles([Lấy danh sách vai trò])
    detail([Xem chi tiết người dùng])
    create([Tạo người dùng])
    update([Cập nhật thông tin và vai trò])
    status([Khóa hoặc mở tài khoản])
    delete([Xóa người dùng])
    error([Thông báo lỗi])

    admin --> main
    main -.->|"&lt;&lt;include&gt;&gt;"| auth
    main -.->|"&lt;&lt;include&gt;&gt;"| list
    main -.->|"&lt;&lt;include&gt;&gt;"| search
    main -.->|"&lt;&lt;include&gt;&gt;"| roles
    detail -.->|"&lt;&lt;extend&gt;&gt;"| main
    create -.->|"&lt;&lt;extend&gt;&gt;"| main
    update -.->|"&lt;&lt;extend&gt;&gt;"| main
    status -.->|"&lt;&lt;extend&gt;&gt;"| main
    delete -.->|"&lt;&lt;extend&gt;&gt;"| main
    error -.->|"&lt;&lt;extend&gt;&gt;"| main
```

## Sequence diagram

```mermaid
%%{init: {"themeVariables": {"fontSize": "14px"}} }%%
sequenceDiagram
    actor Admin as Quản trị viên
    participant UI as Admin Frontend
    participant API as UserController
    participant DB as Users/Roles/Permissions

    Admin->>UI: Mở màn hình quản lý người dùng
    UI->>API: GET /users
    API->>DB: Lấy danh sách users
    DB-->>API: Users
    API-->>UI: Danh sách users
    opt Nạp vai trò để hiển thị form
        UI->>API: GET /roles
        API->>DB: Lấy roles
        API-->>UI: Danh sách roles
    end
    alt Tạo người dùng
        UI->>API: POST /users
        API->>DB: Validate dữ liệu
        API->>DB: Tạo user mới
        API->>DB: Đồng bộ roles cho user
        API-->>UI: User đã tạo
    else Cập nhật người dùng
        UI->>API: PUT /users/{user}
        API->>DB: Cập nhật thông tin và roles
        API-->>UI: User đã cập nhật
    else Khóa hoặc mở tài khoản
        UI->>API: PATCH /users/{user}/status
        API->>DB: Cập nhật status ACTIVE hoặc DISABLED
        API-->>UI: User sau cập nhật trạng thái
    else Xóa người dùng
        UI->>API: DELETE /users/{user}
        API->>DB: Xóa user
        API-->>UI: Kết quả xóa
    end
```
