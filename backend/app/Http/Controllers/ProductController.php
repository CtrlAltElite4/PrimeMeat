<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:24'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'search' => ['sometimes', 'string', 'max:255'],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0'],
            'sort' => ['sometimes', 'in:price-low-high,price-high-low'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 12);

        $query = Product::available()->with([
            'variants' => function ($variants) {
                $variants->where('is_active', true)
                    ->where('stock', '>', 0)
                    ->orderBy('weight_min_kg')
                    ->orderBy('price');
            },
        ]);

        if (! empty($validated['category']) && $validated['category'] !== 'all') {
            $categories = is_array($validated['category'])
                ? $validated['category']
                : [$validated['category']];

            $query->where(function (Builder $products) use ($categories) {
                foreach ($categories as $category) {
                    $products->orWhereJsonContains('category', $category);
                }
            });
        }

        if (! empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function (Builder $products) use ($search) {
                $products->where('name', 'like', "%{$search}%")
                    ->orWhere('grade', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('variants', function (Builder $variants) use ($search) {
                        $variants->where('grade', 'like', "%{$search}%");
                    });
            });
        }

        // Apply price filters to product or variant prices.
        $minPrice = $validated['min_price'] ?? null;
        $maxPrice = $validated['max_price'] ?? null;

        $query->where(function (Builder $products) use ($minPrice, $maxPrice) {
            $products
                ->where(function (Builder $fixed) use ($minPrice, $maxPrice) {
                    $fixed->where('product_type', Product::TYPE_FIXED_PRICE)
                        ->where(function (Builder $prices) use ($minPrice, $maxPrice) {
                            // Fixed-price products without variants use product price.
                            $prices->where(function (Builder $simple) use ($minPrice, $maxPrice) {
                                $simple->whereDoesntHave('variants');

                                if ($minPrice !== null) {
                                    $simple->where('price', '>=', $minPrice);
                                }

                                if ($maxPrice !== null) {
                                    $simple->where('price', '<=', $maxPrice);
                                }
                            });

                            // Fixed-price products with variants use variant prices.
                            $prices->orWhereHas('variants', function (Builder $variants) use ($minPrice, $maxPrice) {
                                $variants->where('is_active', true)
                                    ->where('stock', '>', 0);

                                if ($minPrice !== null) {
                                    $variants->where('price', '>=', $minPrice);
                                }

                                if ($maxPrice !== null) {
                                    $variants->where('price', '<=', $maxPrice);
                                }
                            });
                        });
                })
                ->orWhere(function (Builder $carcasses) use ($minPrice, $maxPrice) {
                    $carcasses->where('product_type', Product::TYPE_CARCASS)
                        ->whereHas('variants', function (Builder $variants) use ($minPrice, $maxPrice) {
                            $variants->where('is_active', true)
                                ->where('stock', '>', 0);

                            if ($minPrice !== null) {
                                $variants->where('price', '>=', $minPrice);
                            }

                            if ($maxPrice !== null) {
                                $variants->where('price', '<=', $maxPrice);
                            }
                        });
                });
        });

        // Calculate the displayed price range across matching products.
        $priceProducts = (clone $query)->with([
            'variants' => function ($variants) {
                $variants->where('is_active', true)
                    ->where('stock', '>', 0);
            },
        ])->get();

        $prices = $priceProducts->flatMap(function (Product $product) {
            if ($product->variants->isNotEmpty()) {
                return $product->variants->pluck('price');
            }

            return [$product->price];
        });

        if (($validated['sort'] ?? null) === 'price-low-high') {
            $query->orderByRaw(
                'CASE
            WHEN EXISTS (
                SELECT 1 FROM product_variants pv
                WHERE pv.product_id = products.id
                AND pv.is_active = 1
                AND pv.stock > 0
            )
            THEN (
                SELECT MIN(pv.price)
                FROM product_variants pv
                WHERE pv.product_id = products.id
                AND pv.is_active = 1
                AND pv.stock > 0
            )
            ELSE products.price
        END ASC'
            );
        } elseif (($validated['sort'] ?? null) === 'price-high-low') {
            $query->orderByRaw(
                'CASE
            WHEN EXISTS (
                SELECT 1 FROM product_variants pv
                WHERE pv.product_id = products.id
                AND pv.is_active = 1
                AND pv.stock > 0
            )
            THEN (
                SELECT MAX(pv.price)
                FROM product_variants pv
                WHERE pv.product_id = products.id
                AND pv.is_active = 1
                AND pv.stock > 0
            )
            ELSE products.price
        END DESC'
            );
        } else {
            $query->inRandomOrder();
        }

        $products = $query->paginate($perPage);
        $categories = Product::available()
            ->whereNotNull('category')
            ->pluck('category')
            ->flatMap(fn ($productCategories) => $productCategories ?? [])
            ->filter(fn ($category) => is_string($category) && trim($category) !== '')
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'minimum_price' => $prices->isNotEmpty() ? $prices->min() : null,
            'maximum_price' => $prices->isNotEmpty() ? $prices->max() : null,
            'categories' => $categories,
        ]);
    }

    public function show(Product $product)
    {
        if (! $product->is_active || $product->status === 'draft') {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        $product->load([
            'variants' => function ($variants) {
                $variants->where('is_active', true)
                    ->where('stock', '>', 0)
                    ->orderBy('weight_min_kg');
            },
        ]);

        return response()->json([
            ...$product->toArray(),
            'in_stock' => $product->isPurchasable(),
        ]);
    }
}
