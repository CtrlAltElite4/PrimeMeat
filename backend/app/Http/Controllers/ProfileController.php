<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * The logged-in user's own profile and password. Used by the admin Settings page,
 * and works for customers too (e.g. a future "My account" page).
 */
class ProfileController extends Controller
{
    /** PUT /api/profile */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $emailChanging = strcasecmp((string) $request->input('email'), $user->email) !== 0;

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            // Digits, spaces, +, -, ( ) only, e.g. +27 82 123 4567
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            // Changing the login email needs the current password, so someone who
            // finds an unlocked laptop can't take over the account.
            'current_password' => [Rule::requiredIf($emailChanging), 'nullable', 'current_password'],
        ], [
            'phone.regex' => 'Enter a valid phone number, e.g. +27 82 123 4567.',
            'current_password.required' => 'Enter your current password to change your email.',
            'current_password.current_password' => 'That password is incorrect.',
        ]);

        // Set directly rather than through mass assignment
        $user->forceFill([
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ])->save();

        return response()->json($user->fresh());
    }

    /** PUT /api/profile/password */
    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', 'different:current_password', Password::min(8)->letters()->numbers()],
        ], [
            'current_password.current_password' => 'That password is incorrect.',
            'password.different' => 'Choose a password different from your current one.',
        ]);

        $request->user()->forceFill(['password' => Hash::make($data['password'])])->save();

        // New session ID after a password change
        $request->session()->regenerate();

        return response()->json(['updated' => true]);
    }
}
