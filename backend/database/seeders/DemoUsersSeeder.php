<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Makes the sample customers (@example.com) look more realistic for the Users page:
 * spreads their join dates over the last 4 months and suspends two of them.
 * Development only. Run with: php artisan db:seed --class=DemoUsersSeeder
 * Never touches accounts that aren't @example.com, so your own account is safe.
 */
class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $samples = User::where('email', 'like', '%@example.com')->orderBy('id')->get();

        foreach ($samples as $i => $user) {
            // A few recent sign-ups, the rest spread over the last 120 days
            $joined = $i < 3 ? now()->subDays(rand(0, 6)) : now()->subDays(rand(8, 120));
            $user->forceFill(['created_at' => $joined, 'updated_at' => $joined])->saveQuietly();
        }

        $samples->slice(4, 2)->each(function (User $user) {
            $user->suspended_at = now()->subDays(rand(1, 10));
            $user->saveQuietly();
        });
    }
}
