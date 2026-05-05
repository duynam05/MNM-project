<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Support\PaymentSessionService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('payments:sync-payos', function (PaymentSessionService $paymentSessionService) {
    $count = $paymentSessionService->syncPendingPayOsSessions();
    $this->info("Synced {$count} pending payOS session(s).");
})->purpose('Sync pending payOS payment sessions');

Schedule::command('payments:sync-payos')->everyThirtySeconds();
