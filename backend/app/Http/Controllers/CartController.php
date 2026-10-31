<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CutOption;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $cart->load([
            'items.product',
            'items.productVariant',
            'items.cutSelections.cutOption',
            'groupOrder.members',
            'groupOrder.deliveryMember',
        ]);

        // Flag items that sold out (or were switched off) after they were added,
        // so the cart can warn the customer before checkout instead of at payment.
        $hasUnavailable = false;

        foreach ($cart->items as $item) {
            $product = $item->product;
            $variant = $item->productVariant;

            $availableStock = 0;
            $available = false;

            if (
                $product &&
                $product->is_active &&
                $product->status === 'published'
            ) {
                if ($product->product_type === Product::TYPE_CARCASS) {
                    if (
                        $variant &&
                        (int) $variant->product_id === (int) $product->id &&
                        $variant->is_active
                    ) {
                        $availableStock = (int) $variant->stock;

                        $totalForVariant = $cart->items
                            ->where('product_variant_id', $variant->id)
                            ->sum('quantity');

                        $available = $availableStock > 0
                            && $totalForVariant <= $availableStock;
                    }
                } elseif ($product->product_type === Product::TYPE_FIXED_PRICE) {
                    if (! $variant) {
                        $availableStock = (int) $product->stock;

                        $totalForProduct = $cart->items
                            ->filter(fn ($cartItem) => (int) $cartItem->product_id === (int) $product->id
                                && $cartItem->product_variant_id === null
                            )
                            ->sum('quantity');

                        $available = $availableStock > 0
                            && $totalForProduct <= $availableStock;
                    }
                }
            }

            $item->setAttribute('is_available', $available);
            $item->setAttribute('available_stock', $availableStock);

            $hasUnavailable = $hasUnavailable || ! $available;
        }

        return response()->json([
            'cart' => $cart,
            'has_unavailable_items' => $hasUnavailable,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => [
                'nullable',
                'integer',
                'exists:product_variants,id',
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'cut_type' => ['required', 'in:traditional,custom'],
            'selected_quarter' => ['nullable', 'in:front,hind'],

            'remaining_meat_preferences' => ['nullable', 'array'],
            'remaining_meat_preferences.*' => [
                'string',
                'in:steaks,stew,mince,butcher_choice',
            ],

            'special_instructions' => ['nullable', 'string', 'max:2000'],

            'selections' => ['nullable', 'array'],
            'selections.*.cut_option_id' => [
                'required',
                'integer',
                'exists:cut_options,id',
            ],
            'selections.*.side' => ['required', 'in:A,B'],
            'selections.*.quarter' => ['required', 'in:front,hind'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $variant = null;

        if ($product->product_type === Product::TYPE_CARCASS) {
            if (empty($validated['product_variant_id'])) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'Please select a carcass weight and price option.',
                    ],
                ]);
            }

            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->find($validated['product_variant_id']);

            if (! $variant) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'The selected variant does not belong to this product.',
                    ],
                ]);
            }
        } elseif ($product->product_type === Product::TYPE_FIXED_PRICE) {
            if (! empty($validated['product_variant_id'])) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'This product does not require a variant.',
                    ],
                ]);
            }
        } else {
            return response()->json([
                'message' => 'This product cannot currently be purchased.',
            ], 422);
        }

        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        if ($stockError = $this->stockError(
            $product,
            $cart,
            (int) $validated['quantity'],
            null,
            $variant
        )) {
            return $stockError;
        }

        $productType = $this->getProductType($product->name);

        if ($validated['cut_type'] === 'traditional') {
            $validated['selected_quarter'] = null;
            $validated['selections'] = [];
            $validated['remaining_meat_preferences'] = null;
            $validated['special_instructions'] = null;
        }

        if ($validated['cut_type'] === 'custom') {
            $remainingMeatPreferences =
                $validated['remaining_meat_preferences'] ?? [];

            if (
                in_array('butcher_choice', $remainingMeatPreferences, true) &&
                count($remainingMeatPreferences) > 1
            ) {
                throw ValidationException::withMessages([
                    'remaining_meat_preferences' => [
                        "Butcher's Choice cannot be combined with other remaining meat options.",
                    ],
                ]);
            }

            $this->validateCustomCuts(
                $productType,
                $validated['selected_quarter'] ?? null,
                $validated['selections'] ?? []
            );
        }

        $cartItem = DB::transaction(function () use (
            $cart,
            $product,
            $variant,
            $validated
        ) {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'quantity' => $validated['quantity'],
                'cut_type' => $validated['cut_type'],
                'selected_quarter' => $validated['selected_quarter'] ?? null,
                'remaining_meat_preferences' => $validated['remaining_meat_preferences'] ?? null,
                'special_instructions' => $validated['special_instructions'] ?? null,
            ]);

            if ($validated['cut_type'] === 'custom') {
                $this->saveCutSelections(
                    $cartItem,
                    $validated['selections'] ?? []
                );
            }

            return $cartItem;
        });

        return response()->json([
            'message' => 'Product added to cart.',
            'cart_item' => $cartItem->load([
                'product',
                'productVariant',
                'cutSelections.cutOption',
            ]),
        ], 201);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'product_variant_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:product_variants,id',
            ],

            'cut_type' => ['required', 'in:traditional,custom'],
            'selected_quarter' => ['nullable', 'in:front,hind'],

            'selections' => ['nullable', 'array'],
            'selections.*.cut_option_id' => [
                'required',
                'integer',
                'exists:cut_options,id',
            ],
            'selections.*.side' => ['required', 'in:A,B'],
            'selections.*.quarter' => ['required', 'in:front,hind'],

            'remaining_meat_preferences' => ['nullable', 'array'],
            'remaining_meat_preferences.*' => [
                'string',
                'in:steaks,stew,mince,butcher_choice',
            ],

            'special_instructions' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->ensureCartItemBelongsToUser($request, $cartItem);

        $product = $cartItem->product;

        if (! $product) {
            return response()->json([
                'message' => 'The product for this cart item no longer exists.',
            ], 422);
        }

        $variantId = array_key_exists('product_variant_id', $validated)
            ? $validated['product_variant_id']
            : $cartItem->product_variant_id;

        $variant = null;

        if ($product->product_type === Product::TYPE_CARCASS) {
            if (! $variantId) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'Please select a carcass weight and price option.',
                    ],
                ]);
            }

            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->find($variantId);

            if (! $variant) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'The selected variant does not belong to this product.',
                    ],
                ]);
            }
        } elseif ($product->product_type === Product::TYPE_FIXED_PRICE) {
            if ($variantId !== null) {
                throw ValidationException::withMessages([
                    'product_variant_id' => [
                        'This product does not require a variant.',
                    ],
                ]);
            }
        } else {
            return response()->json([
                'message' => 'This product cannot currently be purchased.',
            ], 422);
        }

        if ($stockError = $this->stockError(
            $product,
            $cartItem->cart,
            (int) $validated['quantity'],
            $cartItem->id,
            $variant
        )) {
            return $stockError;
        }

        $productType = $this->getProductType($product->name);

        if ($validated['cut_type'] === 'traditional') {
            $validated['selected_quarter'] = null;
            $validated['selections'] = [];
            $validated['remaining_meat_preferences'] = null;
            $validated['special_instructions'] = null;
        }

        if ($validated['cut_type'] === 'custom') {
            $remainingMeatPreferences =
                $validated['remaining_meat_preferences'] ?? [];

            if (
                in_array('butcher_choice', $remainingMeatPreferences, true) &&
                count($remainingMeatPreferences) > 1
            ) {
                throw ValidationException::withMessages([
                    'remaining_meat_preferences' => [
                        "Butcher's Choice cannot be combined with other remaining meat options.",
                    ],
                ]);
            }

            $this->validateCustomCuts(
                $productType,
                $validated['selected_quarter'] ?? null,
                $validated['selections'] ?? []
            );
        }

        DB::transaction(function () use ($cartItem, $variant, $validated) {
            $cartItem->update([
                'product_variant_id' => $variant?->id,
                'quantity' => $validated['quantity'],
                'cut_type' => $validated['cut_type'],
                'selected_quarter' => $validated['selected_quarter'] ?? null,
                'remaining_meat_preferences' => $validated['remaining_meat_preferences'] ?? null,
                'special_instructions' => $validated['special_instructions'] ?? null,
            ]);

            $cartItem->cutSelections()->delete();

            if ($validated['cut_type'] === 'custom') {
                $this->saveCutSelections(
                    $cartItem,
                    $validated['selections'] ?? []
                );
            }
        });

        return response()->json([
            'message' => 'Cart item updated.',
            'cart_item' => $cartItem->load([
                'product',
                'productVariant',
                'cutSelections.cutOption',
            ]),
        ]);
    }

    public function remove(
        Request $request,
        CartItem $cartItem
    ): JsonResponse {
        $this->ensureCartItemBelongsToUser(
            $request,
            $cartItem
        );

        $cartItem->delete();

        return response()->json([
            'message' => 'Cart item removed.',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'message' => 'Cart cleared.',
        ]);
    }

    /**
     * Stops a product going into the cart if it's sold out, switched off or a draft,
     * or if the cart would hold more than is in stock. Returns null when it's fine.
     */
    private function stockError(
        Product $product,
        Cart $cart,
        int $quantity,
        ?int $ignoreItemId = null,
        ?ProductVariant $variant = null
    ): ?JsonResponse {
        if (! $product->is_active || $product->status !== 'published') {
            return response()->json([
                'message' => 'Sorry, this product is currently unavailable.',
            ], 422);
        }

        if ($product->product_type === Product::TYPE_CARCASS) {
            if (! $variant || (int) $variant->product_id !== (int) $product->id) {
                return response()->json([
                    'message' => 'Please select a valid carcass variant.',
                ], 422);
            }

            if (! $variant->is_active || (int) $variant->stock < 1) {
                return response()->json([
                    'message' => 'Sorry, this carcass variant is out of stock.',
                ], 422);
            }

            $availableStock = (int) $variant->stock;

            $cartItemsQuery = $cart->items()
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variant->id);
        } elseif ($product->product_type === Product::TYPE_FIXED_PRICE) {
            if ($variant !== null) {
                return response()->json([
                    'message' => 'This product does not require a variant.',
                ], 422);
            }

            if ((int) $product->stock < 1) {
                return response()->json([
                    'message' => 'Sorry, this product is out of stock.',
                ], 422);
            }

            $availableStock = (int) $product->stock;

            $cartItemsQuery = $cart->items()
                ->where('product_id', $product->id)
                ->whereNull('product_variant_id');
        } else {
            return response()->json([
                'message' => 'This product cannot currently be purchased.',
            ], 422);
        }

        $alreadyInCart = (int) $cartItemsQuery
            ->when(
                $ignoreItemId,
                fn ($query) => $query->where('id', '!=', $ignoreItemId)
            )
            ->sum('quantity');

        $remainingStock = max(0, $availableStock - $alreadyInCart);

        if ($quantity > $remainingStock) {
            return response()->json([
                'message' => $remainingStock > 0
                    ? "Only {$remainingStock} of this item "
                        .($remainingStock === 1 ? 'is' : 'are')
                        .' available.'
                    : 'You already have all available stock of this item in your cart.',
            ], 422);
        }

        return null;
    }

    private function ensureCartItemBelongsToUser(
        Request $request,
        CartItem $cartItem
    ): void {
        if ($cartItem->cart->user_id !== $request->user()->id) {
            abort(403, 'You do not have access to this cart item.');
        }
    }

    private function getProductType(string $productName): string
    {
        $name = strtolower($productName);

        if (str_contains($name, 'quarter')) {
            return 'quarter';
        }

        if (str_contains($name, 'half')) {
            return 'half';
        }

        return 'full';
    }

    private function validateCustomCuts(
        string $productType,
        ?string $selectedQuarter,
        array $selections
    ): void {
        if ($productType === 'quarter' && $selectedQuarter === null) {
            throw ValidationException::withMessages([
                'selected_quarter' => [
                    'Please select either a front or hind quarter.',
                ],
            ]);
        }

        if ($productType === 'quarter') {
            foreach ($selections as $selection) {
                if (
                    $selection['side'] !== 'A' ||
                    $selection['quarter'] !== $selectedQuarter
                ) {
                    throw ValidationException::withMessages([
                        'selections' => [
                            'Selections must belong to the selected quarter on Side A.',
                        ],
                    ]);
                }
            }
        }

        if ($productType === 'half') {
            foreach ($selections as $selection) {
                if ($selection['side'] !== 'A') {
                    throw ValidationException::withMessages([
                        'selections' => [
                            'Side B is not available for a half carcass.',
                        ],
                    ]);
                }
            }
        }

        $this->validateCutOptions($selections);
        $this->validateRibSelection($selections);
        $this->validateSoupBones(
            $productType,
            $selectedQuarter,
            $selections
        );
    }

    private function validateCutOptions(array $selections): void
    {
        foreach ($selections as $selection) {
            $cut = CutOption::find($selection['cut_option_id']);

            if (! $cut) {
                throw ValidationException::withMessages([
                    'selections' => [
                        'One or more selected cuts are invalid.',
                    ],
                ]);
            }

            if ($cut->quarter !== $selection['quarter']) {
                throw ValidationException::withMessages([
                    'selections' => [
                        "{$cut->name} is not available for the selected quarter.",
                    ],
                ]);
            }
        }
    }

    private function validateRibSelection(array $selections): void
    {
        $ribNames = [
            'Rib Steak',
            'Rib Eye',
            'Prime Rib',
        ];

        $selectedRibs = [];

        foreach ($selections as $selection) {
            $cut = CutOption::find($selection['cut_option_id']);

            if ($cut && in_array($cut->name, $ribNames, true)) {
                $selectedRibs[] = $cut->name;
            }
        }

        if (count(array_unique($selectedRibs)) > 1) {
            throw ValidationException::withMessages([
                'selections' => [
                    'Please select only one of Rib Steak, Rib Eye, or Prime Rib.',
                ],
            ]);
        }
    }

    private function validateSoupBones(
        string $productType,
        ?string $selectedQuarter,
        array $selections
    ): void {
        $selectedCutIds = array_column(
            $selections,
            'cut_option_id'
        );

        $requiredQuarters = match ($productType) {
            'quarter' => [$selectedQuarter],
            'half' => ['front', 'hind'],
            'full' => ['front', 'hind'],
        };

        foreach ($requiredQuarters as $quarter) {
            $soupBones = CutOption::where('name', 'Soup Bones')
                ->where('quarter', $quarter)
                ->first();

            if (
                $soupBones &&
                ! in_array($soupBones->id, $selectedCutIds, true)
            ) {
                throw ValidationException::withMessages([
                    'selections' => [
                        "Soup Bones must be included for the {$quarter} quarter.",
                    ],
                ]);
            }
        }
    }

    private function saveCutSelections(
        CartItem $cartItem,
        array $selections
    ): void {
        foreach ($selections as $selection) {
            $cartItem->cutSelections()->create([
                'cut_option_id' => $selection['cut_option_id'],
                'side' => $selection['side'],
                'quarter' => $selection['quarter'],
            ]);
        }
    }
}
