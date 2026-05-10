# Chức năng quản lý đơn hàng

## API chính

- `GET /api/orders/admin`
- `GET /api/orders/admin/{order}`
- `GET /api/orders/admin/{order}/payment-session`
- `PATCH /api/orders/admin/{order}/status`
- `POST /api/orders/admin/{order}/confirm-payment`

## Use case

```mermaid
flowchart LR
    admin["Quản trị viên"]

    main([Quản lý đơn hàng])
    auth([Xác thực JWT và vai trò ADMIN])
    list([Xem danh sách đơn hàng])
    detail([Xem chi tiết đơn hàng])
    sync([Đồng bộ payment session])
    payment([Xem payment session])
    update([Cập nhật trạng thái đơn hàng])
    confirm([Xác nhận đã nhận chuyển khoản])
    cancel([Hủy đơn và hoàn kho])
    error([Thông báo lỗi chuyển trạng thái])

    admin --> main
    main -.->|"&lt;&lt;include&gt;&gt;"| auth
    main -.->|"&lt;&lt;include&gt;&gt;"| list
    main -.->|"&lt;&lt;include&gt;&gt;"| detail
    main -.->|"&lt;&lt;include&gt;&gt;"| sync
    payment -.->|"&lt;&lt;extend&gt;&gt;"| main
    update -.->|"&lt;&lt;extend&gt;&gt;"| main
    confirm -.->|"&lt;&lt;extend&gt;&gt;"| main
    cancel -.->|"&lt;&lt;extend&gt;&gt;"| main
    error -.->|"&lt;&lt;extend&gt;&gt;"| main
```

## Sequence diagram

```mermaid
%%{init: {"themeVariables": {"fontSize": "14px"}} }%%
sequenceDiagram
    actor Admin as Quản trị viên
    participant UI as Admin Frontend
    participant API as OrderController
    participant PSS as PaymentSessionService
    participant DB as Orders/OrderItems/Books/PaymentSessions

    Admin->>UI: Mở màn hình quản lý đơn hàng
    UI->>API: GET /api/orders/admin
    API->>DB: Lấy danh sách orders, items, paymentSessions
    DB-->>API: Orders
    API-->>UI: Danh sách orders
    alt Xem chi tiết đơn
        UI->>API: GET /api/orders/admin/{order}
        API->>DB: Lấy chi tiết order
        API-->>UI: Chi tiết order
    else Xem payment session
        UI->>API: GET /api/orders/admin/{order}/payment-session
        API->>PSS: getOrCreateBankTransferSession(order) nếu cần
        API->>PSS: syncPaymentSession(order) nếu BANK_TRANSFER
        API-->>UI: Order kèm paymentSessions
    else Cập nhật trạng thái
        UI->>API: PATCH /api/orders/admin/{order}/status
        opt Nếu là BANK_TRANSFER
            API->>PSS: syncPaymentSession(order)
        end
        alt Chuyển sang CANCELLED
            API->>DB: Hoàn stock cho các order items
            API->>DB: Cập nhật order = CANCELLED
            API->>DB: Đánh dấu payment sessions = CANCELLED
        else Chuyển sang COMPLETED với COD chưa thu tiền
            API->>DB: Đánh dấu payment_status = PAID
            API->>DB: Cập nhật status mới
        else Chuyển trạng thái hợp lệ khác
            API->>DB: Cập nhật status mới
        end
        API-->>UI: Order sau cập nhật
    else Xác nhận đã nhận chuyển khoản
        UI->>API: POST /api/orders/admin/{order}/confirm-payment
        API->>DB: Cập nhật payment_status = PAID, paid_at, status = CONFIRMED
        API->>PSS: markSucceededForOrder(order, manualReference)
        API-->>UI: Order sau xác nhận thanh toán
    end
```
