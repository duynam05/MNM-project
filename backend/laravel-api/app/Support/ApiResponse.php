<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $result = null, ?string $message = null, int $status = 200): JsonResponse
    {
        $payload = [];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if (func_num_args() > 0) {
            $payload['result'] = $result;
        }

        return response()->json($payload, $status);
    }

    public static function error(string $message, int $status = 400, ?array $errors = null): JsonResponse
    {
        $payload = ['message' => $message];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
