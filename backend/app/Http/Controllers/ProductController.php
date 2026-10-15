<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 12), 24);

        // Only products that are switched on, published and in stock appear in the shop
        $baseQuery = Product::available();

        $query = clone $baseQuery;

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('name', $request->category);
        }

        if ($request->filled('grade') && $request->grade !== 'all') {
            $query->where('grade', $request->grade);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('grade', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filter')) {
            if ($request->filter === 'full-carcass') {
                $query->where('name', 'full carcass');
            }

            if ($request->filter === 'half-carcass') {
                $query->where('name', 'half carcass');
            }

            if ($request->filter === 'quarter-carcass') {
                $query->where('name', 'quarter carcass');
            }

            if ($request->filter === 'group-orders') {
                $query->whereRaw('1 = 0');
            }
        }

        $minimumPrice = (clone $query)->min('price');
        $maximumPrice = (clone $query)->max('price');

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->filled('sort')) {
            if ($request->sort === 'price-low-high') {
                $query->orderBy('price', 'asc');
            }

            if ($request->sort === 'price-high-low') {
                $query->orderBy('price', 'desc');
            }
        } else {
            $seed = now()->format('Y-m-d');

            $query->orderByRaw('RAND(?)', [$seed]);
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'minimum_price' => (float) $minimumPrice,
            'maximum_price' => (float) $maximumPrice,
        ]);
    }

    public function show(Product $product)
    {
        // Hidden or draft products stay hidden. A sold-out product still opens (old links,
        // items already in a cart), but `in_stock` tells the page to block "Add to cart".
        if (! $product->is_active || $product->status === 'draft') {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            ...$product->toArray(),
            'in_stock' => $product->isPurchasable(),
        ]);
    }
}
