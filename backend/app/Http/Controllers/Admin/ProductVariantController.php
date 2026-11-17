<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductVariantController extends Controller
{
    // List carcass products with their variants.
    public function index()
    {
        $products = Product::query()
            ->where('product_type', Product::TYPE_CARCASS)
            ->with('variants')
            ->latest()
            ->get();

        return response()->json($products);
    }

    // Create a carcass product and its variants.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'animal_type' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'array'],
            'category.*' => ['string', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.grade' => ['nullable', 'string', 'max:20'],
            'variants.*.weight_min_kg' => ['nullable', 'numeric', 'min:0'],
            'variants.*.weight_max_kg' => ['nullable', 'numeric', 'gt:variants.*.weight_min_kg'],
            'variants.*.price' => ['required', 'numeric', 'min:0.01'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ]);

        $this->validateGrades($validated);
        $imagePath = $request->file('image')?->store('products', 'public');
        $product = DB::transaction(function () use ($validated, $imagePath) {
            $product = Product::create([
                'name' => $validated['name'],
                'grade' => null,
                'description' => $validated['description'] ?? null,
                'price' => 0,
                'stock' => 0,
                'category' => $validated['category'] ?? [],
                'image' => $imagePath,
                'is_active' => $validated['is_active'] ?? true,
                'status' => $validated['status'] ?? 'published',
                'product_type' => Product::TYPE_CARCASS,
            ]);

            foreach ($validated['variants'] as $variant) {
                $product->variants()->create([
                    'grade' => $this->variantGrade($validated['animal_type'], $variant['grade'] ?? null),
                    'weight_min_kg' => $variant['weight_min_kg'] ?? null,
                    'weight_max_kg' => $variant['weight_max_kg'] ?? null,
                    'price' => $variant['price'],
                    'stock' => $variant['stock'],
                    'is_active' => $variant['is_active'] ?? true,
                ]);
            }

            return $product->load('variants');
        });

        return response()->json([
            'message' => 'Carcass product created successfully.',
            'product' => $product,
        ], 201);
    }

    // Retrieve one carcass product for editing.
    public function show(Product $product)
    {
        $this->ensureCarcass($product);

        return response()->json($product->load('variants'));
    }

    // Update a carcass product and its supplied variants.
    public function update(Request $request, Product $product)
    {
        $this->ensureCarcass($product);

        $validated = $request->validate([
            'animal_type' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'array'],
            'category.*' => ['string', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['draft', 'published'])],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => [
                'nullable',
                'integer',
                Rule::exists('product_variants', 'id')
                    ->where('product_id', $product->id),
            ],
            'variants.*.grade' => ['nullable', 'string', 'max:20'],
            'variants.*.weight_min_kg' => ['nullable', 'numeric', 'min:0'],
            'variants.*.weight_max_kg' => ['nullable', 'numeric', 'gt:variants.*.weight_min_kg'],
            'variants.*.price' => ['required', 'numeric', 'min:0.01'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ]);

        $this->validateGrades($validated);
        $oldImage = $product->image;
        $imagePath = $oldImage;

        if ($request->boolean('remove_image')) {
            $imagePath = null;
        } elseif ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }
        $product = DB::transaction(function () use ($validated, $product, $imagePath) {
            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'] ?? [],
                'image' => $imagePath,
                'is_active' => $validated['is_active'] ?? $product->is_active,
                'status' => $validated['status'] ?? $product->status,
            ]);

            foreach ($validated['variants'] as $variant) {
                $data = [
                    'grade' => $this->variantGrade($validated['animal_type'], $variant['grade'] ?? null),
                    'weight_min_kg' => $variant['weight_min_kg'] ?? null,
                    'weight_max_kg' => $variant['weight_max_kg'] ?? null,
                    'price' => $variant['price'],
                    'stock' => $variant['stock'],
                    'is_active' => $variant['is_active'] ?? true,
                ];

                if (! empty($variant['id'])) {
                    $product->variants()
                        ->whereKey($variant['id'])
                        ->update($data);
                } else {
                    $product->variants()->create($data);
                }
            }

            return $product->load('variants');
        });
        if ($oldImage && $oldImage !== $imagePath) {
            Storage::disk('public')->delete($oldImage);
        }

        return response()->json([
            'message' => 'Carcass product updated successfully.',
            'product' => $product,
        ]);
    }

    // Delete a carcass product and its variants.
    public function destroy(Product $product)
    {
        $this->ensureCarcass($product);

        $product->delete();

        return response()->json([
            'message' => 'Carcass product deleted successfully.',
        ]);
    }

    // Toggle carcass product availability.
    public function availability(Product $product)
    {
        $this->ensureCarcass($product);

        $product->update([
            'is_active' => ! $product->is_active,
        ]);

        return response()->json([
            'message' => 'Carcass product availability updated.',
            'product' => $product->load('variants'),
        ]);
    }

    // Validate grades according to the carcass animal type.
    private function validateGrades(array $validated): void
    {
        foreach ($validated['variants'] as $index => $variant) {
            $grade = $variant['grade'] ?? null;

            if (strtolower($validated['animal_type']) === 'beef') {
                validator(
                    ['grade' => $grade],
                    ['grade' => ['required', Rule::in(['A', 'AB', 'B', 'C'])]]
                )->validate();
            }
        }
    }

    // Only beef variants use grades.
    private function variantGrade(string $animalType, ?string $grade): ?string
    {
        return strtolower($animalType) === 'beef' ? $grade : null;
    }

    // Prevent fixed-price products from being managed as carcasses.
    private function ensureCarcass(Product $product): void
    {
        abort_unless(
            $product->product_type === Product::TYPE_CARCASS,
            404
        );
    }
}
