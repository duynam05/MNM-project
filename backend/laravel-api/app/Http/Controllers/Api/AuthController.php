<?php

namespace App\Http\Controllers\Api;

use App\Models\InvalidatedToken;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiData;
use App\Support\AppConstants;
use App\Support\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(private readonly JwtService $jwtService)
    {
    }

    public function register(Request $request)
    {
        $payload = $request->validate([
            'email' => ['required', 'email', 'min:4', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'fullName' => ['nullable', 'string'],
            'dob' => ['nullable', 'date'],
        ]);

        $role = Role::query()->whereKey(AppConstants::ROLE_USER)->firstOrFail();

        $user = User::query()->create([
            'id' => (string) Str::uuid(),
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'full_name' => $payload['fullName'] ?? null,
            'dob' => $payload['dob'] ?? null,
            'two_factor_enabled' => false,
            'status' => AppConstants::USER_STATUS_ACTIVE,
        ]);

        $user->roles()->sync([$role->name]);
        $user->load('roles.permissions');

        return $this->ok(ApiData::user($user));
    }

    public function token(Request $request)
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->with('roles.permissions')
            ->where('email', $payload['email'])
            ->firstOrFail();

        if ($user->status === AppConstants::USER_STATUS_DISABLED) {
            abort(401, 'Account is disabled');
        }

        if (! Hash::check($payload['password'], $user->password)) {
            abort(401, 'Unauthenticated');
        }

        return $this->ok([
            'token' => $this->jwtService->issueToken($user),
            'authenticated' => true,
        ]);
    }

    public function introspect(Request $request)
    {
        try {
            $this->jwtService->introspect($request->input('token'));
            return $this->ok(['valid' => true]);
        } catch (\Throwable) {
            return $this->ok(['valid' => false]);
        }
    }

    public function refresh(Request $request)
    {
        $payload = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $decoded = $this->jwtService->introspect($payload['token'], true);
        $this->jwtService->invalidate($decoded);

        $user = User::query()
            ->with('roles.permissions')
            ->where('email', $decoded['sub'])
            ->firstOrFail();

        if ($user->status === AppConstants::USER_STATUS_DISABLED) {
            abort(401, 'Account is disabled');
        }

        return $this->ok([
            'token' => $this->jwtService->issueToken($user),
            'authenticated' => true,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->input('token') ?: $request->bearerToken();
        if ($token) {
            try {
                $payload = $this->jwtService->introspect($token, true);
                $this->jwtService->invalidate($payload);
            } catch (\Throwable) {
                // Ignore already invalid or expired tokens to match Spring behavior.
            }
        }

        return $this->ok(null);
    }

    public function changePassword(Request $request)
    {
        $payload = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:6'],
        ]);

        $user = $this->currentUser($request);

        if (! Hash::check($payload['currentPassword'], $user->password)) {
            abort(400, 'Current password is invalid');
        }

        $user->update([
            'password' => Hash::make($payload['newPassword']),
        ]);

        InvalidatedToken::query()
            ->where('expiry_time', '<', now())
            ->delete();

        return $this->ok(null);
    }
}
