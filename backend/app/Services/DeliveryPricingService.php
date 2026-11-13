<?php

namespace App\Services;

use RuntimeException;

class DeliveryPricingService
{
    private ?array $postalCodes = null;

    public function calculate(string $postalCode, float $subtotal): array
    {
        $postalCode = trim($postalCode);

        if (ctype_digit($postalCode) && strlen($postalCode) < 4) {
            $postalCode = str_pad($postalCode, 4, '0', STR_PAD_LEFT);
        }

        if (! preg_match('/^\d{4}$/', $postalCode)) {
            return [
                'eligible' => false,
                'requires_manual_quote' => true,
                'delivery_fee' => null,
                'message' => 'Please provide a valid four-digit postal code.',
            ];
        }

        if ($subtotal < config('delivery.minimum_order')) {
            return [
                'eligible' => false,
                'requires_manual_quote' => false,
                'delivery_fee' => null,
                'message' => 'Your order must be at least R2,500 to qualify for delivery.',
            ];
        }

        $postalCodeData = $this->findPostalCode($postalCode);

        if (
            ! $postalCodeData ||
            $postalCodeData['requires_manual_quote'] ||
            ! $postalCodeData['zone_number']
        ) {
            return [
                'eligible' => false,
                'requires_manual_quote' => true,
                'delivery_fee' => null,
                'message' => 'Delivery pricing for this postal code requires a manual quote.',
            ];
        }

        $zoneNumber = (int) $postalCodeData['zone_number'];
        $fee = config("delivery.zones.{$zoneNumber}");

        if ($fee === null) {
            throw new RuntimeException(
                "Delivery fee not configured for zone {$zoneNumber}."
            );
        }

        $fee = (float) $fee;

        if (
            $fee < config('delivery.minimum_fee') ||
            $fee > config('delivery.maximum_fee')
        ) {
            throw new RuntimeException(
                "Delivery fee for zone {$zoneNumber} is outside the permitted range."
            );
        }

        return [
            'eligible' => true,
            'requires_manual_quote' => false,
            'postal_code' => $postalCode,
            'zone_number' => $zoneNumber,
            'distance_km' => (float) $postalCodeData['distance_km'],
            'delivery_fee' => $fee,
            'message' => 'Delivery is available for this postal code.',
        ];
    }

    private function findPostalCode(string $postalCode): ?array
    {
        if ($this->postalCodes === null) {
            $this->loadPostalCodes();
        }

        return $this->postalCodes[$postalCode] ?? null;
    }

    private function loadPostalCodes(): void
    {
        $path = storage_path('app/data/postal_codes.csv');

        if (! file_exists($path)) {
            throw new RuntimeException('Postal code data file not found.');
        }

        $file = fopen($path, 'r');

        if (! $file) {
            throw new RuntimeException('Unable to open postal code data file.');
        }

        try {
            $headers = fgetcsv($file, 0, ',', '"', '');

            if (! $headers) {
                throw new RuntimeException('Postal code data file is empty.');
            }

            $this->postalCodes = [];

            while (($row = fgetcsv($file, 0, ',', '"', '')) !== false) {
                if (count($row) !== count($headers)) {
                    continue;
                }

                $record = array_combine($headers, $row);

                $this->postalCodes[$record['code']] = [
                    'zone_number' => $record['zone_number'] !== ''
                        ? (int) $record['zone_number']
                        : null,
                    'distance_km' => $record['distance_km'],
                    'requires_manual_quote' => filter_var(
                        $record['requires_manual_quote'],
                        FILTER_VALIDATE_BOOLEAN
                    ),
                ];
            }
        } finally {
            fclose($file);
        }
    }
}
