<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\CartItem;
use App\Support\ApiData;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $items = $this->queryItems($request);

        return $this->ok(ApiData::cart($items));
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'bookId' => ['required', 'exists:books,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $book = Book::query()->findOrFail($payload['bookId']);
        $quantity = (int) $payload['quantity'];
        if ($book->stock === null || $quantity > $book->stock) {
            abort(400, 'Book is out of stock');
        }

        $user = $this->currentUser($request);
        $item = CartItem::query()->firstOrNew([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);

        $nextQuantity = ($item->exists ? (int) $item->quantity : 0) + $quantity;
        if ($book->stock === null || $nextQuantity > $book->stock) {
            abort(400, 'Book is out of stock');
        }

        $item->fill([
            'id' => $item->id ?: (string) Str::uuid(),
            'price' => $book->price,
            'title' => $book->title,
            'image' => $book->image,
            'quantity' => $nextQuantity,
        ])->save();

        return $this->ok(ApiData::cart($this->queryItems($request)));
    }

    public function update(Request $request, CartItem $cartItem)
    {
        $payload = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $this->assertOwnership($request, $cartItem);
        if ($cartItem->book->stock === null || (int) $payload['quantity'] > $cartItem->book->stock) {
            abort(400, 'Book is out of stock');
        }

        $cartItem->update(['quantity' => (int) $payload['quantity']]);

        return $this->ok(ApiData::cart($this->queryItems($request)));
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        $this->assertOwnership($request, $cartItem);
        $cartItem->delete();

        return $this->ok(ApiData::cart($this->queryItems($request)));
    }

    public function clear(Request $request)
    {
        CartItem::query()->where('user_id', $this->currentUser($request)->id)->delete();

        return $this->ok(ApiData::cart(collect()));
    }

    private function queryItems(Request $request)
    {
        return CartItem::query()
            ->with('book')
            ->where('user_id', $this->currentUser($request)->id)
            ->orderBy('created_at')
            ->get();
    }

    private function assertOwnership(Request $request, CartItem $cartItem): void
    {
        if ($cartItem->user_id !== $this->currentUser($request)->id) {
            abort(404, 'Cart item not found');
        }

        $cartItem->loadMissing('book');
    }
}
