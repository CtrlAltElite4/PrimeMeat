<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    protected $signature = 'admin:make {email : Email of an existing account} {--revoke : Remove admin access instead}';

    protected $description = 'Give (or remove) admin access for an existing user';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('No user with that email. Register the account first, then run this again.');

            return self::FAILURE;
        }

        // Set directly rather than through mass assignment, so is_admin can never
        // be set from a registration form.
        $user->is_admin = ! $this->option('revoke');
        $user->save();

        $this->info($user->is_admin
            ? "{$user->email} is now an admin."
            : "{$user->email} is no longer an admin.");

        return self::SUCCESS;
    }
}
