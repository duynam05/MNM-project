<?php

namespace App\Support;

use App\Models\Order;
use App\Models\PaymentSession;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class PayOsService
{
    public function isEnabledForBankTransfer(): bool
    {
        return $this->enabled() && $this->useForBankTransfer();
    }

    public function createPaymentLink(Order $order, int $providerOrderCode): array
    {
        $description = $this->buildDescription($order);
        $returnUrl = $this->buildReturnUrl($order);
        $cancelUrl = $this->buildCancelUrl($order);
        $amount = (int) round((float) $order->total_price);

        $body = [
            'orderCode' => $providerOrderCode,
            'amount' => $amount,
            'description' => $description,
            'buyerName' => $order->user?->full_name,
            'buyerEmail' => $order->user?->email,
            'buyerPhone' => $order->phone,
            'buyerAddress' => $order->address,
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->title,
                'quantity' => $item->quantity,
                'price' => (int) round((float) $item->price),
                'unit' => 'cuon',
            ])->values()->all(),
            'cancelUrl' => $cancelUrl,
            'returnUrl' => $returnUrl,
            'expiredAt' => now()->timestamp + ($this->expiryMinutes() * 60),
        ];

        $body['signature'] = $this->signCreatePayment(
            $amount,
            $cancelUrl,
            $description,
            $providerOrderCode,
            $returnUrl,
        );

        return $this->client()
            ->post('/v2/payment-requests', $body)
            ->throw()
            ->json();
    }

    public function getPaymentLinkInformation(string $idOrOrderCode): array
    {
        return $this->client()
            ->get("/v2/payment-requests/{$idOrOrderCode}")
            ->throw()
            ->json();
    }

    public function cancelPaymentLink(string $idOrOrderCode, string $cancellationReason): array
    {
        return $this->client()
            ->post("/v2/payment-requests/{$idOrOrderCode}/cancel", [
                'cancellationReason' => $cancellationReason,
            ])
            ->throw()
            ->json();
    }

    public function verifyWebhookSignature(array $payload): bool
    {
        $data = $payload['data'] ?? null;
        $signature = (string) ($payload['signature'] ?? '');

        if (! is_array($data) || $signature === '') {
            return false;
        }

        $normalized = [
            'amount' => $this->normalizeNumberString($data['amount'] ?? null),
            'accountNumber' => $this->defaultString($data['accountNumber'] ?? null),
            'code' => $this->defaultString($data['code'] ?? null),
            'counterAccountBankId' => $this->defaultString($data['counterAccountBankId'] ?? null),
            'counterAccountBankName' => $this->defaultString($data['counterAccountBankName'] ?? null),
            'counterAccountName' => $this->defaultString($data['counterAccountName'] ?? null),
            'counterAccountNumber' => $this->defaultString($data['counterAccountNumber'] ?? null),
            'currency' => $this->defaultString($data['currency'] ?? null),
            'desc' => $this->defaultString($data['desc'] ?? null),
            'description' => $this->defaultString($data['description'] ?? null),
            'orderCode' => $this->defaultString($data['orderCode'] ?? null),
            'paymentLinkId' => $this->defaultString($data['paymentLinkId'] ?? null),
            'reference' => $this->defaultString($data['reference'] ?? null),
            'transactionDateTime' => $this->defaultString($data['transactionDateTime'] ?? null),
            'virtualAccountName' => $this->defaultString($data['virtualAccountName'] ?? null),
            'virtualAccountNumber' => $this->defaultString($data['virtualAccountNumber'] ?? null),
        ];

        return hash_equals(
            strtolower($signature),
            $this->hmacSha256($this->toSortedQueryString($normalized), $this->checksumKey()),
        );
    }

    public function buildQrImageUrl(?PaymentSession $session): string
    {
        if (! $session || blank($session->qr_url)) {
            return '';
        }

        return 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data='.rawurlencode((string) $session->qr_url);
    }

    public function resolveNormalizedStatus(?array $response): string
    {
        return strtoupper(trim((string) data_get($response, 'data.status', '')));
    }

    private function client(): PendingRequest
    {
        $client = Http::baseUrl((string) config('services.payment.payos.base_url'))
            ->acceptJson()
            ->contentType('application/json')
            ->withHeaders([
                'x-client-id' => (string) config('services.payment.payos.client_id'),
                'x-api-key' => (string) config('services.payment.payos.api_key'),
            ]);

        $partnerCode = (string) config('services.payment.payos.partner_code');
        if ($partnerCode !== '') {
            $client = $client->withHeaders(['x-partner-code' => $partnerCode]);
        }

        return $client;
    }

    private function buildDescription(Order $order): string
    {
        return 'DH '.strtoupper(substr(str_replace('-', '', $order->id), 0, 8));
    }

    private function buildReturnUrl(Order $order): string
    {
        return rtrim((string) config('services.payment.payos.return_url_base'), '?&').'?orderId='.$order->id;
    }

    private function buildCancelUrl(Order $order): string
    {
        return rtrim((string) config('services.payment.payos.cancel_url_base'), '?&').'?orderId='.$order->id;
    }

    private function signCreatePayment(
        int $amount,
        string $cancelUrl,
        string $description,
        int $orderCode,
        string $returnUrl,
    ): string {
        $payload = [
            'amount' => (string) $amount,
            'cancelUrl' => $cancelUrl,
            'description' => $description,
            'orderCode' => (string) $orderCode,
            'returnUrl' => $returnUrl,
        ];

        return $this->hmacSha256($this->toSortedQueryString($payload), $this->checksumKey());
    }

    private function toSortedQueryString(array $data): string
    {
        ksort($data);

        return collect($data)
            ->map(fn ($value, $key) => $key.'='.$this->normalizeValue($value))
            ->implode('&');
    }

    private function normalizeValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $normalized = (string) $value;
        if (in_array(strtolower($normalized), ['undefined', 'null'], true)) {
            return '';
        }

        return $normalized;
    }

    private function normalizeNumberString(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        $number = (float) $value;

        if ((float) (int) $number === $number) {
            return (string) (int) $number;
        }

        return rtrim(rtrim(number_format($number, 10, '.', ''), '0'), '.');
    }

    private function defaultString(mixed $value): string
    {
        return $value === null ? '' : (string) $value;
    }

    private function hmacSha256(string $data, string $key): string
    {
        return hash_hmac('sha256', $data, $key);
    }

    private function enabled(): bool
    {
        return (bool) config('services.payment.payos.enabled');
    }

    private function useForBankTransfer(): bool
    {
        return (bool) config('services.payment.payos.use_for_bank_transfer');
    }

    private function expiryMinutes(): int
    {
        return max(1, (int) config('services.payment.payos.expiry_minutes', 15));
    }

    private function checksumKey(): string
    {
        return (string) config('services.payment.payos.checksum_key');
    }
}
