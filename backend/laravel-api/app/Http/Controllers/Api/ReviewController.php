<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Support\ApiData;
use App\Support\AppConstants;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function indexByBook(Book $book)
    {
        $reviews = Review::query()
            ->with(['book', 'user', 'replies.user'])
            ->where('book_id', $book->id)
            ->where('status', AppConstants::REVIEW_STATUS_APPROVED)
            ->orderByDesc('created_at')
            ->get();

        return $this->ok($reviews->map(fn (Review $review) => ApiData::review($review))->values()->all());
    }

    public function store(Request $request, Book $book)
    {
        $payload = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string'],
        ]);

        $user = $this->currentUser($request);

        $review = Review::query()->create([
            'book_id' => $book->id,
            'user_id' => $user->id,
            'rating' => (int) $payload['rating'],
            'content' => trim($payload['content']),
            'status' => AppConstants::REVIEW_STATUS_APPROVED,
            'verified_purchase' => $this->hasVerifiedPurchase($user->id, $book->id),
        ]);

        $review->load(['book', 'user', 'replies.user']);

        return $this->ok(ApiData::review($review));
    }

    public function update(Request $request, Book $book, Review $review)
    {
        $payload = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string'],
        ]);

        $this->assertOwnReview($request, $book, $review);
        $review->update([
            'rating' => (int) $payload['rating'],
            'content' => trim($payload['content']),
        ]);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function destroy(Request $request, Book $book, Review $review)
    {
        $this->assertOwnReview($request, $book, $review);
        $review->delete();

        return $this->ok(null);
    }

    public function replyAsUser(Request $request, Book $book, Review $review)
    {
        $payload = $request->validate([
            'reply' => ['required', 'string'],
            'parentReplyId' => ['nullable', 'exists:review_reply,id'],
        ]);

        if ($review->book_id !== $book->id) {
            abort(404, 'Review not found');
        }

        $this->createReply($request, $review, $payload['reply'], $payload['parentReplyId'] ?? null);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function updateReply(Request $request, Book $book, Review $review, ReviewReply $reply)
    {
        $payload = $request->validate([
            'reply' => ['required', 'string'],
        ]);

        $this->assertOwnReply($request, $book, $review, $reply);
        $reply->update(['content' => trim($payload['reply'])]);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function destroyReply(Request $request, Book $book, Review $review, ReviewReply $reply)
    {
        $this->assertOwnReply($request, $book, $review, $reply);
        $reply->delete();

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function adminIndex(Request $request)
    {
        $reviews = Review::query()
            ->with(['book', 'user', 'replies.user'])
            ->orderByDesc('created_at')
            ->get()
            ->filter(function (Review $review) use ($request) {
                $status = strtoupper(trim((string) $request->query('status', '')));
                if ($status !== '' && $review->status !== $status) {
                    return false;
                }

                $search = trim((string) $request->query('search', ''));
                if ($search === '') {
                    return true;
                }

                $haystack = strtolower(implode(' ', [
                    $review->book?->title,
                    $review->book?->author,
                    $review->book?->category,
                    $review->user?->full_name,
                    $review->user?->email,
                    $review->content,
                    $review->admin_reply,
                    $review->status,
                    $review->replies->map(fn (ReviewReply $reply) => ($reply->user?->full_name ?: $reply->user?->email).' '.$reply->content)->implode(' '),
                ]));

                return str_contains($haystack, strtolower($search));
            })
            ->values();

        return $this->ok($reviews->map(fn (Review $review) => ApiData::review($review))->all());
    }

    public function summary()
    {
        $reviews = Review::query()->get();

        return $this->ok(ApiData::reviewSummary($reviews));
    }

    public function adminUpdateStatus(Request $request, Review $review)
    {
        $payload = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $status = strtoupper(trim($payload['status']));
        if (! in_array($status, [
            AppConstants::REVIEW_STATUS_PENDING,
            AppConstants::REVIEW_STATUS_APPROVED,
            AppConstants::REVIEW_STATUS_REJECTED,
        ], true)) {
            abort(400, 'Invalid review status');
        }

        $review->update(['status' => $status]);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function adminReply(Request $request, Review $review)
    {
        $payload = $request->validate([
            'reply' => ['required', 'string'],
        ]);

        $review->update([
            'admin_reply' => trim($payload['reply']),
            'replied_at' => now(),
            'status' => $review->status === AppConstants::REVIEW_STATUS_PENDING
                ? AppConstants::REVIEW_STATUS_APPROVED
                : $review->status,
        ]);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function adminDiscussionReply(Request $request, Review $review)
    {
        $payload = $request->validate([
            'reply' => ['required', 'string'],
            'parentReplyId' => ['nullable', 'exists:review_reply,id'],
        ]);

        $this->createReply($request, $review, $payload['reply'], $payload['parentReplyId'] ?? null);

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    public function adminDestroyDiscussionReply(Review $review, ReviewReply $reply)
    {
        if ($reply->review_id !== $review->id) {
            abort(404, 'Review not found');
        }

        $reply->delete();

        return $this->ok(ApiData::review($review->fresh(['book', 'user', 'replies.user'])));
    }

    private function createReply(Request $request, Review $review, string $content, ?string $parentReplyId): void
    {
        $parentReply = null;
        if ($parentReplyId) {
            $parentReply = ReviewReply::query()->findOrFail($parentReplyId);
            if ($parentReply->review_id !== $review->id) {
                abort(404, 'Review not found');
            }
        }

        ReviewReply::query()->create([
            'id' => (string) Str::uuid(),
            'review_id' => $review->id,
            'parent_reply_id' => $parentReply?->id,
            'user_id' => $this->currentUser($request)->id,
            'content' => trim($content),
        ]);
    }

    private function hasVerifiedPurchase(string $userId, string $bookId): bool
    {
        return Order::query()
            ->with('items')
            ->where('user_id', $userId)
            ->whereIn('status', [
                AppConstants::ORDER_STATUS_CONFIRMED,
                AppConstants::ORDER_STATUS_SHIPPING,
                AppConstants::ORDER_STATUS_COMPLETED,
            ])
            ->get()
            ->flatMap(fn (Order $order) => $order->items)
            ->contains(fn (OrderItem $item) => $item->book_id === $bookId);
    }

    private function assertOwnReview(Request $request, Book $book, Review $review): void
    {
        if ($review->book_id !== $book->id || $review->user_id !== $this->currentUser($request)->id) {
            abort(404, 'Review not found');
        }
    }

    private function assertOwnReply(Request $request, Book $book, Review $review, ReviewReply $reply): void
    {
        if (
            $review->book_id !== $book->id
            || $reply->review_id !== $review->id
            || $reply->user_id !== $this->currentUser($request)->id
        ) {
            abort(404, 'Review not found');
        }
    }
}
