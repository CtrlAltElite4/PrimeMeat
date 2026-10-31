<?php

namespace App\Http\Controllers;

use App\Models\GroupOrderProduct;
use Illuminate\Http\JsonResponse;

class GroupOrderProductsController extends Controller
{
    /**
     * GET /api/group-order-products
     */
    public function index(): JsonResponse
    {
        $products = GroupOrderProduct::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('weight_range')
            ->get(['id', 'weight_range', 'price', 'stock']);

        return response()->json([
            'group_order_products' => $products,
        ]);
    }
}
