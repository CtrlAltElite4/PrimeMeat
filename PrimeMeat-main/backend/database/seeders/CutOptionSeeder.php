<?php

namespace Database\Seeders;

use App\Models\CutOption;
use Illuminate\Database\Seeder;

class CutOptionSeeder extends Seeder
{
    public function run(): void
    {
        $frontCuts = [
            'Brisket',
            'Chuck',
            'Short Ribs',
            'Rib Steak',
            'Rib Eye',
            'Prime Rib',
            'Stew Meat',
            'Soup Shanks',
            'Soup Bones',
        ];

        $hindCuts = [
            'T-Bone',
            'Sirloin',
            'Rump Steak',
            'Leg Roasts',
            'Ground Beef',
            'Soup Bones',
        ];

        foreach ($frontCuts as $cut) {
            CutOption::create([
                'name' => $cut,
                'quarter' => 'front',
                'is_mandatory' => $cut === 'Soup Bones',
            ]);
        }

        foreach ($hindCuts as $cut) {
            CutOption::create([
                'name' => $cut,
                'quarter' => 'hind',
                'is_mandatory' => $cut === 'Soup Bones',
            ]);
        }
    }
}
