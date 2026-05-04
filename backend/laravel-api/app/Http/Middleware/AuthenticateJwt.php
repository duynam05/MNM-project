<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\ApiResponse;
use App\Support\AppConstants;
use App\Support\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    public function __construct(private readonly JwtService $jwtService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        try {
            $payload = $this->jwtService->introspect($token);
        } catch (\Throwable) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        $user = User::query()
            ->with(['roles.permissions'])
            ->where('email', $payload['sub'] ?? '')
            ->first();

        if (! $user || $user->status === AppConstants::USER_STATUS_DISABLED) {
            return ApiResponse::error('Account is disabled', 401);
        }

        $request->attributes->set('jwt_payload', $payload);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
