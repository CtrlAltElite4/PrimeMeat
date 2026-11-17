<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * PayFast helpers: building the signed payment form, and checking ITNs
 * (Instant Transaction Notifications) that PayFast sends after a payment.
 * Docs: https://developers.payfast.co.za/docs
 */
class PayFast
{
    private const VALID_HOSTS = ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za'];

    public static function processUrl(): string
    {
        return self::base().'/eng/process';
    }

    private static function base(): string
    {
        return config('services.payfast.sandbox') ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
    }

    /**
     * Adds the signature to the form fields. Fields must already be in PayFast's
     * documented order; empty fields are left out.
     */
    public static function sign(array $fields): array
    {
        $fields = array_filter($fields, fn ($v) => $v !== null && $v !== '');
        $pairs = [];
        foreach ($fields as $key => $value) {
            $pairs[] = $key.'='.urlencode(trim((string) $value));
        }

        $string = implode('&', $pairs);
        $passphrase = config('services.payfast.passphrase');
        if ($passphrase) {
            $string .= '&passphrase='.urlencode(trim($passphrase));
        }

        $fields['signature'] = md5($string);

        return $fields;
    }

    /** The ITN fields in the order received, up to (not including) the signature. */
    public static function itnParamString(array $data): string
    {
        $pairs = [];
        foreach ($data as $key => $value) {
            if ($key === 'signature') {
                break;
            }
            $pairs[] = $key.'='.urlencode(stripslashes((string) $value));
        }

        return implode('&', $pairs);
    }

    /** Check 1: the signature matches, so the data wasn't changed. */
    public static function validSignature(array $data, string $paramString): bool
    {
        $passphrase = config('services.payfast.passphrase');
        $check = $passphrase ? $paramString.'&passphrase='.urlencode(trim($passphrase)) : $paramString;

        return isset($data['signature']) && hash_equals(md5($check), (string) $data['signature']);
    }

    /** Check 2: the request really came from a PayFast server. */
    public static function validSourceIp(Request $request): bool
    {
        $ip = $request->ip();
        if (config('services.payfast.trust_forwarded_ip') && $request->header('X-Forwarded-For')) {
            // Behind a tunnel like ngrok the real sender is in this header (local testing only)
            $ip = trim(explode(',', $request->header('X-Forwarded-For'))[0]);
        }

        $valid = [];
        foreach (self::VALID_HOSTS as $host) {
            $valid = array_merge($valid, gethostbynamel($host) ?: []);
        }

        return in_array($ip, array_unique($valid), true);
    }

    /** Check 3: the amount paid matches what we charged. */
    public static function validAmount(float $expected, $received): bool
    {
        return abs($expected - (float) $received) <= 0.01;
    }

    /**
     * Check 4: ask PayFast directly to confirm the ITN is genuine.
     * Throws if PayFast can't be reached, so the caller can ask PayFast to retry.
     */
    public static function confirmWithServer(string $paramString): bool
    {
        $response = Http::timeout(15)
            ->withBody($paramString, 'application/x-www-form-urlencoded')
            ->post(self::base().'/eng/query/validate');

        $response->throw();

        return trim($response->body()) === 'VALID';
    }
}
