<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSession;
use App\Support\ApiData;
use App\Support\AppConstants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()
            ->with(['user', 'items.book', 'paymentSessions'])
            ->where('user_id', $this->currentUser($request)->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->ok($orders->map(fn (Order $order) => ApiData::order($order))->values()->all());
    }

    public function adminIndex()
    {
        $orders = Order::query()
            ->with(['user', 'items.book', 'paymentSessions'])
            ->orderByDesc('created_at')
            ->get();

        return $this->ok($orders->map(fn (Order $order) => ApiData::order($order))->values()->all());
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'phone' => ['required', 'string'],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'paymentMethod' => ['nullable', 'string'],
        ]);

        $user = $this->currentUser($request);
        $cartItems = CartItem::query()
            ->with('book')
            ->where('user_id', $user->id)
            ->orderBy('created_at')
            ->get();

        if ($cartItems->isEmpty()) {
            abort(400, 'Cart is empty');
        }

        $paymentMethod = $this->normalizePaymentMethod($payload['paymentMethod'] ?? null);

        $order = DB::transaction(function () use ($user, $cartItems, $payload, $paymentMethod) {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'phone' => $payload['phone'],
                'address' => $payload['address'],
                'latitude' => $payload['latitude'] ?? null,
                'longitude' => $payload['longitude'] ?? null,
                'status' => in_array($paymentMethod, [AppConstants::PAYMENT_METHOD_BANK_TRANSFER, AppConstants::PAYMENT_METHOD_ONLINE], true)
                    ? AppConstants::ORDER_STATUS_PENDING_PAYMENT
                    : AppConstants::ORDER_STATUS_PENDING,
                'payment_method' => $paymentMethod,
                'payment_status' => in_array($paymentMethod, [AppConstants::PAYMENT_METHOD_BANK_TRANSFER, AppConstants::PAYMENT_METHOD_ONLINE], true)
                    ? AppConstants::PAYMENT_STATUS_PENDING
                    : AppConstants::PAYMENT_STATUS_UNPAID,
                'total_price' => 0,
            ]);

            $total = 0;

            foreach ($cartItems as $cartItem) {
                $book = Book::query()->findOrFail($cartItem->book_id);
                if ($book->stock === null || $book->stock < $cartItem->quantity) {
                    abort(400, 'Book is out of stock');
                }

                $book->decrement('stock', $cartItem->quantity);

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'book_id' => $book->id,
                    'price' => $book->price,
                    'title' => $cartItem->title,
                    'image' => $cartItem->image,
                    'quantity' => $cartItem->quantity,
                ]);

                $total += (float) $book->price * (int) $cartItem->quantity;
            }

            $order->update([
                'total_price' => round($total, 2),
                'payment_reference' => $paymentMethod === AppConstants::PAYMENT_METHOD_BANK_TRANSFER
                    ? $this->buildReference($order->id)
                    : null,
            ]);

            CartItem::query()->where('user_id', $user->id)->delete();

            return $order->fresh(['user', 'items.book', 'paymentSessions']);
        });

        if ($order->payment_method === AppConstants::PAYMENT_METHOD_BANK_TRANSFER) {
            $this->ensurePaymentSession($order);
            $order->load('paymentSessions');
        }

        return $this->ok(ApiData::order($order));
    }

    public function show(Request $request, Order $order)
    {
        $this->assertUserCanAccess($request, $order);
        $order->load(['user', 'items.book', 'paymentSessions']);

        return $this->ok(ApiData::order($order));
    }

    public function adminShow(Order $order)
    {
        $order->load(['user', 'items.book', 'paymentSessions']);

        return $this->ok(ApiData::order($order));
    }

    public function paymentSession(Request $request, Order $order)
    {
        $this->assertUserCanAccess($request, $order);
        if ($order->payment_method === AppConstants::PAYMENT_METHOD_BANK_TRANSFER) {
            $this->ensurePaymentSession($order);
        }
        $order->load(['user', 'items.book', 'paymentSessions']);

        return $this->ok(ApiData::order($order));
    }

    public function adminPaymentSession(Order $order)
    {
        if ($order->payment_method === AppConstants::PAYMENT_METHOD_BANK_TRANSFER) {
            $this->ensurePaymentSession($order);
        }
        $order->load(['user', 'items.book', 'paymentSessions']);

        return $this->ok(ApiData::order($order));
    }

    public function pay(Request $request, Order $order)
    {
        $this->assertUserCanAccess($request, $order);

        if ($order->payment_status === AppConstants::PAYMENT_STATUS_PAID) {
            abort(400, 'Payment already completed');
        }

        $payload = $request->validate([
            'paymentMethod' => ['nullable', 'string'],
        ]);

        $paymentMethod = $this->normalizePaymentMethod($payload['paymentMethod'] ?? $order->payment_method);
        if ($paymentMethod !== AppConstants::PAYMENT_METHOD_ONLINE) {
            abort(400, 'Payment method is not supported');
        }

        $order->update([
            'payment_method' => $paymentMethod,
            'payment_status' => AppConstants::PAYMENT_STATUS_PAID,
            'payment_reference' => 'PAY-'.strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 12)),
            'paid_at' => now(),
            'status' => in_array($order->status, [AppConstants::ORDER_STATUS_PENDING, AppConstants::ORDER_STATUS_PENDING_PAYMENT], true)
                ? AppConstants::ORDER_STATUS_CONFIRMED
                : $order->status,
        ]);

        return $this->ok(ApiData::order($order->fresh(['user', 'items.book', 'paymentSessions'])));
    }

    public function cancel(Request $request, Order $order)
    {
        $this->assertUserCanAccess($request, $order);
        $this->cancelOrder($order);

        return $this->ok(ApiData::order($order->fresh(['user', 'items.book', 'paymentSessions'])));
    }

    public function adminConfirmPayment(Order $order)
    {
        if ($order->payment_method !== AppConstants::PAYMENT_METHOD_BANK_TRANSFER) {
            abort(400, 'Payment method is not supported');
        }

        if ($order->payment_status === AppConstants::PAYMENT_STATUS_PAID) {
            abort(400, 'Payment already completed');
        }

        $order->update([
            'payment_status' => AppConstants::PAYMENT_STATUS_PAID,
            'paid_at' => now(),
            'status' => in_array($order->status, [AppConstants::ORDER_STATUS_PENDING, AppConstants::ORDER_STATUS_PENDING_PAYMENT], true)
                ? AppConstants::ORDER_STATUS_CONFIRMED
                : $order->status,
            'payment_reference' => $order->payment_reference ?: $this->buildReference($order->id),
        ]);

        $session = $this->ensurePaymentSession($order);
        $session->update([
            'status' => AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED,
            'provider_transaction_id' => 'MANUAL-'.now()->format('YmdHis'),
            'confirmed_at' => now(),
        ]);

        return $this->ok(ApiData::order($order->fresh(['user', 'items.book', 'paymentSessions'])));
    }

    public function adminUpdateStatus(Request $request, Order $order)
    {
        $payload = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $nextStatus = strtoupper(trim($payload['status']));
        $allowed = [
            AppConstants::ORDER_STATUS_PENDING,
            AppConstants::ORDER_STATUS_PENDING_PAYMENT,
            AppConstants::ORDER_STATUS_CONFIRMED,
            AppConstants::ORDER_STATUS_SHIPPING,
            AppConstants::ORDER_STATUS_CANCELLED,
            AppConstants::ORDER_STATUS_COMPLETED,
        ];

        if (! in_array($nextStatus, $allowed, true)) {
            abort(400, 'Invalid order status');
        }

        if ($nextStatus === $order->status) {
            return $this->ok(ApiData::order($order->load(['user', 'items.book', 'paymentSessions'])));
        }

        if (! $this->isTransitionAllowed($order->status, $nextStatus)) {
            abort(400, 'Order status transition is not allowed');
        }

        if (
            $nextStatus === AppConstants::ORDER_STATUS_CONFIRMED
            && $order->payment_method === AppConstants::PAYMENT_METHOD_BANK_TRANSFER
            && $order->payment_status !== AppConstants::PAYMENT_STATUS_PAID
        ) {
            abort(400, 'Order status transition is not allowed');
        }

        if ($nextStatus === AppConstants::ORDER_STATUS_CANCELLED) {
            $this->cancelOrder($order);
        } else {
            if (
                $nextStatus === AppConstants::ORDER_STATUS_COMPLETED
                && $order->payment_method === AppConstants::PAYMENT_METHOD_COD
                && $order->payment_status !== AppConstants::PAYMENT_STATUS_PAID
            ) {
                $order->payment_status = AppConstants::PAYMENT_STATUS_PAID;
                $order->paid_at = $order->paid_at ?: now();
            }

            $order->status = $nextStatus;
            $order->save();
        }

        return $this->ok(ApiData::order($order->fresh(['user', 'items.book', 'paymentSessions'])));
    }

    public function payosWebhook(Request $request)
    {
        $data = $request->input('data', []);
        $orderCode = $data['orderCode'] ?? null;
        $reference = $data['reference'] ?? null;
        $paymentLinkId = $data['paymentLinkId'] ?? null;

        if ($orderCode === null && $reference === null && $paymentLinkId === null) {
            return $this->ok(false);
        }

        $sessionQuery = PaymentSession::query();

        if ($orderCode !== null) {
            $sessionQuery->orWhere('provider_order_code', $orderCode);
        }
        if ($reference !== null) {
            $sessionQuery->orWhere('reference', $reference);
        }
        if ($paymentLinkId !== null) {
            $sessionQuery->orWhere('provider_payment_link_id', $paymentLinkId);
        }

        $session = $sessionQuery->latest('created_at')->first();
        if (! $session) {
            return $this->ok(false);
        }

        $order = $session->order()->first();
        if (! $order) {
            return $this->ok(false);
        }

        if ($order->payment_status !== AppConstants::PAYMENT_STATUS_PAID) {
            $order->update([
                'payment_method' => AppConstants::PAYMENT_METHOD_BANK_TRANSFER,
                'payment_status' => AppConstants::PAYMENT_STATUS_PAID,
                'paid_at' => now(),
                'payment_reference' => $reference ?: $order->payment_reference ?: $this->buildReference($order->id),
                'status' => in_array($order->status, [AppConstants::ORDER_STATUS_PENDING, AppConstants::ORDER_STATUS_PENDING_PAYMENT], true)
                    ? AppConstants::ORDER_STATUS_CONFIRMED
                    : $order->status,
            ]);
        }

        $session->update([
            'status' => AppConstants::PAYMENT_SESSION_STATUS_SUCCEEDED,
            'provider_transaction_id' => $reference ?: $session->provider_transaction_id,
            'provider_payment_link_id' => $paymentLinkId ?: $session->provider_payment_link_id,
            'provider_order_code' => $orderCode ?: $session->provider_order_code,
            'confirmed_at' => now(),
        ]);

        return $this->ok(true);
    }

    private function ensurePaymentSession(Order $order): PaymentSession
    {
        $existing = PaymentSession::query()
            ->where('order_id', $order->id)
            ->whereIn('status', [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING])
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->latest('created_at')
            ->first();

        if ($existing) {
            return $existing;
        }

        return PaymentSession::query()->create([
            'order_id' => $order->id,
            'provider' => 'MANUAL_BANK_QR',
            'status' => AppConstants::PAYMENT_SESSION_STATUS_PENDING,
            'amount' => $order->total_price,
            'reference' => $order->payment_reference ?: $this->buildReference($order->id),
            'qr_url' => $this->buildQrUrl($order),
            'payment_url' => null,
            'provider_transaction_id' => null,
            'provider_order_code' => null,
            'provider_payment_link_id' => null,
            'callback_token' => str_replace('-', '', (string) Str::uuid()),
            'expires_at' => now()->addMinutes((int) env('APP_PAYMENT_BANK_TRANSFER_SESSION_EXPIRY_MINUTES', 15)),
        ]);
    }

    private function buildQrUrl(Order $order): string
    {
        $bankId = env('APP_PAYMENT_BANK_TRANSFER_BANK_ID', '970418');
        $accountNumber = env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_NUMBER', '8860383073');
        $accountHolder = rawurlencode((string) env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_HOLDER', 'TRINH DUY NAM'));
        $amount = (int) round((float) $order->total_price);
        $reference = rawurlencode((string) ($order->payment_reference ?: $this->buildReference($order->id)));

        return "https://img.vietqr.io/image/{$bankId}-{$accountNumber}-compact2.png?amount={$amount}&addInfo={$reference}&accountName={$accountHolder}";
    }

    private function cancelOrder(Order $order): void
    {
        if (! in_array($order->status, [
            AppConstants::ORDER_STATUS_PENDING,
            AppConstants::ORDER_STATUS_PENDING_PAYMENT,
            AppConstants::ORDER_STATUS_CONFIRMED,
        ], true)) {
            abort(400, 'Order cannot be cancelled');
        }

        DB::transaction(function () use ($order) {
            $order->loadMissing('items.book');
            foreach ($order->items as $item) {
                $item->book?->increment('stock', $item->quantity);
            }

            $paymentStatus = match ($order->payment_status) {
                AppConstants::PAYMENT_STATUS_PAID => AppConstants::PAYMENT_STATUS_REFUNDED,
                default => in_array($order->payment_method, [AppConstants::PAYMENT_METHOD_BANK_TRANSFER, AppConstants::PAYMENT_METHOD_ONLINE], true)
                    ? AppConstants::PAYMENT_STATUS_FAILED
                    : AppConstants::PAYMENT_STATUS_UNPAID,
            };

            $order->update([
                'status' => AppConstants::ORDER_STATUS_CANCELLED,
                'payment_status' => $paymentStatus,
            ]);

            PaymentSession::query()
                ->where('order_id', $order->id)
                ->whereIn('status', [AppConstants::PAYMENT_SESSION_STATUS_CREATED, AppConstants::PAYMENT_SESSION_STATUS_PENDING])
                ->update(['status' => AppConstants::PAYMENT_SESSION_STATUS_CANCELLED]);
        });
    }

    private function normalizePaymentMethod(?string $paymentMethod): string
    {
        $normalized = strtoupper(trim((string) ($paymentMethod ?: AppConstants::PAYMENT_METHOD_COD)));
        $allowed = [
            AppConstants::PAYMENT_METHOD_COD,
            AppConstants::PAYMENT_METHOD_BANK_TRANSFER,
            AppConstants::PAYMENT_METHOD_ONLINE,
            'E_WALLET',
        ];

        if (! in_array($normalized, $allowed, true)) {
            abort(400, 'Invalid payment method');
        }

        return $normalized === 'E_WALLET' ? AppConstants::PAYMENT_METHOD_ONLINE : $normalized;
    }

    private function buildReference(string $orderId): string
    {
        return 'DH-'.strtoupper(substr(str_replace('-', '', $orderId), 0, 8));
    }

    private function isTransitionAllowed(string $currentStatus, string $nextStatus): bool
    {
        return match ($currentStatus) {
            AppConstants::ORDER_STATUS_PENDING, AppConstants::ORDER_STATUS_PENDING_PAYMENT
                => in_array($nextStatus, [AppConstants::ORDER_STATUS_CONFIRMED, AppConstants::ORDER_STATUS_CANCELLED], true),
            AppConstants::ORDER_STATUS_CONFIRMED
                => in_array($nextStatus, [AppConstants::ORDER_STATUS_SHIPPING, AppConstants::ORDER_STATUS_CANCELLED], true),
            AppConstants::ORDER_STATUS_SHIPPING
                => $nextStatus === AppConstants::ORDER_STATUS_COMPLETED,
            default => false,
        };
    }

    private function assertUserCanAccess(Request $request, Order $order): void
    {
        if ($order->user_id !== $this->currentUser($request)->id) {
            abort(404, 'Order not found');
        }
    }
}
