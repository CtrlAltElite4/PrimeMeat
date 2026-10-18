<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\GroupOrder;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GroupOrderController extends Controller
{
    private const WEIGHT_RANGES = [
        '200-240' => 17000,
        '241-280' => 20750,
        '281-320' => 23750,
    ];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'weight_range' => [
                'required',
                Rule::in(array_keys(self::WEIGHT_RANGES)),
            ],

            'number_of_people' => [
                'required',
                'integer',
                'min:2',
                'max:8',
            ],

            'members' => [
                'required',
                'array',
                'min:2',
                'max:8',
            ],

            'members.*.name' => [
                'required',
                'string',
                'max:255',
            ],

            'members.*.email' => [
                'required',
                'email',
                'max:255',
            ],

            'members.*.phone' => [
                'required',
                'string',
                'max:30',
            ],

            'delivery_member_index' => [
                'required',
                'integer',
                'min:0',
            ],

            'address_line_1' => [
                'required',
                'string',
                'max:255',
            ],

            'address_line_2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'required',
                'string',
                'max:255',
            ],

            'province' => [
                'required',
                'string',
                'max:255',
            ],

            'postal_code' => [
                'required',
                'string',
                'max:20',
            ],

            'delivery_instructions' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'include_ground_beef' => [
                'required',
                'boolean',
            ],
        ]);

        if (
            count($validated['members']) !==
            $validated['number_of_people']
        ) {
            return response()->json([
                'message' => 'The number of members must match the group size.',
            ], 422);
        }

        if (
            $validated['delivery_member_index'] >=
            $validated['number_of_people']
        ) {
            return response()->json([
                'message' => 'The selected delivery recipient is invalid.',
            ], 422);
        }

        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $price = self::WEIGHT_RANGES[$validated['weight_range']];

        $groupOrder = DB::transaction(function () use (
            $cart,
            $validated,
            $price
        ) {
            $groupOrder = GroupOrder::create([
                'cart_id' => $cart->id,
                'weight_range' => $validated['weight_range'],
                'price' => $price,
                'number_of_people' => $validated['number_of_people'],
                'delivery_method' => 'delivery',
                'address_line_1' => $validated['address_line_1'],
                'address_line_2' => $validated['address_line_2'] ?? null,
                'city' => $validated['city'],
                'province' => $validated['province'],
                'postal_code' => $validated['postal_code'],
                'delivery_instructions' => $validated['delivery_instructions'] ?? null,
                'include_ground_beef' => $validated['include_ground_beef'],
            ]);

            $members = [];

            foreach ($validated['members'] as $member) {
                $members[] = $groupOrder->members()->create([
                    'name' => $member['name'],
                    'email' => $member['email'],
                    'phone' => $member['phone'],
                ]);
            }

            $groupOrder->update([
                'delivery_member_id' => $members[$validated['delivery_member_index']]->id,
            ]);

            return $groupOrder;
        });

        return response()->json([
            'message' => 'Group order created.',
            'group_order' => $groupOrder->load([
                'members',
                'deliveryMember',
            ]),
        ], 201);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'weight_range' => [
                'required',
                Rule::in(array_keys(self::WEIGHT_RANGES)),
            ],

            'number_of_people' => [
                'required',
                'integer',
                'min:2',
                'max:8',
            ],

            'members' => [
                'required',
                'array',
                'min:2',
                'max:8',
            ],

            'members.*.name' => [
                'required',
                'string',
                'max:255',
            ],

            'members.*.email' => [
                'required',
                'email',
                'max:255',
            ],

            'members.*.phone' => [
                'required',
                'string',
                'max:30',
            ],

            'delivery_member_index' => [
                'required',
                'integer',
                'min:0',
            ],

            'delivery_method' => [
                'required',
                Rule::in(['delivery', 'collection']),
            ],

            'address_line_1' => [
                'required_if:delivery_method,delivery',
                'nullable',
                'string',
                'max:255',
            ],

            'address_line_2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'required_if:delivery_method,delivery',
                'nullable',
                'string',
                'max:255',
            ],

            'province' => [
                'required_if:delivery_method,delivery',
                'nullable',
                'string',
                'max:255',
            ],

            'postal_code' => [
                'required_if:delivery_method,delivery',
                'nullable',
                'string',
                'max:20',
            ],

            'delivery_instructions' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'include_ground_beef' => [
                'required',
                'boolean',
            ],
        ]);

        if (
            count($validated['members']) !==
            $validated['number_of_people']
        ) {
            return response()->json([
                'message' => 'The number of members must match the group size.',
            ], 422);
        }

        if (
            $validated['delivery_member_index'] >=
            $validated['number_of_people']
        ) {
            return response()->json([
                'message' => 'The selected delivery recipient is invalid.',
            ], 422);
        }

        $price = self::WEIGHT_RANGES[$validated['weight_range']];

        $groupOrder = DB::transaction(function () use (

            $request,
            $validated,
            $price
        ) {
            $groupOrder = GroupOrder::create([
                'user_id' => $request->user()->id,
                'cart_id' => null,
                'weight_range' => $validated['weight_range'],
                'price' => $price,
                'number_of_people' => $validated['number_of_people'],
                'delivery_method' => $validated['delivery_method'],
                'address_line_1' => $validated['address_line_1'] ?? null,
                'address_line_2' => $validated['address_line_2'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'delivery_instructions' => $validated['delivery_instructions'] ?? null,
                'include_ground_beef' => $validated['include_ground_beef'],
            ]);

            $members = [];

            foreach ($validated['members'] as $member) {
                $members[] = $groupOrder->members()->create([
                    'name' => $member['name'],
                    'email' => $member['email'],
                    'phone' => $member['phone'],
                ]);
            }

            $groupOrder->update([
                'delivery_member_id' => $members[$validated['delivery_member_index']]->id,
            ]);

            return $groupOrder;
        });

        return response()->json([
            'message' => 'Group order checkout created successfully.',
            'group_order' => $groupOrder->load([
                'members',
                'deliveryMember',
            ]),
            'price_per_person' => round(
                $price / $validated['number_of_people'],
                2
            ),
            'total_price' => $price,
        ], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        if (! $cart) {
            return response()->json([
                'message' => 'Cart not found.',
            ], 404);
        }

        $groupOrder = $cart->groupOrder;

        if (! $groupOrder) {
            return response()->json([
                'message' => 'No group order found in your cart.',
            ], 404);
        }

        $groupOrder->delete();

        return response()->json([
            'message' => 'Group order removed from cart.',
        ]);
    }

    public function show(Request $request, GroupOrder $groupOrder): JsonResponse
    {
        if (
            $groupOrder->user_id !== $request->user()->id
        ) {
            return response()->json([
                'message' => 'Group order not found.',
            ], 404);
        }

        // Has the organiser already paid for this group order?
        $paid = $groupOrder->order_id
            && Payment::where('order_id', $groupOrder->order_id)
                ->where('status', Payment::STATUS_COMPLETED)
                ->exists();

        return response()->json([
            'group_order' => $groupOrder->load([
                'members',
                'deliveryMember',
                'order:id,order_number,status',
            ]),
            'price_per_person' => round(
                $groupOrder->price / $groupOrder->number_of_people,
                2
            ),
            'total_price' => $groupOrder->price,
            'paid' => $paid,
        ]);
    }
}
