<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        $hasRole = $user->roles->contains(fn ($item) => strtoupper((string) $item->name) === strtoupper($role));
        if (! $hasRole) {
            return ApiResponse::error('Forbidden', 403);
        }

        return $next($request);
    }
}
