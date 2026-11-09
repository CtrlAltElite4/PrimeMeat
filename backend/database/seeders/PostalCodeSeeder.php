<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use App\Models\PostalCode;
use Illuminate\Database\Seeder;
use RuntimeException;

class PostalCodeSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/postal_codes.csv');

        if (! file_exists($path)) {
            throw new RuntimeException('Postal code CSV file not found.');
        }

        $zones = DeliveryZone::pluck('id', 'zone_number');

        $file = fopen($path, 'r');

        fgetcsv($file);

        $batch = [];

        while (($row = fgetcsv($file)) !== false) {
            [
                $code,
                $placeName,
                $latitude,
                $longitude,
                $distance,
                $zoneNumber,
                $manualQuote,
            ] = $row;

            $batch[] = [
                'code' => $code,
                'place_name' => $placeName ?: null,
                'latitude' => $latitude !== '' ? $latitude : null,
                'longitude' => $longitude !== '' ? $longitude : null,
                'distance_km' => $distance !== '' ? $distance : null,
                'delivery_zone_id' => $zoneNumber !== ''
                    ? ($zones[$zoneNumber] ?? null)
                    : null,
                'requires_manual_quote' => (bool) $manualQuote,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) === 500) {
                PostalCode::upsert(
                    $batch,
                    ['code'],
                    [
                        'place_name',
                        'latitude',
                        'longitude',
                        'distance_km',
                        'delivery_zone_id',
                        'requires_manual_quote',
                        'updated_at',
                    ]
                );

                $batch = [];
            }
        }

        if ($batch) {
            PostalCode::upsert(
                $batch,
                ['code'],
                [
                    'place_name',
                    'latitude',
                    'longitude',
                    'distance_km',
                    'delivery_zone_id',
                    'requires_manual_quote',
                    'updated_at',
                ]
            );
        }

        fclose($file);
    }
}
