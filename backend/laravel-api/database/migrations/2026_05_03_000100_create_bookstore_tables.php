<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->string('name')->primary();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->string('name')->primary();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->string('role_name');
            $table->string('permission_name');

            $table->primary(['role_name', 'permission_name']);
            $table->foreign('role_name')->references('name')->on('roles')->cascadeOnDelete();
            $table->foreign('permission_name')->references('name')->on('permissions')->cascadeOnDelete();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->string('role_name');
            $table->uuid('user_id');

            $table->primary(['role_name', 'user_id']);
            $table->foreign('role_name')->references('name')->on('roles')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('author');
            $table->string('category')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('rating', 4, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->text('image')->nullable();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('book_id');
            $table->decimal('price', 12, 2);
            $table->string('title');
            $table->text('image')->nullable();
            $table->integer('quantity');
            $table->timestamps();

            $table->unique(['user_id', 'book_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('book_id')->references('id')->on('books')->cascadeOnDelete();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('phone');
            $table->string('address');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->string('status', 32);
            $table->string('payment_method', 32)->nullable();
            $table->string('payment_status', 32)->nullable();
            $table->string('payment_reference', 64)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('book_id');
            $table->decimal('price', 12, 2);
            $table->string('title')->nullable();
            $table->text('image')->nullable();
            $table->integer('quantity');
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('book_id')->references('id')->on('books')->restrictOnDelete();
        });

        Schema::create('payment_session', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->string('provider', 32);
            $table->string('status', 32);
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('reference', 64);
            $table->text('qr_url')->nullable();
            $table->text('payment_url')->nullable();
            $table->string('provider_transaction_id', 64)->nullable();
            $table->unsignedBigInteger('provider_order_code')->nullable()->unique();
            $table->string('provider_payment_link_id', 64)->nullable();
            $table->string('callback_token', 128)->nullable()->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });

        Schema::create('review', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('book_id');
            $table->uuid('user_id');
            $table->integer('rating');
            $table->text('content');
            $table->string('status', 32)->default('APPROVED');
            $table->boolean('verified_purchase')->default(false);
            $table->text('admin_reply')->nullable();
            $table->text('customer_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamp('customer_replied_at')->nullable();
            $table->timestamps();

            $table->foreign('book_id')->references('id')->on('books')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('review_reply', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('review_id');
            $table->uuid('parent_reply_id')->nullable();
            $table->uuid('user_id');
            $table->text('content');
            $table->timestamps();

            $table->foreign('review_id')->references('id')->on('review')->cascadeOnDelete();
            $table->foreign('parent_reply_id')->references('id')->on('review_reply')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('store_name')->default('BookStore');
            $table->string('support_phone')->nullable();
            $table->string('office_address')->nullable();
            $table->boolean('periodic_email')->default(true);
            $table->boolean('stock_alert')->default(true);
            $table->boolean('new_review')->default(false);
            $table->timestamps();
        });

        Schema::create('invalidated_tokens', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->timestamp('expiry_time')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invalidated_tokens');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('review_reply');
        Schema::dropIfExists('review');
        Schema::dropIfExists('payment_session');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('books');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
