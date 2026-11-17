<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

/**
 * "Forgot password" using Laravel's built-in password reset system.
 * Tokens live in the password_reset_tokens table, expire after 60 minutes and work once.
 */
class PasswordResetController extends Controller
{
    /** POST /api/forgot-password: emails a reset link */
    public function sendLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        // The answer is the same whether or not the account exists,
        // so this form can't be used to find out who has an account.
        Password::sendResetLink(['email' => $data['email']]);

        return response()->json([
            'message' => 'If an account exists for that email, we\'ve sent a link to reset your password. Check your inbox (and spam folder).',
        ]);
    }

    /** POST /api/reset-password: sets the new password from the emailed link */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            // Same rules as registration
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()],
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60), // ends "keep me signed in" on other devices
            ])->save();

            // Sign the account out everywhere else, in case someone else had access
            if (config('session.driver') === 'database') {
                DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
            }

            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => 'This reset link is invalid or has expired. Please request a new one.',
            ]);
        }

        return response()->json([
            'message' => 'Your password has been reset. You can now log in with your new password.',
        ]);
    }
}
