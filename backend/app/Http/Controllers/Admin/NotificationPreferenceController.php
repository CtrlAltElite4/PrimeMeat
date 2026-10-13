<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Settings > Notification: the logged-in admin's own email alert choices. */
class NotificationPreferenceController extends Controller
{
    /** GET /api/admin/notification-preferences */
    public function show(Request $request): JsonResponse
    {
        return response()->json(AdminNotificationPreference::forUser($request->user()->id));
    }

    /** PUT /api/admin/notification-preferences */
    public function update(Request $request): JsonResponse
    {
        $rules = array_fill_keys(array_keys(AdminNotificationPreference::DEFAULTS), ['required', 'boolean']);
        $data = $request->validate($rules);

        AdminNotificationPreference::updateOrCreate(['user_id' => $request->user()->id], $data);

        return response()->json(AdminNotificationPreference::forUser($request->user()->id));
    }
}
