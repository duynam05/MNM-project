<?php

namespace App\Support;

use App\Models\Order;
use App\Models\PaymentSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentSessionService
{
    public function __construct(private readonly PayOsService $payOsService)
    {
    }

    public function getOrCreateBankTransferSession(Order $order): PaymentSession
    {
        $session = $this->findLatestForOrder($order->id);

        if ($this->isReusablePendingSession($session)) {
            return $session;
        }

        return $this->createBankTransferSession($order);
    }

    public function findLatestForOrder(string $orderId): ?PaymentSession
    {
        return PaymentSession::query()
            ->where('order_id', $orderId)
            ->latest('created_at')
            ->first();
    }

    public function findLatestByOrderIds(array $orderIds): array
    {
        if ($orderIds === []) {
            return [];
        }

        return PaymentSession::query()
            ->whereIn('order_id', $orderIds)
            ->orderByDesc('created_at')
            ->get()
            ->unique('order_id')
            ->keyBy('order_id')
            ->all();
    }

    public function findLatestByProviderOrderCode(?int $providerOrderCode): ?PaymentSession
    {
        if ($providerOrderCode === null) {
            return null;
        }

        return PaymentSession::query()
            ->where('provider_order_code', $providerOrderCode)
            ->latest('created_at')
            ->first();
    }

    public function findPendingPayOsSessions(int $batchSize): Collection
    {
        return PaymentSession::query()
            ->with('order')
            ->where('provider', AppConstants::PAYMENT_PROVIDER_PAYOS)
            ->whereIn('status', [
                AppConstants::PAYMENT_SESSION_STATUS_CREATED,
                AppConstants::PAYMENT_SESSION_STATUS_PENDING,
            ])
            ->orderBy('created_at')
            ->limit(max(1, $batchSize))
            ->get();
    }

    public function markSucceededForOrder(Order $order, string $providerTransactionId): PaymentSession
    {
        $session = $this->getOrCreateBankTransferSession($order);
        $session->update([
            'status' => AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED,
            'provider_transaction_id' => $providerTransactionId,
            'confirmed_at' => now(),
        ]);

        return $session->fresh();
    }

    public function markSucceededFromWebhook(PaymentSession $session, array $data): PaymentSession
    {
        $session->update([
            'status' => AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED,
            'provider_transaction_id' => $data['reference'] ?? $session->provider_transaction_id,
            'provider_payment_link_id' => $data['paymentLinkId'] ?? $session->provider_payment_link_id,
            'confirmed_at' => now(),
        ]);

        return $session->fresh();
    }

    public function syncPaymentSession(Order $order): ?PaymentSession
    {
        $session = $this->findLatestForOrder($order->id);
        if (! $session) {
            return null;
        }

        if ($session->provider !== AppConstants::PAYMENT_PROVIDER_PAYOS) {
            if (
                in_array($session->status, [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING], true)
                && $session->expires_at
                && $session->expires_at->isPast()
            ) {
                $session->update(['status' => AppConstants::PAYMENT_SESSION_STATUS_EXPIRED]);
                return $session->fresh();
            }

            return $session;
        }

        if (! in_array($session->status, [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING], true)) {
            return $session;
        }

        $lookupId = $session->provider_payment_link_id ?: (string) $session->provider_order_code;
        $response = $this->payOsService->getPaymentLinkInformation($lookupId);
        $status = $this->payOsService->resolveNormalizedStatus($response);

        Log::info('payOS payment link info', [
            'orderId' => $order->id,
            'providerOrderCode' => $session->provider_order_code,
            'payosStatus' => $status,
        ]);

        switch ($status) {
            case 'PAID':
                $session->status = AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED;
                $session->confirmed_at = now();
                if ($order->payment_status !== AppConstants::PAYMENT_STATUS_PAID) {
                    $order->payment_method = AppConstants::PAYMENT_METHOD_BANK_TRANSFER;
                    $order->payment_status = AppConstants::PAYMENT_STATUS_PAID;
                    $order->paid_at = $order->paid_at ?: now();
                    if (in_array($order->status, [AppConstants::ORDER_STATUS_PENDING, AppConstants::ORDER_STATUS_PENDING_PAYMENT], true)) {
                        $order->status = AppConstants::ORDER_STATUS_CONFIRMED;
                    }
                    $order->save();
                }
                break;
            case 'CANCELLED':
                $session->status = AppConstants::PAYMENT_SESSION_STATUS_CANCELLED;
                break;
            case 'PROCESSING':
                $session->status = AppConstants::PAYMENT_SESSION_STATUS_PENDING;
                break;
            case 'PENDING':
                $session->status = $session->expires_at && $session->expires_at->isPast()
                    ? AppConstants::PAYMENT_SESSION_STATUS_EXPIRED
                    : AppConstants::PAYMENT_SESSION_STATUS_PENDING;
                break;
            default:
                Log::info('payOS payment link returned unsupported status', [
                    'status' => $status,
                    'sessionId' => $session->id,
                ]);
        }

        $session->save();

        return $session->fresh();
    }

    public function cancelSession(Order $order, string $reason): ?PaymentSession
    {
        $session = $this->findLatestForOrder($order->id);
        if (! $session) {
            return null;
        }

        if (! in_array($session->status, [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING], true)) {
            return $session;
        }

        if (
            $session->provider !== AppConstants::PAYMENT_PROVIDER_PAYOS
            || ! (bool) config('services.payment.payos.cancel_on_order_cancel')
        ) {
            $session->update(['status' => AppConstants::PAYMENT_SESSION_STATUS_CANCELLED]);
            return $session->fresh();
        }

        $lookupId = $session->provider_payment_link_id ?: (string) $session->provider_order_code;
        $response = $this->payOsService->cancelPaymentLink($lookupId, $reason);
        $status = $this->payOsService->resolveNormalizedStatus($response);

        Log::info('payOS cancel payment link', [
            'orderId' => $order->id,
            'providerOrderCode' => $session->provider_order_code,
            'payosStatus' => $status,
        ]);

        if ($status === 'PAID') {
            $session->update([
                'status' => AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED,
                'confirmed_at' => now(),
            ]);
            return $session->fresh();
        }

        $session->update(['status' => AppConstants::PAYMENT_SESSION_STATUS_CANCELLED]);

        return $session->fresh();
    }

    public function syncPendingPayOsSessions(): int
    {
        if (! (bool) config('services.payment.payos.sync_enabled')) {
            return 0;
        }

        $sessions = $this->findPendingPayOsSessions((int) config('services.payment.payos.sync_batch_size', 25));
        foreach ($sessions as $session) {
            try {
                if ($session->order) {
                    $this->syncPaymentSession($session->order);
                }
            } catch (\Throwable $throwable) {
                Log::warning('payOS scheduler failed to sync session', [
                    'sessionId' => $session->id,
                    'orderId' => $session->order_id,
                    'message' => $throwable->getMessage(),
                ]);
            }
        }

        return $sessions->count();
    }

    private function isReusablePendingSession(?PaymentSession $session): bool
    {
        if (! $session) {
            return false;
        }

        if (! in_array($session->status, [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING], true)) {
            return false;
        }

        return ! $session->expires_at || $session->expires_at->isFuture();
    }

    private function createBankTransferSession(Order $order): PaymentSession
    {
        if ($this->payOsService->isEnabledForBankTransfer()) {
            return $this->createPayOsSession($order);
        }

        return PaymentSession::query()->create($this->manualBankTransferPayload($order));
    }

    private function createPayOsSession(Order $order): PaymentSession
    {
        $providerOrderCode = $this->generateProviderOrderCode();
        $response = $this->payOsService->createPaymentLink($order->loadMissing(['user', 'items.book']), $providerOrderCode);
        $data = $response['data'] ?? [];

        $intermediate = new PaymentSession([
            'provider_order_code' => $providerOrderCode,
            'provider_payment_link_id' => $data['paymentLinkId'] ?? null,
            'qr_url' => $data['qrCode'] ?? '',
        ]);

        return PaymentSession::query()->create([
            'order_id' => $order->id,
            'provider' => AppConstants::PAYMENT_PROVIDER_PAYOS,
            'status' => AppConstants::PAYMENT_SESSION_STATUS_PENDING,
            'amount' => $order->total_price,
            'reference' => $order->payment_reference,
            'qr_url' => $this->payOsService->buildQrImageUrl($intermediate),
            'payment_url' => $data['checkoutUrl'] ?? null,
            'provider_transaction_id' => null,
            'provider_order_code' => $providerOrderCode,
            'provider_payment_link_id' => $data['paymentLinkId'] ?? null,
            'callback_token' => str_replace('-', '', (string) Str::uuid()),
            'expires_at' => now()->addMinutes((int) config('services.payment.payos.expiry_minutes', 15)),
        ]);
    }

    private function manualBankTransferPayload(Order $order): array
    {
        $reference = (string) $order->payment_reference;
        $amount = (int) round((float) $order->total_price);
        $bankId = (string) config('services.payment.bank_transfer.bank_id', '970418');
        $accountNumber = (string) config('services.payment.bank_transfer.account_number', '8860383073');
        $accountHolder = rawurlencode((string) config('services.payment.bank_transfer.account_holder', 'TRINH DUY NAM'));

        return [
            'order_id' => $order->id,
            'provider' => AppConstants::PAYMENT_PROVIDER_MANUAL_BANK_QR,
            'status' => AppConstants::PAYMENT_SESSION_STATUS_PENDING,
            'amount' => $order->total_price,
            'reference' => $reference,
            'qr_url' => "https://img.vietqr.io/image/{$bankId}-{$accountNumber}-compact2.png?amount={$amount}&addInfo={$reference}&accountName={$accountHolder}",
            'payment_url' => null,
            'provider_transaction_id' => null,
            'provider_order_code' => null,
            'provider_payment_link_id' => null,
            'callback_token' => str_replace('-', '', (string) Str::uuid()),
            'expires_at' => now()->addMinutes((int) config('services.payment.bank_transfer.session_expiry_minutes', 15)),
        ];
    }

    private function generateProviderOrderCode(): int
    {
        do {
            $candidate = ((int) floor(microtime(true) * 1000)) + random_int(100, 999);
        } while (PaymentSession::query()->where('provider_order_code', $candidate)->exists());

        return $candidate;
    }
}
