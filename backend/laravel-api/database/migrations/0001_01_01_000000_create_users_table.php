<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->date('dob')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('status', 32)->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
