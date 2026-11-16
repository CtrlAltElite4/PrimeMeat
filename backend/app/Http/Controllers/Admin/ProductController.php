<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Admin product management. Uses the team's Product model as-is: new columns
 * (category, stock, status) are written with forceFill on validated data only,
 * so the model's $fillable list doesn't need changing.
 */
class ProductController extends Controller
{
    private const PER_PAGE = 10;

    public const LOW_STOCK = 10; // at or below this, a product shows as "Low stock"

    /**
     * GET /api/admin/products?search=&category=&status=&page=
     * status: active (for sale, incl. low stock), low_stock, unavailable, draft
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'low_stock', 'unavailable', 'draft'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $products = Product::query()->with('variants')
            ->when($data['category'] ?? null, function ($q, $category) {
                $q->whereJsonContains('category', $category);
            })
            ->when($data['status'] ?? null, fn ($q, $status) => $this->filterStatus($q, $status))
            ->when($data['search'] ?? null, function ($q, $search) {
                $term = '%'.addcslashes($search, '%_\\').'%';
                $q->where(fn ($q) => $q
                    ->where('name', 'like', $term)
                    ->orWhere('grade', 'like', $term)
                    ->orWhere('category', 'like', $term));
            })
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Product $product) => $this->present($product));

        return response()->json($products);
    }

    /** The five cards, plus the category list for the filter dropdown. */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Product::count(),
            'active' => $this->filterStatus(Product::query(), 'active')->count(),
            'draft' => $this->filterStatus(Product::query(), 'draft')->count(),
            'low_stock' => $this->filterStatus(Product::query(), 'low_stock')->count(),
            'unavailable' => $this->filterStatus(Product::query(), 'unavailable')->count(),
            'low_stock_level' => self::LOW_STOCK,
            'categories' => Product::whereNotNull('category')
                ->pluck('category')
                ->flatMap(fn ($categories) => $categories ?? [])
                ->filter()
                ->unique()
                ->sort()
                ->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, imageRequired: false);

        $product = DB::transaction(function () use ($data, $request) {
            $product = new Product;
            $this->fill($product, $data, $request);
            $product->save();

            if (! empty($data['variants'])) {
                $this->syncVariants($product, $data['variants']);
            }

            return $product->load('variants');
        });

        return response()->json($this->present($product), 201);
    }

    /** Sent as POST with _method=PUT, because file uploads only work with POST. */
    public function update(Request $request, Product $product): JsonResponse
    {
        \Log::info('Product image upload check', [
            'has_file' => $request->hasFile('image'),
            'file' => $request->file('image')?->getClientOriginalName(),
            'content_type' => $request->header('Content-Type'),
            'all_files' => array_keys($request->allFiles()),
        ]);
        $data = $this->validated($request, imageRequired: false);

        \DB::transaction(function () use ($product, $data, $request) {
            $this->fill($product, $data, $request);
            $product->save();

            if (array_key_exists('variants', $data)) {
                $this->syncVariants($product, $data['variants']);
            }
        });
        $product->unsetRelation('variants');

        return response()->json($this->present($product));
    }

    /** The Availability toggle. */
    public function availability(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);

        $product->forceFill(['is_active' => $data['is_active']])->save();

        $product->load('variants');

        return response()->json($this->present($product));
    }

    /** Past orders keep the product's name and price (copied at checkout), so history isn't lost. */
    public function destroy(Product $product): JsonResponse
    {
        $this->deleteStoredImage($product->image);
        $product->delete();

        return response()->json(['deleted' => true]);
    }

    private function validated(Request $request, bool $imageRequired): array
    {
        if (
            $request->boolean('variants_present') &&
            ! array_key_exists('variants', $request->all())
        ) {
            $request->merge(['variants' => []]);
        }
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'product_type' => ['required', Rule::in([
                Product::TYPE_FIXED_PRICE,
            ])],
            'grade' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'array'],
            'category.*' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_active' => ['required', 'boolean'],

            // Real image check (not just the file extension), max 2 MB
            'image' => [
                $imageRequired ? 'required' : 'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'remove_image' => ['nullable', 'boolean'],
            'variants_present' => ['sometimes', 'boolean'],
            'variants' => ['sometimes', 'array'],
            'variants.*.id' => [
                'nullable',
                'integer',
                Rule::exists('product_variants', 'id'),
            ],
            'variants.*.grade' => ['required', 'string', 'max:50'],
            'variants.*.price' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'variants.*.weight_min_kg' => ['nullable', 'numeric', 'min:0.01'],
            'variants.*.weight_max_kg' => ['nullable', 'numeric', 'min:0.01'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ]);
        if (! empty($validated['variants'])) {
            $validated['price'] = 0;
            $validated['stock'] = 0;
        }
        unset($validated['variants_present']);

        return $validated;
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $existingIds = $product->variants()->pluck('id')->all();
        $submittedIds = [];

        foreach ($variants as $variant) {
            $variantId = $variant['id'] ?? null;

            if ($variantId && ! in_array((int) $variantId, $existingIds, true)) {
                throw ValidationException::withMessages([
                    'variants' => ['One or more variants do not belong to this product.'],
                ]);
            }

            $data = [
                'grade' => $variant['grade'],
                'weight_min_kg' => $variant['weight_min_kg'] ?? null,
                'weight_max_kg' => $variant['weight_max_kg'] ?? null,
                'price' => $variant['price'],
                'stock' => $variant['stock'],
                'is_active' => $variant['is_active'] ?? true,
            ];

            if ($variantId) {
                $product->variants()->whereKey($variantId)->update($data);
                $submittedIds[] = (int) $variantId;
            } else {
                $newVariant = $product->variants()->create($data);
                $submittedIds[] = $newVariant->id;
            }
        }

        $removedVariants = $product->variants()
            ->whereNotIn('id', $submittedIds)
            ->get();

        foreach ($removedVariants as $removedVariant) {
            if (
                $removedVariant->cartItems()->exists() ||
                $removedVariant->orderItems()->exists()
            ) {
                $removedVariant->update([
                    'is_active' => false,
                    'stock' => 0,
                ]);
            } else {
                $removedVariant->delete();
            }
        }
    }

    private function fill(Product $product, array $data, Request $request): void
    {
        \Log::info('Product fill method reached', [
            'has_file' => $request->hasFile('image'),
            'product_id' => $product->id,
        ]);
        $categories = array_values(array_unique($data['category'] ?? []));
        $product->forceFill([
            'name' => $data['name'],
            'grade' => $data['grade'] ?? null,
            'category' => $categories,
            'description' => $data['description'] ?? null,
            'product_type' => $data['product_type'],
            'price' => $data['price'],
            'stock' => $data['stock'],
            'status' => $data['status'],
            'is_active' => $data['is_active'],
        ]);

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($product->image);
            // Stored under storage/app/public/products with a random name
            $product->image = $request->file('image')->store('products', 'public');
            \Log::info('Product image storage result', [
                'stored_path' => $product->image,
                'exists' => $product->image
                    ? Storage::disk('public')->exists($product->image)
                    : false,
            ]);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteStoredImage($product->image);
            $product->image = null;
        }
    }

    /** Only deletes images this page uploaded, never a URL or a path someone else set. */
    private function deleteStoredImage(?string $path): void
    {
        if ($path && str_starts_with($path, 'products/')) {
            Storage::disk('public')->delete($path);
        }
    }

    private function filterStatus(Builder $q, string $status): Builder
    {
        $availableVariant = fn (Builder $variantQuery) => $variantQuery
            ->where('is_active', true)
            ->where('stock', '>', 0);

        return match ($status) {
            'draft' => $q->where('status', 'draft'),

            'unavailable' => $q->where('status', '!=', 'draft')
                ->where(fn ($q) => $q
                    ->where('is_active', false)
                    ->orWhere(fn ($q) => $q
                        ->whereHas('variants')
                        ->whereDoesntHave('variants', $availableVariant))
                    ->orWhere(fn ($q) => $q
                        ->whereDoesntHave('variants')
                        ->where('stock', 0))),

            'low_stock' => $q->where('status', '!=', 'draft')
                ->where('is_active', true)
                ->where(fn ($q) => $q
                    ->where(fn ($q) => $q
                        ->whereDoesntHave('variants')
                        ->whereBetween('stock', [1, self::LOW_STOCK]))
                    ->orWhereHas('variants', fn ($variantQuery) => $variantQuery
                        ->where('is_active', true)
                        ->whereBetween('stock', [1, self::LOW_STOCK]))),

            'active' => $q->where('status', '!=', 'draft')
                ->where('is_active', true)
                ->where(fn ($q) => $q
                    ->where(fn ($q) => $q
                        ->whereDoesntHave('variants')
                        ->where('stock', '>', 0))
                    ->orWhereHas('variants', $availableVariant)),

            default => $q,
        };
    }

    private function present(Product $product): array
    {
        $product->loadMissing('variants');

        $variants = $product->variants;
        $hasVariants = $variants->isNotEmpty();

        $stock = (int) $product->stock;
        $isActive = (bool) $product->is_active;

        $hasAvailableVariants = $variants->contains(
            fn (ProductVariant $variant) => $variant->is_active && $variant->stock > 0
        );

        $hasLowStockVariant = $variants->contains(
            fn (ProductVariant $variant) => $variant->is_active &&
                $variant->stock > 0 &&
                $variant->stock <= self::LOW_STOCK
        );
        $availableVariantPrices = $variants
            ->filter(fn (ProductVariant $variant) => $variant->is_active && $variant->stock > 0)
            ->pluck('price');

        $priceMin = $hasVariants
            ? ($availableVariantPrices->isNotEmpty() ? (float) $availableVariantPrices->min() : null)
            : (float) $product->price;

        $priceMax = $hasVariants
            ? ($availableVariantPrices->isNotEmpty() ? (float) $availableVariantPrices->max() : null)
            : (float) $product->price;
        $display = match (true) {
            $product->status === 'draft' => 'draft',
            ! $isActive => 'unavailable',
            $hasVariants && ! $hasAvailableVariants => 'unavailable',
            $hasVariants && $hasLowStockVariant => 'low_stock',
            ! $hasVariants && $stock === 0 => 'unavailable',
            ! $hasVariants && $stock <= self::LOW_STOCK => 'low_stock',
            default => 'active',
        };

        return [
            'id' => $product->id,
            'code' => 'PRD-'.(1000 + $product->id),
            'name' => $product->name,
            'grade' => $product->grade,
            'category' => $product->category ?? [],
            'description' => $product->description,
            'price' => (float) $product->price,
            'has_variants' => $hasVariants,
            'price_min' => $priceMin,
            'price_max' => $priceMax,
            'stock' => $stock,
            'status' => $product->status,
            'is_active' => $isActive,
            'display_status' => $display,
            'image_url' => $this->imageUrl($product->image),
            'product_type' => $product->product_type,
            'variants' => $variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'grade' => $variant->grade,
                'price' => (float) $variant->price,
                'weight_min_kg' => $variant->weight_min_kg,
                'weight_max_kg' => $variant->weight_max_kg,
                'stock' => (int) $variant->stock,
                'is_active' => (bool) $variant->is_active,
            ])->values(),
        ];
    }

    /**
     * Images uploaded through this admin page live on the public disk (products/...).
     * Anything else (a full URL, or a path the shop already uses) is passed through unchanged.
     */
    private function imageUrl(?string $image): ?string
    {
        if (! $image) {
            return null;
        }

        return str_starts_with($image, 'products/')
            ? asset('storage/'.$image)
            : $image;
    }
}
