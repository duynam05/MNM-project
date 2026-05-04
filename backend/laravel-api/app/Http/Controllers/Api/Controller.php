<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Controller extends BaseController
{
    protected function ok(mixed $result = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return ApiResponse::success($result, $message, $status);
    }

    protected function currentUser(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
