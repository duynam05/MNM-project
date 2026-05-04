<?php

namespace App\Http\Controllers\Api;

use App\Models\Role;
use App\Models\User;
use App\Support\ApiData;
use App\Support\AppConstants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()->with('roles.permissions')->orderBy('created_at')->get();

        return $this->ok($users->map(fn (User $user) => ApiData::user($user))->values()->all());
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'email' => ['required', 'email', 'min:4', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'fullName' => ['nullable', 'string'],
            'dob' => ['nullable', 'date'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::query()->create([
            'id' => (string) Str::uuid(),
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'full_name' => $payload['fullName'] ?? null,
            'dob' => $payload['dob'] ?? null,
            'two_factor_enabled' => false,
            'status' => AppConstants::USER_STATUS_ACTIVE,
        ]);

        $roleNames = $payload['roles'] ?? [AppConstants::ROLE_USER];
        $user->roles()->sync(Role::query()->whereIn('name', $roleNames)->pluck('name')->all());
        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function show(User $user)
    {
        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function myInfo(Request $request)
    {
        $user = $this->currentUser($request);
        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function updateMe(Request $request)
    {
        $payload = $request->validate([
            'fullName' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'twoFactorEnabled' => ['nullable', 'boolean'],
        ]);

        $user = $this->currentUser($request);
        $user->fill([
            'full_name' => $payload['fullName'] ?? $user->full_name,
            'phone' => $payload['phone'] ?? $user->phone,
            'address' => $payload['address'] ?? $user->address,
            'bio' => $payload['bio'] ?? $user->bio,
            'two_factor_enabled' => $payload['twoFactorEnabled'] ?? $user->two_factor_enabled,
        ])->save();

        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function update(Request $request, User $user)
    {
        $payload = $request->validate([
            'password' => ['nullable', 'string', 'min:6'],
            'fullName' => ['nullable', 'string'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->fill([
            'full_name' => $payload['fullName'] ?? $user->full_name,
        ]);

        if (! empty($payload['password'])) {
            $user->password = Hash::make($payload['password']);
        }

        $user->save();

        if (array_key_exists('roles', $payload)) {
            $user->roles()->sync(Role::query()->whereIn('name', $payload['roles'])->pluck('name')->all());
        }

        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function updateStatus(Request $request, User $user)
    {
        $payload = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $status = strtoupper(trim($payload['status']));
        if (! in_array($status, [AppConstants::USER_STATUS_ACTIVE, AppConstants::USER_STATUS_DISABLED], true)) {
            abort(400, 'Invalid user status');
        }

        $user->update(['status' => $status]);
        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function destroy(User $user)
    {
        $user->delete();

        return $this->ok('User has been deleted');
    }
}
