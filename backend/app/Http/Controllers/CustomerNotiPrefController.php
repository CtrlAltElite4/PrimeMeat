<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerNotiPrefController extends Controller
{
    private const DEFAULTS = [
        'orders' => true,
        'new_arrivals' => true,
        'special_deals' => true,
        'email_notifications' => true,
    ];

    /**
     * GET /api/notification-preferences
     */
    public function show(Request $request): JsonResponse
    {
        $preferences = $request->user()
            ->notificationPreference()
            ->firstOrCreate([], self::DEFAULTS);

        return response()->json($preferences);
    }

    /**
     * PUT /api/notification-preferences
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'orders' => ['required', 'boolean'],
            'new_arrivals' => ['required', 'boolean'],
            'special_deals' => ['required', 'boolean'],
            'email_notifications' => ['required', 'boolean'],
        ]);

        $preferences = $request->user()
            ->notificationPreference()
            ->updateOrCreate([], $data);

        return response()->json([
            'message' => 'Notification preferences updated successfully.',
            'preferences' => $preferences,
        ]);
    }
}
