<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Accept "082 123 4567", "082-123-4567", "+27 82 123 4567" etc. by removing spaces, dashes and brackets first
        $request->merge([
            'phone' => preg_replace('/[\s\-()]/', '', (string) $request->input('phone')),
        ]);

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            // South African number: 0 or +27, then 9 digits
            'phone' => ['required', 'regex:/^(\+27|0)[1-9][0-9]{8}$/'],
            // 'confirmed' checks against the password_confirmation field
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ], [
            'phone.required' => 'Enter your phone number.',
            'phone.regex' => 'Enter a valid South African phone number, e.g. 082 123 4567.',
        ]);

        // forceFill because "phone" isn't in the User model's fillable list; every value here is validated
        $user = new User();
        $user->forceFill([
            // Default users table has a single "name" column
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
            // Stored in one format (+27821234567) whatever way it was typed
            'phone' => preg_replace('/^0/', '+27', $data['phone']),
            'password' => Hash::make($data['password']),
        ])->save();

        // Log the new user straight in
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json($user, 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            // Generic message: don't reveal whether the email exists
            throw ValidationException::withMessages([
                'email' => 'Those credentials don\'t match our records.',
            ]);
        }

        // Suspended accounts can't log in. Only shown after a correct password,
        // so it doesn't reveal anything to someone guessing.
        if (Auth::user()->suspended_at) {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => 'This account has been suspended. Contact us if you think this is a mistake.',
            ]);
        }

        // Prevent session fixation
        $request->session()->regenerate();

        return response()->json(Auth::user());
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
