<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with([
                'items.product',
                'items.cutSelections.cutOption',
            ])
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    public function show(
        Request $request,
        Order $order
    ): JsonResponse {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'You do not have access to this order.');
        }

        $order->load([
            'items.product',
            'items.cutSelections.cutOption',
        ]);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)
            ->with([
                'items.product',
                'items.cutSelections.cutOption',
            ])
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 422);
        }

        foreach ($cart->items as $cartItem) {
            if (! $cartItem->product->is_active) {
                return response()->json([
                    'message' => "The product {$cartItem->product->name} is no longer available.",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($request, $cart) {
            $total = $cart->items->sum(function ($item) {
                return (float) $item->product->price * $item->quantity;
            });

            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total_amount' => $total,
            ]);

            foreach ($cart->items as $cartItem) {
                $orderItem = $order->items()->create([
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'grade' => $cartItem->product->grade,
                    'price' => $cartItem->product->price,
                    'quantity' => $cartItem->quantity,
                    'cut_type' => $cartItem->cut_type,
                    'selected_quarter' => $cartItem->selected_quarter,
                    'remaining_meat_preferences' => $cartItem->remaining_meat_preferences,
                    'special_instructions' => $cartItem->special_instructions,
                ]);

                foreach ($cartItem->cutSelections as $selection) {
                    $orderItem->cutSelections()->create([
                        'cut_option_id' => $selection->cut_option_id,
                        'side' => $selection->side,
                        'quarter' => $selection->quarter,
                    ]);
                }
            }

            $cart->items()->delete();

            return $order;
        });

        $order->load([
            'items.product',
            'items.cutSelections.cutOption',
        ]);

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order,
        ], 201);
    }
}
