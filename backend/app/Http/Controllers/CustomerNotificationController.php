<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerNotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Retrieve all notifications belonging to the customer.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'subject' => $notification->data['subject'] ?? '',
                    'lines' => $notification->data['lines'] ?? [],
                    'buttonText' => $notification->data['buttonText'] ?? '',
                    'path' => $notification->data['path'] ?? '',
                    'category' => $notification->data['category'] ?? '',
                    'created_at' => $notification->created_at,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'has_notifications' => $notifications->isNotEmpty(),
        ]);
    }

    /**
     * DELETE /api/notifications/{id}
     * Delete a notification belonging to the customer.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message' => 'Notification removed successfully.',
            'has_notifications' => $request->user()
                ->notifications()
                ->exists(),
        ]);
    }
}
