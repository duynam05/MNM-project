<?php

namespace App\Support;

use App\Models\InvalidatedToken;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use RuntimeException;

class JwtService
{
    public function issueToken(User $user): string
    {
        $header = [
            'alg' => 'HS512',
            'typ' => 'JWT',
        ];

        $payload = [
            'sub' => $user->email,
            'iss' => config('app.url', 'laravel-api'),
            'iat' => now()->timestamp,
            'exp' => now()->addSeconds($this->validDuration())->timestamp,
            'jti' => (string) Str::uuid(),
            'scope' => $this->buildScope($user),
        ];

        $encodedHeader = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $encodedPayload = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha512', $encodedHeader.'.'.$encodedPayload, $this->signerKey(), true);

        return $encodedHeader.'.'.$encodedPayload.'.'.$this->base64UrlEncode($signature);
    }

    public function introspect(?string $token, bool $allowRefreshWindow = false): array
    {
        if (! $token) {
            throw new RuntimeException('Unauthenticated');
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Unauthenticated');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha512', $encodedHeader.'.'.$encodedPayload, $this->signerKey(), true)
        );

        if (! hash_equals($expectedSignature, $encodedSignature)) {
            throw new RuntimeException('Unauthenticated');
        }

        $payload = json_decode($this->base64UrlDecode($encodedPayload), true);
        if (! is_array($payload)) {
            throw new RuntimeException('Unauthenticated');
        }

        $exp = (int) ($payload['exp'] ?? 0);
        $iat = (int) ($payload['iat'] ?? 0);
        $jti = (string) ($payload['jti'] ?? '');
        $sub = (string) ($payload['sub'] ?? '');

        if ($jti === '' || $sub === '') {
            throw new RuntimeException('Unauthenticated');
        }

        if (InvalidatedToken::query()->whereKey($jti)->exists()) {
            throw new RuntimeException('Unauthenticated');
        }

        $expiresAt = Carbon::createFromTimestampUTC($exp);
        if ($allowRefreshWindow) {
            $expiresAt = Carbon::createFromTimestampUTC($iat)->addSeconds($this->refreshDuration());
        }

        if ($expiresAt->isPast()) {
            throw new RuntimeException('Unauthenticated');
        }

        return $payload;
    }

    public function invalidate(array $payload): void
    {
        $jti = (string) ($payload['jti'] ?? '');
        if ($jti === '') {
            return;
        }

        $exp = (int) ($payload['exp'] ?? now()->timestamp);

        InvalidatedToken::query()->updateOrCreate(
            ['id' => $jti],
            ['expiry_time' => Carbon::createFromTimestampUTC($exp)]
        );
    }

    public function buildScope(User $user): string
    {
        $scopes = [];
        $user->loadMissing('roles.permissions');

        foreach ($user->roles as $role) {
            $scopes[] = 'ROLE_'.$role->name;
            foreach ($role->permissions as $permission) {
                $scopes[] = $permission->name;
            }
        }

        return implode(' ', array_values(array_unique($scopes)));
    }

    private function signerKey(): string
    {
        $key = (string) env('JWT_SIGNER_KEY', '');
        if ($key === '') {
            throw new RuntimeException('JWT_SIGNER_KEY is missing');
        }

        return $key;
    }

    private function validDuration(): int
    {
        return (int) env('JWT_VALID_DURATION', 360000);
    }

    private function refreshDuration(): int
    {
        return (int) env('JWT_REFRESHABLE_DURATION', 36000);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return (string) base64_decode(strtr($value, '-_', '+/'));
    }
}
