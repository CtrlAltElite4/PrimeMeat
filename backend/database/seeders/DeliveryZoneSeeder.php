<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class DeliveryZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [1, 0, 142.85, 200],
            [2, 142.85, 285.70, 300],
            [3, 285.70, 428.55, 400],
            [4, 428.55, 571.40, 500],
            [5, 571.40, 714.25, 600],
            [6, 714.25, 857.09, 700],
            [7, 857.09, 999.94, 800],
            [8, 999.94, 1142.79, 900],
            [9, 1142.79, 1285.64, 1000],
            [10, 1285.64, 1428.49, 1100],
            [11, 1428.49, 1571.34, 1200],
        ];

        foreach ($zones as [$number, $minimum, $maximum, $fee]) {
            DeliveryZone::updateOrCreate(
                ['zone_number' => $number],
                [
                    'min_distance_km' => $minimum,
                    'max_distance_km' => $maximum,
                    'normal_fee' => $fee,
                    'is_active' => true,
                ]
            );
        }

    }
}
