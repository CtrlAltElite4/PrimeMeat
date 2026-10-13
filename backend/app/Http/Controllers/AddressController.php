<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->latest()
            ->get();

        return response()->json([
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'suburb' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            'is_default' => ['boolean'],
        ]);

        $user = $request->user();

        $isDefault = $data['is_default'] ?? false;

        if (! $user->addresses()->exists()) {
            $isDefault = true;
        }

        $address = DB::transaction(function () use ($user, $data, $isDefault) {
            if ($isDefault) {
                $user->addresses()->update([
                    'is_default' => false,
                ]);
            }

            return $user->addresses()->create([
                ...$data,
                'is_default' => $isDefault,
            ]);
        });

        return response()->json($address, 201);
    }

    public function update(
        Request $request,
        Address $address
    ): JsonResponse {
        $this->authorizeAddress($request, $address);

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'suburb' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            'is_default' => ['boolean'],
        ]);

        $isDefault = $data['is_default'] ?? false;

        DB::transaction(function () use (
            $request,
            $address,
            $data,
            $isDefault
        ) {
            if ($isDefault) {
                $request->user()->addresses()
                    ->where('id', '!=', $address->id)
                    ->update([
                        'is_default' => false,
                    ]);
            }

            $address->update([
                ...$data,
                'is_default' => $isDefault,
            ]);
        });

        return response()->json($address->fresh());
    }

    public function destroy(
        Request $request,
        Address $address
    ): JsonResponse {
        $this->authorizeAddress($request, $address);

        $wasDefault = $address->is_default;

        $address->delete();

        if ($wasDefault) {
            $request->user()
                ->addresses()
                ->latest('id')
                ->first()?->update([
                    'is_default' => true,
                ]);
        }

        return response()->json([
            'deleted' => true,
        ]);
    }

    public function setDefault(
        Request $request,
        Address $address
    ): JsonResponse {
        $this->authorizeAddress($request, $address);

        DB::transaction(function () use ($request, $address) {
            $request->user()->addresses()->update([
                'is_default' => false,
            ]);

            $address->update([
                'is_default' => true,
            ]);
        });

        return response()->json($address->fresh());
    }

    private function authorizeAddress(
        Request $request,
        Address $address
    ): void {
        abort_unless(
            $address->user_id === $request->user()->id,
            403
        );
    }
}
