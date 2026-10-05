<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CutOption;
use App\Models\Product;
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
            'items.cutSelections.cutOption',
            'groupOrder.members',
            'groupOrder.deliveryMember',
        ]);

        return response()->json([
            'cart' => $cart,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'cut_type' => ['required', 'in:traditional,custom'],
            'selected_quarter' => ['nullable', 'in:front,hind'],
            'remaining_meat_preferences' => [
                'nullable',
                'array',
            ],

            'remaining_meat_preferences.*' => [
                'string',
                'in:steaks,stew,mince,butcher_choice',
            ],

            'special_instructions' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'selections' => ['nullable', 'array'],
            'selections.*.cut_option_id' => [
                'required',
                'integer',
                'exists:cut_options,id',
            ],
            'selections.*.side' => [
                'required',
                'in:A,B',
            ],
            'selections.*.quarter' => [
                'required',
                'in:front,hind',
            ],

        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (! $product->is_active) {
            return response()->json([
                'message' => 'This product is no longer available.',
            ], 422);
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

        $cart = Cart::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $cartItem = DB::transaction(function () use (
            $cart,
            $product,
            $validated
        ) {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'cut_type' => $validated['cut_type'],
                'selected_quarter' => $validated['selected_quarter'],
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
                'cutSelections.cutOption',
            ]),
        ], 201);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],

            'cut_type' => [
                'required',
                'in:traditional,custom',
            ],

            'selected_quarter' => [
                'nullable',
                'in:front,hind',
            ],

            'selections' => [
                'nullable',
                'array',
            ],

            'selections.*.cut_option_id' => [
                'required',
                'integer',
                'exists:cut_options,id',
            ],

            'selections.*.side' => [
                'required',
                'in:A,B',
            ],

            'selections.*.quarter' => [
                'required',
                'in:front,hind',
            ],

            'remaining_meat_preferences' => [
                'nullable',
                'array',
            ],

            'remaining_meat_preferences.*' => [
                'string',
                'in:steaks,stew,mince,butcher_choice',
            ],

            'special_instructions' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $this->ensureCartItemBelongsToUser($request, $cartItem);

        $product = $cartItem->product;

        if (! $product->is_active) {
            return response()->json([
                'message' => 'This product is no longer available.',
            ], 422);
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

        DB::transaction(function () use (
            $cartItem,
            $validated
        ) {
            $cartItem->update([
                'quantity' => $validated['quantity'],
                'cut_type' => $validated['cut_type'],
                'selected_quarter' => $validated['selected_quarter'],
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
