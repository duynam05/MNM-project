# Chức năng thanh toán

## API chính

- `GET /api/orders/{order}/payment-session`
- `POST /api/orders/{order}/payment`
- `GET /api/orders/admin/{order}/payment-session`
- `POST /api/orders/admin/{order}/confirm-payment`
- `POST /api/payments/payos/webhook`

## Use case

```mermaid
flowchart LR
    user["Người dùng"]
    admin["Quản trị viên"]
    payos["payOS"]

    main([Thanh toán])
    session([Lấy hoặc tạo payment session])
    sync([Đồng bộ trạng thái session])
    update([Cập nhật trạng thái thanh toán và đơn hàng])
    online([Thanh toán online])
    manual([Xác nhận chuyển khoản thủ công])
    webhook([Nhận webhook payOS])
    verify([Kiểm tra chữ ký webhook])
    error([Thông báo lỗi thanh toán])

    user --> main
    admin --> main
    payos --> webhook
    main -.->|"&lt;&lt;include&gt;&gt;"| session
    main -.->|"&lt;&lt;include&gt;&gt;"| sync
    main -.->|"&lt;&lt;include&gt;&gt;"| update
    online -.->|"&lt;&lt;extend&gt;&gt;"| main
    manual -.->|"&lt;&lt;extend&gt;&gt;"| main
    webhook -.->|"&lt;&lt;extend&gt;&gt;"| main
    webhook -.->|"&lt;&lt;include&gt;&gt;"| verify
    error -.->|"&lt;&lt;extend&gt;&gt;"| main
```

## Sequence diagram

```mermaid
%%{init: {"themeVariables": {"fontSize": "14px"}} }%%
sequenceDiagram
    actor User as Người dùng
    actor Admin as Quản trị viên
    participant UI as Frontend/Admin Frontend
    participant API as OrderController
    participant PSS as PaymentSessionService
    participant PaySvc as PayOsService
    participant PayOS as payOS
    participant DB as Orders/PaymentSessions

    alt Người dùng lấy payment session
        User->>UI: Mở trang thanh toán đơn
        UI->>API: GET /api/orders/{order}/payment-session
        API->>PSS: getOrCreateBankTransferSession(order) nếu là BANK_TRANSFER
        API->>PSS: syncPaymentSession(order)
        API-->>UI: Order kèm paymentSessions
    else Người dùng thanh toán online
        User->>UI: Chọn thanh toán online
        UI->>API: POST /api/orders/{order}/payment
        API->>DB: Kiểm tra payment_status hiện tại
        API->>DB: Cập nhật payment_method=ONLINE, payment_status=PAID, paid_at, status=CONFIRMED
        API-->>UI: Order sau thanh toán
    else Admin xác nhận đã nhận chuyển khoản
        Admin->>UI: Xác nhận thủ công
        UI->>API: POST /api/orders/admin/{order}/confirm-payment
        API->>DB: Cập nhật payment_status=PAID, status=CONFIRMED
        API->>PSS: markSucceededForOrder(order, manualReference)
        API-->>UI: Order sau xác nhận
    else payOS gọi webhook
        PayOS->>API: POST /api/payments/payos/webhook
        API->>PaySvc: verifyWebhookSignature(payload)
        alt Chữ ký không hợp lệ
            API-->>PayOS: false
        else Hợp lệ
            API->>PSS: findLatestByProviderOrderCode(orderCode)
            API->>DB: Cập nhật order payment_status=PAID, status=CONFIRMED
            API->>PSS: markSucceededFromWebhook(session, data)
            API-->>PayOS: true
        end
    end
```
