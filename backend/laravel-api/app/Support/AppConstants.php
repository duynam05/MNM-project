<?php

namespace App\Support;

class AppConstants
{
    public const ROLE_USER = 'USER';
    public const ROLE_ADMIN = 'ADMIN';

    public const USER_STATUS_ACTIVE = 'ACTIVE';
    public const USER_STATUS_DISABLED = 'DISABLED';

    public const ORDER_STATUS_PENDING = 'PENDING';
    public const ORDER_STATUS_PENDING_PAYMENT = 'PENDING_PAYMENT';
    public const ORDER_STATUS_CONFIRMED = 'CONFIRMED';
    public const ORDER_STATUS_SHIPPING = 'SHIPPING';
    public const ORDER_STATUS_CANCELLED = 'CANCELLED';
    public const ORDER_STATUS_COMPLETED = 'COMPLETED';

    public const PAYMENT_METHOD_COD = 'COD';
    public const PAYMENT_METHOD_BANK_TRANSFER = 'BANK_TRANSFER';
    public const PAYMENT_METHOD_ONLINE = 'ONLINE';
    public const PAYMENT_PROVIDER_PAYOS = 'PAYOS';
    public const PAYMENT_PROVIDER_MANUAL_BANK_QR = 'MANUAL_BANK_QR';

    public const PAYMENT_STATUS_UNPAID = 'UNPAID';
    public const PAYMENT_STATUS_PENDING = 'PENDING';
    public const PAYMENT_STATUS_PAID = 'PAID';
    public const PAYMENT_STATUS_FAILED = 'FAILED';
    public const PAYMENT_STATUS_REFUNDED = 'REFUNDED';

    public const REVIEW_STATUS_PENDING = 'PENDING';
    public const REVIEW_STATUS_APPROVED = 'APPROVED';
    public const REVIEW_STATUS_REJECTED = 'REJECTED';

    public const PAYMENT_SESSION_STATUS_CREATED = 'CREATED';
    public const PAYMENT_SESSION_STATUS_PENDING = 'PENDING';
    public const PAYMENT_SESSION_STATUS_SUCCEEDED = 'SUCCEEDED';
    public const PAYMENT_SESSION_STATUS_CANCELLED = 'CANCELLED';
    public const PAYMENT_SESSION_STATUS_EXPIRED = 'EXPIRED';
}
