<?php

namespace App\Support;

use App\Models\Book;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSession;
use App\Models\Permission;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Collection;

class ApiData
{
    public static function permission(Permission $permission): array
    {
        return [
            'name' => $permission->name,
            'description' => $permission->description,
        ];
    }

    public static function role(Role $role): array
    {
        return [
            'name' => $role->name,
            'description' => $role->description,
            'permissions' => $role->permissions->map(fn (Permission $permission) => self::permission($permission))->values()->all(),
        ];
    }

    public static function user(User $user): array
    {
        $user->loadMissing('roles.permissions');

        return [
            'id' => $user->id,
            'email' => $user->email,
            'fullName' => $user->full_name,
            'dob' => optional($user->dob)?->toDateString(),
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'twoFactorEnabled' => (bool) $user->two_factor_enabled,
            'status' => $user->status,
            'roles' => $user->roles->map(fn (Role $role) => self::role($role))->values()->all(),
        ];
    }

    public static function cartItem(CartItem $item): array
    {
        $unitPrice = (float) $item->price;
        $quantity = (int) $item->quantity;

        return [
            'id' => $item->id,
            'bookId' => $item->book_id,
            'title' => $item->title,
            'image' => $item->image,
            'unitPrice' => $item->price,
            'quantity' => $quantity,
            'lineTotal' => round($unitPrice * $quantity, 2),
            'availableStock' => $item->book?->stock,
        ];
    }

    public static function cart(Collection $items): array
    {
        $serialized = $items->map(fn (CartItem $item) => self::cartItem($item))->values();

        return [
            'items' => $serialized->all(),
            'totalItems' => $serialized->count(),
            'totalQuantity' => $serialized->sum('quantity'),
            'totalPrice' => round($serialized->sum('lineTotal'), 2),
        ];
    }

    public static function paymentSession(?PaymentSession $session): ?array
    {
        if (! $session) {
            return null;
        }

        return [
            'sessionId' => $session->id,
            'provider' => $session->provider,
            'status' => $session->status,
            'amount' => $session->amount,
            'reference' => $session->reference,
            'bankName' => env('APP_PAYMENT_BANK_TRANSFER_BANK_NAME', 'BIDV'),
            'accountNumber' => env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_NUMBER', '8860383073'),
            'accountHolder' => env('APP_PAYMENT_BANK_TRANSFER_ACCOUNT_HOLDER', 'TRINH DUY NAM'),
            'qrUrl' => $session->qr_url,
            'paymentUrl' => $session->payment_url,
            'providerTransactionId' => $session->provider_transaction_id,
            'providerOrderCode' => $session->provider_order_code,
            'providerPaymentLinkId' => $session->provider_payment_link_id,
            'expiresAt' => optional($session->expires_at)?->toISOString(),
            'confirmedAt' => optional($session->confirmed_at)?->toISOString(),
            'createdAt' => optional($session->created_at)?->toISOString(),
        ];
    }

    public static function orderItem(OrderItem $item): array
    {
        $price = (float) $item->price;
        $quantity = (int) $item->quantity;

        return [
            'id' => $item->id,
            'bookId' => $item->book_id,
            'title' => $item->title,
            'image' => $item->image,
            'quantity' => $quantity,
            'price' => $item->price,
            'lineTotal' => round($price * $quantity, 2),
        ];
    }

    public static function order(Order $order, ?PaymentSession $session = null): array
    {
        $order->loadMissing(['user.roles.permissions', 'items.book']);

        $customerName = $order->user?->full_name ?: $order->user?->email;

        return [
            'orderId' => $order->id,
            'customerId' => $order->user?->id,
            'customerEmail' => $order->user?->email,
            'customerName' => $customerName,
            'totalPrice' => $order->total_price,
            'status' => $order->status,
            'phone' => $order->phone,
            'address' => $order->address,
            'latitude' => $order->latitude,
            'longitude' => $order->longitude,
            'paymentMethod' => $order->payment_method,
            'paymentStatus' => $order->payment_status,
            'paymentReference' => $order->payment_reference,
            'paymentSession' => self::paymentSession($session ?? $order->paymentSessions->sortByDesc('created_at')->first()),
            'createdAt' => optional($order->created_at)?->toISOString(),
            'paidAt' => optional($order->paid_at)?->toISOString(),
            'items' => $order->items->map(fn (OrderItem $item) => self::orderItem($item))->values()->all(),
        ];
    }

    public static function setting(SystemSetting $setting): array
    {
        return [
            'storeName' => $setting->store_name,
            'supportPhone' => $setting->support_phone,
            'officeAddress' => $setting->office_address,
            'periodicEmail' => (bool) $setting->periodic_email,
            'stockAlert' => (bool) $setting->stock_alert,
            'newReview' => (bool) $setting->new_review,
        ];
    }

    public static function review(Review $review): array
    {
        $review->loadMissing(['book', 'user', 'replies.user', 'replies.children.user']);

        $reviewer = $review->user?->full_name ?: $review->user?->email;

        return [
            'id' => $review->id,
            'bookId' => $review->book_id,
            'title' => $review->book?->title,
            'author' => $review->book?->author,
            'category' => $review->book?->category,
            'image' => $review->book?->image,
            'reviewerId' => $review->user_id,
            'reviewer' => $reviewer,
            'rating' => (int) $review->rating,
            'content' => $review->content,
            'status' => $review->status,
            'verifiedPurchase' => (bool) $review->verified_purchase,
            'adminReply' => $review->admin_reply,
            'customerReply' => $review->customer_reply,
            'replies' => self::buildReplyTree($review->replies),
            'createdAt' => optional($review->created_at)?->toISOString(),
            'repliedAt' => optional($review->replied_at)?->toISOString(),
            'customerRepliedAt' => optional($review->customer_replied_at)?->toISOString(),
        ];
    }

    public static function reviewSummary(Collection $reviews): array
    {
        $total = $reviews->count();
        $replied = $reviews->filter(fn (Review $review) => filled($review->admin_reply))->count();

        return [
            'averageRating' => $total > 0 ? round($reviews->avg('rating') ?? 0, 1) : 0,
            'totalReviews' => $total,
            'pendingReviews' => $reviews->where('status', AppConstants::REVIEW_STATUS_PENDING)->count(),
            'responseRate' => $total > 0 ? (int) round(($replied * 100) / $total) : 0,
        ];
    }

    private static function buildReplyTree(Collection $replies): array
    {
        $grouped = $replies
            ->sortBy('created_at')
            ->groupBy(fn (ReviewReply $reply) => $reply->parent_reply_id ?: 'root');

        $build = function ($parentId) use (&$build, $grouped): array {
            return collect($grouped->get($parentId, []))
                ->map(function (ReviewReply $reply) use (&$build) {
                    $userName = $reply->user?->full_name ?: $reply->user?->email;

                    return [
                        'id' => $reply->id,
                        'userId' => $reply->user_id,
                        'userName' => $userName,
                        'parentReplyId' => $reply->parent_reply_id,
                        'content' => $reply->content,
                        'createdAt' => optional($reply->created_at)?->toISOString(),
                        'replies' => $build($reply->id),
                    ];
                })
                ->values()
                ->all();
        };

        return $build('root');
    }
}
