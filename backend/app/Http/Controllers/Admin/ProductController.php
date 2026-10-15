<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

        $products = Product::query()
            ->when($data['category'] ?? null, fn ($q, $category) => $q->where('category', $category))
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
            'categories' => Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, imageRequired: false);

        $product = new Product();
        $this->fill($product, $data, $request);
        $product->save();

        return response()->json($this->present($product), 201);
    }

    /** Sent as POST with _method=PUT, because file uploads only work with POST. */
    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->validated($request, imageRequired: false);

        $this->fill($product, $data, $request);
        $product->save();

        return response()->json($this->present($product));
    }

    /** The Availability toggle. */
    public function availability(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);

        $product->forceFill(['is_active' => $data['is_active']])->save();

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
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_active' => ['required', 'boolean'],
            // Real image check (not just the file extension), max 2 MB
            'image' => [$imageRequired ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ]);
    }

    private function fill(Product $product, array $data, Request $request): void
    {
        $product->forceFill([
            'name' => $data['name'],
            'grade' => $data['grade'],
            'category' => $data['category'] ?? null,
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'stock' => $data['stock'],
            'status' => $data['status'],
            'is_active' => $data['is_active'],
        ]);

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($product->image);
            // Stored under storage/app/public/products with a random name
            $product->image = $request->file('image')->store('products', 'public');
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
        return match ($status) {
            'draft' => $q->where('status', 'draft'),
            'unavailable' => $q->where('status', '!=', 'draft')
                ->where(fn ($q) => $q->where('is_active', false)->orWhere('stock', 0)),
            'low_stock' => $q->where('status', '!=', 'draft')->where('is_active', true)
                ->whereBetween('stock', [1, self::LOW_STOCK]),
            // "Active" = available for purchase, including low stock
            'active' => $q->where('status', '!=', 'draft')->where('is_active', true)->where('stock', '>', 0),
        };
    }

    private function present(Product $product): array
    {
        $stock = (int) $product->stock;
        $isActive = (bool) $product->is_active;

        $display = match (true) {
            $product->status === 'draft' => 'draft',
            ! $isActive || $stock === 0 => 'unavailable',
            $stock <= self::LOW_STOCK => 'low_stock',
            default => 'active',
        };

        return [
            'id' => $product->id,
            'code' => 'PRD-'.(1000 + $product->id),
            'name' => $product->name,
            'grade' => $product->grade,
            'category' => $product->category,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock' => $stock,
            'status' => $product->status,
            'is_active' => $isActive,
            'display_status' => $display,
            'image_url' => $this->imageUrl($product->image),
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

        return str_starts_with($image, 'products/') ? Storage::disk('public')->url($image) : $image;
    }
}
