<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
        } else {
            $response = $next($request);
        }

        $origin = $request->headers->get('Origin');
        $allowedOrigins = array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '*'))));
        $allowOrigin = '*';

        if ($origin && $allowedOrigins !== ['*'] && in_array($origin, $allowedOrigins, true)) {
            $allowOrigin = $origin;
        } elseif ($origin && $allowedOrigins === ['*']) {
            $allowOrigin = $origin;
        }

        $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        return $response;
    }
}
