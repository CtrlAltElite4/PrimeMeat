<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupOrderProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupOrderProductController extends Controller
{
    private const PER_PAGE = 10;

    /**
     * GET /api/admin/group-order-products
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'out_of_stock'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $products = GroupOrderProduct::query()
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('weight_range', 'like', "%{$search}%");
            })
            ->when($data['status'] ?? null, function ($query, $status) {
                match ($status) {
                    'active' => $query->where('is_active', true)->where('stock', '>', 0),
                    'inactive' => $query->where('is_active', false),
                    'out_of_stock' => $query->where('stock', 0),
                };
            })
            ->orderBy('weight_range')
            ->paginate(self::PER_PAGE);

        return response()->json($products);
    }

    /**
     * GET /api/admin/group-order-products/stats
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => GroupOrderProduct::count(),
            'active' => GroupOrderProduct::where('is_active', true)
                ->where('stock', '>', 0)->count(),
            'inactive' => GroupOrderProduct::where('is_active', false)->count(),
            'out_of_stock' => GroupOrderProduct::where('stock', 0)->count(),
        ]);
    }

    /**
     * POST /api/admin/group-order-products
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'weight_range' => ['required', 'string', 'max:100', 'unique:group_orders_products,weight_range'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $product = GroupOrderProduct::create($data);

        return response()->json($product, 201);
    }

    /**
     * PUT /api/admin/group-order-products/{groupOrderProduct}
     */
    public function update(Request $request, GroupOrderProduct $groupOrderProduct): JsonResponse
    {
        $data = $request->validate([
            'weight_range' => [
                'required',
                'string',
                'max:100',
                Rule::unique('group_orders_products', 'weight_range')->ignore($groupOrderProduct->id),
            ],
            'price' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $groupOrderProduct->update($data);

        return response()->json($groupOrderProduct->fresh());
    }

    /**
     * PATCH /api/admin/group-order-products/{groupOrderProduct}/stock
     */
    public function updateStock(Request $request, GroupOrderProduct $groupOrderProduct): JsonResponse
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);

        $groupOrderProduct->update([
            'stock' => $data['stock'],
        ]);

        return response()->json($groupOrderProduct->fresh());
    }

    /**
     * PATCH /api/admin/group-order-products/{groupOrderProduct}/availability
     */
    public function availability(Request $request, GroupOrderProduct $groupOrderProduct): JsonResponse
    {
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $groupOrderProduct->update([
            'is_active' => $data['is_active'],
        ]);

        return response()->json($groupOrderProduct->fresh());
    }

    /**
     * DELETE /api/admin/group-order-products/{groupOrderProduct}
     */
    public function destroy(GroupOrderProduct $groupOrderProduct): JsonResponse
    {
        $groupOrderProduct->delete();

        return response()->json(['deleted' => true]);
    }
}
