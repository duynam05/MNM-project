<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CloudinaryService
{
    public function uploadImage(UploadedFile $file, ?string $folder = null): ?array
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            $timestamp = now()->timestamp;
            $payload = [
                'folder' => $this->folder($folder),
                'timestamp' => (string) $timestamp,
            ];

            $payload = array_filter($payload, fn (mixed $value) => filled($value));
            $signature = $this->sign($payload);
            $url = sprintf(
                'https://api.cloudinary.com/v1_1/%s/image/upload',
                $this->cloudName(),
            );

            $response = Http::timeout(60)
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post($url, array_merge($payload, [
                    'api_key' => $this->apiKey(),
                    'signature' => $signature,
                ]));

            if (! $response->successful()) {
                Log::warning('Cloudinary upload failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return null;
            }

            return [
                'url' => $response->json('secure_url') ?: $response->json('url'),
                'publicId' => $response->json('public_id'),
                'assetId' => $response->json('asset_id'),
            ];
        } catch (\Throwable $throwable) {
            Log::warning('Cloudinary upload exception', [
                'message' => $throwable->getMessage(),
            ]);
            return null;
        }
    }

    public function isConfigured(): bool
    {
        return $this->cloudName() !== '' && $this->apiKey() !== '' && $this->apiSecret() !== '';
    }

    private function cloudName(): string
    {
        return (string) config('services.cloudinary.cloud_name', '');
    }

    private function apiKey(): string
    {
        return (string) config('services.cloudinary.api_key', '');
    }

    private function apiSecret(): string
    {
        return (string) config('services.cloudinary.api_secret', '');
    }

    private function folder(?string $folder): string
    {
        $resolved = trim((string) ($folder ?: config('services.cloudinary.folder', '')));

        return $resolved;
    }

    private function sign(array $payload): string
    {
        ksort($payload);

        $query = collect($payload)
            ->map(fn (mixed $value, string $key) => $key.'='.$this->normalizeValue($value))
            ->implode('&');

        return hash_hmac('sha1', $query, $this->apiSecret());
    }

    private function normalizeValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $normalized = (string) $value;
        if (in_array(Str::lower($normalized), ['undefined', 'null'], true)) {
            return '';
        }

        return $normalized;
    }
}
