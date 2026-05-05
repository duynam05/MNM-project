<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/token', [AuthController::class, 'token']);
    Route::post('/introspect', [AuthController::class, 'introspect']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::middleware('auth.jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
});

Route::post('/api/payments/payos/webhook', [OrderController::class, 'payosWebhook']);

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/books/{book}/reviews', [ReviewController::class, 'indexByBook']);

Route::middleware('auth.jwt')->group(function () {
    Route::get('/users/my-info', [UserController::class, 'myInfo']);
    Route::put('/users/me', [UserController::class, 'updateMe']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    Route::post('/api/orders', [OrderController::class, 'store']);
    Route::get('/api/orders', [OrderController::class, 'index']);
    Route::get('/api/orders/{order}', [OrderController::class, 'show'])->whereUuid('order');
    Route::get('/api/orders/{order}/payment-session', [OrderController::class, 'paymentSession'])->whereUuid('order');
    Route::post('/api/orders/{order}/payment', [OrderController::class, 'pay'])->whereUuid('order');
    Route::post('/api/orders/{order}/cancel', [OrderController::class, 'cancel'])->whereUuid('order');

    Route::post('/books/{book}/reviews', [ReviewController::class, 'store']);
    Route::put('/books/{book}/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/books/{book}/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::post('/books/{book}/reviews/{review}/reply', [ReviewController::class, 'replyAsUser']);
    Route::put('/books/{book}/reviews/{review}/replies/{reply}', [ReviewController::class, 'updateReply']);
    Route::delete('/books/{book}/reviews/{review}/replies/{reply}', [ReviewController::class, 'destroyReply']);
});

Route::middleware(['auth.jwt', 'role:ADMIN'])->group(function () {
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles', [RoleController::class, 'index']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);
    Route::post('/books/upload-image', [BookController::class, 'uploadImage']);

    Route::get('/api/orders/admin', [OrderController::class, 'adminIndex']);
    Route::get('/api/orders/admin/{order}', [OrderController::class, 'adminShow'])->whereUuid('order');
    Route::get('/api/orders/admin/{order}/payment-session', [OrderController::class, 'adminPaymentSession'])->whereUuid('order');
    Route::patch('/api/orders/admin/{order}/status', [OrderController::class, 'adminUpdateStatus'])->whereUuid('order');
    Route::post('/api/orders/admin/{order}/confirm-payment', [OrderController::class, 'adminConfirmPayment'])->whereUuid('order');

    Route::get('/admin/settings', [SystemSettingController::class, 'show']);
    Route::put('/admin/settings', [SystemSettingController::class, 'update']);

    Route::get('/admin/reviews', [ReviewController::class, 'adminIndex']);
    Route::get('/admin/reviews/summary', [ReviewController::class, 'summary']);
    Route::patch('/admin/reviews/{review}/status', [ReviewController::class, 'adminUpdateStatus']);
    Route::post('/admin/reviews/{review}/reply', [ReviewController::class, 'adminReply']);
    Route::post('/admin/reviews/{review}/discussion-replies', [ReviewController::class, 'adminDiscussionReply']);
    Route::delete('/admin/reviews/{review}/discussion-replies/{reply}', [ReviewController::class, 'adminDestroyDiscussionReply']);
});
