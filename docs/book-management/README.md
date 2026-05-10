# Chức năng quản lý sách

## API chính

- `GET /books`
- `GET /books/{book}`
- `POST /books`
- `PUT /books/{book}`
- `DELETE /books/{book}`
- `POST /books/upload-image`

## Use case

```mermaid
flowchart LR
    admin["Quản trị viên"]

    main([Quản lý sách])
    auth([Xác thực JWT và vai trò ADMIN])
    list([Xem danh sách sách])
    filter([Tìm kiếm, lọc và sắp xếp])
    validate([Validate dữ liệu sách])
    create([Thêm sách])
    update([Cập nhật sách])
    delete([Xóa sách])
    upload([Upload ảnh sách])
    error([Thông báo lỗi])

    admin --> main
    main -.->|"&lt;&lt;include&gt;&gt;"| auth
    main -.->|"&lt;&lt;include&gt;&gt;"| list
    main -.->|"&lt;&lt;include&gt;&gt;"| filter
    main -.->|"&lt;&lt;include&gt;&gt;"| validate
    create -.->|"&lt;&lt;extend&gt;&gt;"| main
    update -.->|"&lt;&lt;extend&gt;&gt;"| main
    delete -.->|"&lt;&lt;extend&gt;&gt;"| main
    upload -.->|"&lt;&lt;extend&gt;&gt;"| main
    error -.->|"&lt;&lt;extend&gt;&gt;"| main
```

## Sequence diagram

```mermaid
%%{init: {"themeVariables": {"fontSize": "14px"}} }%%
sequenceDiagram
    actor Admin as Quản trị viên
    participant UI as Admin Frontend
    participant API as BookController
    participant Media as Cloudinary/Storage
    participant DB as Books

    Admin->>UI: Mở màn hình quản lý sách
    UI->>API: GET /books?page=0&size=50&sort=title_asc
    API->>DB: Truy vấn danh sách sách
    DB-->>API: Danh sách sách
    API-->>UI: Dữ liệu sách
    alt Upload ảnh trước khi lưu
        UI->>API: POST /books/upload-image
        API->>Media: Upload ảnh
        alt Cloudinary thành công
            Media-->>API: URL ảnh
        else Chưa cấu hình Cloudinary
            API->>Media: Lưu file local
            Media-->>API: URL local
        end
        API-->>UI: URL ảnh
    end
    alt Thêm sách
        UI->>API: POST /books
        API->>DB: Validate và tạo sách
        API-->>UI: Sách đã tạo
    else Cập nhật sách
        UI->>API: PUT /books/{book}
        API->>DB: Validate và cập nhật sách
        API-->>UI: Sách đã cập nhật
    else Xóa sách
        UI->>API: DELETE /books/{book}
        API->>DB: Xóa sách
        API-->>UI: Kết quả xóa
    end
```
