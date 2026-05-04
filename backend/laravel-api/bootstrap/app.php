<?php

use App\Http\Middleware\AuthenticateJwt;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\RequireRole;
use App\Support\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(CorsMiddleware::class);
        $middleware->alias([
            'auth.jwt' => AuthenticateJwt::class,
            'role' => RequireRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $throwable, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($throwable instanceof ValidationException) {
                return ApiResponse::error(
                    $throwable->validator->errors()->first() ?: 'Validation failed',
                    422,
                    $throwable->errors(),
                );
            }

            $status = $throwable instanceof HttpExceptionInterface
                ? $throwable->getStatusCode()
                : 500;

            $message = $throwable->getMessage() !== ''
                ? $throwable->getMessage()
                : ($status >= 500 ? 'Internal server error' : 'Request failed');

            return ApiResponse::error($message, $status);
        });
    })->create();
