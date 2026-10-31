<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
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
                'items.productVariant',
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
        if ((int) $order->user_id !== (int) $request->user()->id) {
            abort(403, 'You do not have access to this order.');
        }

        $order->load([
            'items.product',
            'items.productVariant',
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
                'items.productVariant',
                'items.cutSelections.cutOption',
            ])
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 422);
        }

        // Recheck product and variant availability before creating the order.
        foreach ($cart->items as $cartItem) {
            $product = $cartItem->product;
            $variant = $cartItem->productVariant;

            if (
                ! $product ||
                ! $product->is_active ||
                $product->status !== 'published'
            ) {
                return response()->json([
                    'message' => 'A product in your cart is no longer available.',
                ], 422);
            }

            if ($product->product_type === Product::TYPE_CARCASS) {
                if (
                    ! $variant ||
                    (int) $variant->product_id !== (int) $product->id ||
                    ! $variant->is_active ||
                    (int) $variant->stock < (int) $cartItem->quantity
                ) {
                    return response()->json([
                        'message' => "The selected variant for {$product->name} is no longer available in the requested quantity.",
                    ], 422);
                }
            } elseif ($product->product_type === Product::TYPE_FIXED_PRICE) {
                if (
                    $variant ||
                    (int) $product->stock < (int) $cartItem->quantity
                ) {
                    return response()->json([
                        'message' => "The product {$product->name} is no longer available in the requested quantity.",
                    ], 422);
                }
            } else {
                return response()->json([
                    'message' => "The product {$product->name} cannot currently be purchased.",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($request, $cart) {
            $total = 0;

            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $variant = $cartItem->productVariant;

                $unitPrice = $product->product_type === Product::TYPE_CARCASS
                    ? (float) $variant->price
                    : (float) $product->price;

                $lineTotal = round(
                    $unitPrice * (int) $cartItem->quantity,
                    2
                );

                $total += $lineTotal;
            }

            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total' => round($total, 2),
            ]);

            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $variant = $cartItem->productVariant;

                $unitPrice = $product->product_type === Product::TYPE_CARCASS
                    ? (float) $variant->price
                    : (float) $product->price;

                $lineTotal = round(
                    $unitPrice * (int) $cartItem->quantity,
                    2
                );

                $orderItem = $order->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'grade' => $variant?->grade ?? $product->grade,
                    'price' => $unitPrice,
                    'unit_price' => $unitPrice,
                    'quantity' => $cartItem->quantity,
                    'line_total' => $lineTotal,
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
            'items.productVariant',
            'items.cutSelections.cutOption',
        ]);

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order,
        ], 201);
    }
}
