<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS message.
     *
     * NOTE: This is a simple placeholder. It just logs the SMS so you can
     * later plug in a real SMS provider like Twilio, MTN, Airtel, etc.
     */
    public static function send(?string $phone, string $message): void
    {
        if (! $phone) {
            return;
        }

        // In production, replace this with a call to your real SMS gateway.
        Log::info('SMS send', [
            'to' => $phone,
            'message' => $message,
        ]);
    }
}
