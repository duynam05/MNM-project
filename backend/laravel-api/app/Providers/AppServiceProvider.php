<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\User;
use App\Support\AppConstants;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (! Schema::hasTable('roles') || ! Schema::hasTable('users') || ! Schema::hasTable('system_settings')) {
            return;
        }

        Role::query()->firstOrCreate(
            ['name' => AppConstants::ROLE_USER],
            ['description' => 'User role']
        );

        Role::query()->firstOrCreate(
            ['name' => AppConstants::ROLE_ADMIN],
            ['description' => 'Admin role']
        );

        SystemSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'store_name' => 'BookStore',
                'support_phone' => '',
                'office_address' => '',
                'periodic_email' => true,
                'stock_alert' => true,
                'new_review' => false,
            ]
        );

        if (! filter_var(env('APP_BOOTSTRAP_ADMIN_ENABLED', true), FILTER_VALIDATE_BOOL)) {
            return;
        }

        $email = trim((string) env('APP_BOOTSTRAP_ADMIN_EMAIL', ''));
        $password = (string) env('APP_BOOTSTRAP_ADMIN_PASSWORD', '');
        $fullName = trim((string) env('APP_BOOTSTRAP_ADMIN_FULL_NAME', 'Administrator'));

        if ($email === '' || $password === '') {
            return;
        }

        $admin = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'full_name' => $fullName,
                'password' => Hash::make($password),
                'bio' => '',
                'two_factor_enabled' => false,
                'status' => AppConstants::USER_STATUS_ACTIVE,
            ]
        );

        $adminRole = Role::query()->whereKey(AppConstants::ROLE_ADMIN)->first();
        if ($adminRole && ! $admin->roles()->where('name', $adminRole->name)->exists()) {
            $admin->roles()->attach($adminRole->name);
        }
    }
}
