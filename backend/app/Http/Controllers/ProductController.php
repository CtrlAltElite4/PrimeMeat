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
            'category' => ['sometimes'],
            'grade' => ['sometimes', 'string', 'max:10'],
            'search' => ['sometimes', 'string', 'max:255'],
            'filter' => [
                'sometimes',
                'in:beef-carcasses,beef-products,mutton-products,lamb-products',
            ],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0'],
            'sort' => ['sometimes', 'in:price-low-high,price-high-low'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 12);

        $query = Product::available()->with([
            'variants' => function ($variants) {
                $variants->where('is_active', true)
                    ->where('stock', '>', 0)
                    ->orderBy('weight_min_kg');
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

        if (
            ! empty($validated['grade']) &&
            $validated['grade'] !== 'all'
        ) {
            $grade = $validated['grade'];

            $query->where(function (Builder $products) use ($grade) {
                $products->where('grade', $grade)
                    ->orWhereHas('variants', function (Builder $variants) use ($grade) {
                        $variants->where('grade', $grade)
                            ->where('is_active', true)
                            ->where('stock', '>', 0);
                    });
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

        if (! empty($validated['filter'])) {
            $categories = [
                'beef-carcasses' => 'Beef Carcasses',
                'beef-products' => 'Beef Products',
                'mutton-products' => 'Mutton Products',
                'lamb-products' => 'Lamb Products',
            ];

            $query->whereJsonContains('category', $categories[$validated['filter']]);
        }

        // Apply price filters to product or variant prices.
        $minPrice = $validated['min_price'] ?? null;
        $maxPrice = $validated['max_price'] ?? null;

        $query->where(function (Builder $products) use ($minPrice, $maxPrice) {
            $products->where(function (Builder $fixed) use ($minPrice, $maxPrice) {
                $fixed->where('product_type', Product::TYPE_FIXED_PRICE);

                if ($minPrice !== null) {
                    $fixed->where('price', '>=', $minPrice);
                }

                if ($maxPrice !== null) {
                    $fixed->where('price', '<=', $maxPrice);
                }
            })->orWhere(function (Builder $carcasses) use ($minPrice, $maxPrice) {
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
            if ($product->product_type === Product::TYPE_CARCASS) {
                return $product->variants->pluck('price');
            }

            return [$product->price];
        });

        if (($validated['sort'] ?? null) === 'price-low-high') {
            $query->orderByRaw(
                'CASE WHEN product_type = ? THEN price ELSE (
                    SELECT MIN(pv.price)
                    FROM product_variants pv
                    WHERE pv.product_id = products.id
                    AND pv.is_active = 1
                    AND pv.stock > 0
                ) END ASC',
                [Product::TYPE_FIXED_PRICE]
            );
        } elseif (($validated['sort'] ?? null) === 'price-high-low') {
            $query->orderByRaw(
                'CASE WHEN product_type = ? THEN price ELSE (
                    SELECT MAX(pv.price)
                    FROM product_variants pv
                    WHERE pv.product_id = products.id
                    AND pv.is_active = 1
                    AND pv.stock > 0
                ) END DESC',
                [Product::TYPE_FIXED_PRICE]
            );
        } else {
            $query->inRandomOrder();
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'minimum_price' => $prices->isNotEmpty() ? $prices->min() : null,
            'maximum_price' => $prices->isNotEmpty() ? $prices->max() : null,
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
