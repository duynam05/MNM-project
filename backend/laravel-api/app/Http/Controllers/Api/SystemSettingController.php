<?php

namespace App\Http\Controllers\Api;

use App\Models\SystemSetting;
use App\Support\ApiData;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function show()
    {
        return $this->ok(ApiData::setting(SystemSetting::query()->findOrFail(1)));
    }

    public function update(Request $request)
    {
        $payload = $request->validate([
            'storeName' => ['nullable', 'string'],
            'supportPhone' => ['nullable', 'string'],
            'officeAddress' => ['nullable', 'string'],
            'periodicEmail' => ['nullable', 'boolean'],
            'stockAlert' => ['nullable', 'boolean'],
            'newReview' => ['nullable', 'boolean'],
        ]);

        $setting = SystemSetting::query()->findOrFail(1);
        $setting->fill([
            'store_name' => $payload['storeName'] ?? $setting->store_name,
            'support_phone' => $payload['supportPhone'] ?? $setting->support_phone,
            'office_address' => $payload['officeAddress'] ?? $setting->office_address,
            'periodic_email' => $payload['periodicEmail'] ?? $setting->periodic_email,
            'stock_alert' => $payload['stockAlert'] ?? $setting->stock_alert,
            'new_review' => $payload['newReview'] ?? $setting->new_review,
        ])->save();

        return $this->ok(ApiData::setting($setting));
    }
}
