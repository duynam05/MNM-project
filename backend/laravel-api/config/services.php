<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'payment' => [
        'bank_transfer' => [
            'bank_id' => env('APP_PAYMENT_BANK_TRANSFER_BANK_ID', '970418'),
            'bank_name' => env('APP_PAYMENT_BANK_TRANSFER_BANK_NAME', 'BIDV'),
            'account_number' => env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_NUMBER', '8860383073'),
            'account_holder' => env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_HOLDER', 'TRINH DUY NAM'),
            'session_expiry_minutes' => (int) env('APP_PAYMENT_BANK_TRANSFER_SESSION_EXPIRY_MINUTES', 15),
        ],
        'payos' => [
            'enabled' => filter_var(env('APP_PAYMENT_PAYOS_ENABLED', false), FILTER_VALIDATE_BOOL),
            'use_for_bank_transfer' => filter_var(env('APP_PAYMENT_PAYOS_USE_FOR_BANK_TRANSFER', false), FILTER_VALIDATE_BOOL),
            'environment' => env('APP_PAYMENT_PAYOS_ENVIRONMENT', 'production'),
            'base_url' => env('APP_PAYMENT_PAYOS_BASE_URL', 'https://api-merchant.payos.vn'),
            'client_id' => env('PAYOS_CLIENT_ID', ''),
            'api_key' => env('PAYOS_API_KEY', ''),
            'checksum_key' => env('PAYOS_CHECKSUM_KEY', ''),
            'partner_code' => env('PAYOS_PARTNER_CODE', ''),
            'webhook_url' => env('APP_PAYMENT_PAYOS_WEBHOOK_URL', ''),
            'return_url_base' => env('APP_PAYMENT_PAYOS_RETURN_URL_BASE', ''),
            'cancel_url_base' => env('APP_PAYMENT_PAYOS_CANCEL_URL_BASE', ''),
            'expiry_minutes' => (int) env('APP_PAYMENT_PAYOS_EXPIRY_MINUTES', 15),
            'sync_enabled' => filter_var(env('APP_PAYMENT_PAYOS_SYNC_ENABLED', true), FILTER_VALIDATE_BOOL),
            'sync_fixed_delay_ms' => (int) env('APP_PAYMENT_PAYOS_SYNC_FIXED_DELAY_MS', 30000),
            'sync_batch_size' => (int) env('APP_PAYMENT_PAYOS_SYNC_BATCH_SIZE', 25),
            'cancel_on_order_cancel' => filter_var(env('APP_PAYMENT_PAYOS_CANCEL_ON_ORDER_CANCEL', true), FILTER_VALIDATE_BOOL),
        ],
    ],

];
