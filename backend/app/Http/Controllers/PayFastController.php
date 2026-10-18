<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\GroupOrder;
use App\Models\Order;
use App\Models\Payment;
use App\Support\GroupOrderMailer;
use App\Support\PayFast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

/**
 * Cart checkout through PayFast.
 *
 * 1. start():  turns the cart into a pending order + pending payment and returns a signed PayFast form.
 *    startGroup(): the same for a group order (the organiser pays the full amount).
 * 2. notify(): PayFast's server tells us the result (ITN). Only this marks a payment as paid.
 * 3. status() / cancel(): used by the "thank you" and "payment cancelled" pages.
 */
class PayFastController extends Controller
{
    /** POST /api/checkout/payfast */
    public function start(Request $request): JsonResponse
    {
        if ($notReady = $this->notConfigured()) {
            return $notReady;
        }

        $data = $request->validate([
            'fulfillment_type' => ['required', Rule::in(Order::FULFILLMENT_TYPES)],
            'address_line_1' => ['required_if:fulfillment_type,delivery', 'nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required_if:fulfillment_type,delivery', 'nullable', 'string', 'max:255'],
            'province' => ['required_if:fulfillment_type,delivery', 'nullable', 'string', 'max:255'],
            'postal_code' => ['required_if:fulfillment_type,delivery', 'nullable', 'string', 'max:20'],
            'instructions' => ['nullable', 'string', 'max:2000'],
        ], [
            'address_line_1.required_if' => 'Choose a delivery address in your cart first.',
            'city.required_if' => 'Choose a delivery address in your cart first.',
            'province.required_if' => 'Choose a delivery address in your cart first.',
            'postal_code.required_if' => 'Choose a delivery address in your cart first.',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with(['items.product', 'items.cutSelections', 'groupOrder'])->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }
        if ($cart->groupOrder) {
            return response()->json(['message' => 'Group orders are paid for separately. Remove the group order from your cart to check out your products.'], 422);
        }

        // Prices always come from the database, never from the browser
        foreach ($cart->items as $item) {
            $product = $item->product;
            if (! $product || ! $product->is_active || $product->status === 'draft') {
                return response()->json(['message' => ($product?->name ?? 'A product').' is no longer available. Remove it from your cart.'], 422);
            }
            if ($product->stock !== null && (int) $product->stock < (int) $item->quantity) {
                return response()->json(['message' => "Only {$product->stock} of {$product->name} (Grade {$product->grade}) left in stock."], 422);
            }
        }

        $delivery = $data['fulfillment_type'] === Order::FULFILLMENT_DELIVERY;

        [$order, $payment] = DB::transaction(function () use ($cart, $user, $data, $delivery) {
            $total = $cart->items->sum(fn ($item) => round((float) $item->product->price * (int) $item->quantity, 2));

            $order = new Order();
            $order->forceFill([
                'user_id' => $user->id,
                'fulfillment_type' => $data['fulfillment_type'],
                'status' => Order::STATUS_PENDING,
                'total' => $total,
                'delivery_address_line_1' => $delivery ? $data['address_line_1'] : null,
                'delivery_address_line_2' => $delivery ? ($data['address_line_2'] ?? null) : null,
                'delivery_city' => $delivery ? $data['city'] : null,
                'delivery_province' => $delivery ? $data['province'] : null,
                'delivery_postal_code' => $delivery ? $data['postal_code'] : null,
                'delivery_instructions' => $delivery ? ($data['instructions'] ?? null) : null,
            ])->save();

            foreach ($cart->items as $cartItem) {
                $price = (float) $cartItem->product->price;
                $orderItem = $order->items()->create([
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'grade' => $cartItem->product->grade,
                    'price' => $price,
                    'unit_price' => $price,
                    'quantity' => $cartItem->quantity,
                    'line_total' => round($price * (int) $cartItem->quantity, 2),
                    'cut_type' => $cartItem->cut_type,
                    'selected_quarter' => $cartItem->selected_quarter,
                ]);

                foreach ($cartItem->cutSelections as $selection) {
                    $orderItem->cutSelections()->create([
                        'cut_option_id' => $selection->cut_option_id,
                        'side' => $selection->side,
                        'quarter' => $selection->quarter,
                    ]);
                }
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $total,
                'status' => Payment::STATUS_PENDING,
                'method' => 'payfast',
            ]);

            return [$order->fresh(), $payment->fresh()];
        });

        Log::info('PayFast checkout started', ['order' => $order->order_number, 'payment' => $payment->payment_number, 'amount' => $payment->amount]);

        return $this->payfastForm($order, $payment, $user, 'PrimeMeat order '.$order->order_number);
    }

    /**
     * POST /api/group-orders/{groupOrder}/payfast
     * The organiser pays the whole group order in one payment. The price comes from
     * the group order saved on the server, never from the browser.
     */
    public function startGroup(Request $request, GroupOrder $groupOrder): JsonResponse
    {
        if ($notReady = $this->notConfigured()) {
            return $notReady;
        }

        $user = $request->user();

        // Same "not found" answer for someone else's group order
        abort_if($groupOrder->user_id !== $user->id, 404, 'Group order not found.');

        [$order, $payment] = DB::transaction(function () use ($groupOrder, $user) {
            // Lock the row so two quick clicks can't create two orders
            $groupOrder = GroupOrder::whereKey($groupOrder->id)->lockForUpdate()->first();
            $order = $groupOrder->order_id ? Order::find($groupOrder->order_id) : null;

            if ($order && $order->payments()->where('status', Payment::STATUS_COMPLETED)->exists()) {
                return [null, null]; // already paid
            }

            $delivery = $groupOrder->delivery_method === Order::FULFILLMENT_DELIVERY;
            $total = round((float) $groupOrder->price, 2);

            $details = [
                'fulfillment_type' => $delivery ? Order::FULFILLMENT_DELIVERY : Order::FULFILLMENT_COLLECTION,
                'status' => Order::STATUS_PENDING,
                'total' => $total,
                'delivery_address_line_1' => $delivery ? $groupOrder->address_line_1 : null,
                'delivery_address_line_2' => $delivery ? $groupOrder->address_line_2 : null,
                'delivery_city' => $delivery ? $groupOrder->city : null,
                'delivery_province' => $delivery ? $groupOrder->province : null,
                'delivery_postal_code' => $delivery ? $groupOrder->postal_code : null,
                'delivery_instructions' => $delivery ? $groupOrder->delivery_instructions : null,
            ];

            if (! $order) {
                $order = new Order();
                $order->forceFill(['user_id' => $user->id] + $details)->save();

                // One line on the order, so the admin panel shows what was bought
                $weight = str_replace('-', '–', (string) $groupOrder->weight_range);
                $order->items()->create([
                    'product_id' => null,
                    'product_name' => "Group order: Full Carcass ({$weight} kg), {$groupOrder->number_of_people} people"
                        .($groupOrder->include_ground_beef ? ', with ground beef' : ''),
                    'grade' => null,
                    'price' => $total,
                    'unit_price' => $total,
                    'quantity' => 1,
                    'line_total' => $total,
                    'cut_type' => 'traditional',
                    'selected_quarter' => null,
                ]);

                $groupOrder->forceFill(['order_id' => $order->id])->save();
            } else {
                // An earlier attempt was cancelled or abandoned: reuse the same order
                $order->forceFill($details)->save();
                $order->payments()->where('status', Payment::STATUS_PENDING)->update(['status' => Payment::STATUS_FAILED]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $total,
                'status' => Payment::STATUS_PENDING,
                'method' => 'payfast',
            ]);

            return [$order->fresh(), $payment->fresh()];
        });

        if (! $order) {
            return response()->json(['message' => 'This group order has already been paid.'], 422);
        }

        Log::info('PayFast group checkout started', ['group_order' => $groupOrder->id, 'order' => $order->order_number, 'payment' => $payment->payment_number, 'amount' => $payment->amount]);

        return $this->payfastForm($order, $payment, $user, 'PrimeMeat group order '.$order->order_number);
    }

    /** The signed form the browser posts to PayFast. */
    private function payfastForm(Order $order, Payment $payment, $user, string $itemName): JsonResponse
    {
        $config = config('services.payfast');
        [$first, $last] = array_pad(explode(' ', trim($user->name), 2), 2, '');
        $frontend = rtrim($config['frontend_url'], '/');

        // Field order matters for the signature (PayFast's documented order)
        $fields = PayFast::sign([
            'merchant_id' => $config['merchant_id'],
            'merchant_key' => $config['merchant_key'],
            'return_url' => $frontend.'/checkout/success?payment='.$payment->payment_number,
            'cancel_url' => $frontend.'/checkout/cancelled?payment='.$payment->payment_number,
            'notify_url' => $config['notify_url'],
            'name_first' => mb_substr($first, 0, 100),
            'name_last' => mb_substr($last, 0, 100),
            'email_address' => $user->email,
            'm_payment_id' => $payment->payment_number,
            'amount' => number_format((float) $payment->amount, 2, '.', ''),
            'item_name' => mb_substr($itemName, 0, 100),
        ]);

        return response()->json(['url' => PayFast::processUrl(), 'fields' => $fields]);
    }

    private function notConfigured(): ?JsonResponse
    {
        $config = config('services.payfast');
        if (! $config['merchant_id'] || ! $config['merchant_key'] || ! $config['notify_url']) {
            return response()->json(['message' => 'Online payment is not set up yet. Please try again later.'], 503);
        }

        return null;
    }

    /**
     * POST /api/payfast/notify  (called by PayFast's server, not the browser)
     * Always answers 200 so PayFast stops resending, except when PayFast itself
     * couldn't be reached to confirm, where a 503 makes PayFast try again later.
     */
    public function notify(Request $request): Response
    {
        $data = $request->request->all();
        $paramString = PayFast::itnParamString($data);
        $reference = $data['m_payment_id'] ?? '?';

        if (! PayFast::validSignature($data, $paramString)) {
            Log::warning('PayFast ITN rejected: bad signature', ['payment' => $reference]);

            return response('OK');
        }
        if (! PayFast::validSourceIp($request)) {
            Log::warning('PayFast ITN rejected: not from a PayFast server', ['payment' => $reference, 'ip' => $request->ip()]);

            return response('OK');
        }

        $payment = Payment::where('payment_number', $reference)->with('order')->first();
        if (! $payment || ! $payment->order) {
            Log::warning('PayFast ITN rejected: unknown payment', ['payment' => $reference]);

            return response('OK');
        }
        if (! PayFast::validAmount((float) $payment->amount, $data['amount_gross'] ?? null)) {
            Log::warning('PayFast ITN rejected: amount mismatch', ['payment' => $reference, 'expected' => $payment->amount, 'received' => $data['amount_gross'] ?? null]);

            return response('OK');
        }

        try {
            if (! PayFast::confirmWithServer($paramString)) {
                Log::warning('PayFast ITN rejected: PayFast did not confirm it', ['payment' => $reference]);

                return response('OK');
            }
        } catch (Throwable $e) {
            Log::error('PayFast ITN: could not reach PayFast to confirm, asking for a retry', ['payment' => $reference, 'error' => $e->getMessage()]);

            return response('Retry', 503);
        }

        if ($payment->status === Payment::STATUS_COMPLETED) {
            return response('OK'); // already processed (PayFast can send an ITN more than once)
        }

        $status = strtoupper((string) ($data['payment_status'] ?? ''));

        if ($status === 'COMPLETE') {
            $groupOrderId = GroupOrder::where('order_id', $payment->order_id)->value('id');

            DB::transaction(function () use ($payment, $data, $groupOrderId) {
                $payment->forceFill([
                    'status' => Payment::STATUS_COMPLETED,
                    'provider_reference' => $data['pf_payment_id'] ?? null,
                    'paid_at' => now(),
                ])->save();

                $order = $payment->order()->with('items.product')->first();
                if ($order->status === Order::STATUS_PENDING) {
                    $order->forceFill(['status' => Order::STATUS_PROCESSING])->save();
                }

                // Take the sold items out of stock (this also triggers low-stock alerts)
                foreach ($order->items as $item) {
                    if ($item->product && $item->product->stock !== null) {
                        $item->product->forceFill(['stock' => max(0, (int) $item->product->stock - (int) $item->quantity)])->save();
                    }
                }

                // Payment confirmed: now the cart can be emptied. A group order is a
                // separate purchase, so the organiser's normal cart is left alone.
                if (! $groupOrderId) {
                    Cart::where('user_id', $order->user_id)->first()?->items()->delete();
                }
            });

            if ($groupOrderId) {
                GroupOrderMailer::sendConfirmations($groupOrderId);
            }

            Log::info('PayFast payment completed', ['payment' => $reference, 'pf_payment_id' => $data['pf_payment_id'] ?? null, 'group_order' => $groupOrderId]);
        } elseif (in_array($status, ['CANCELLED', 'FAILED'], true)) {
            $this->markFailed($payment);
            Log::info('PayFast payment not completed', ['payment' => $reference, 'status' => $status]);
        } else {
            Log::info('PayFast ITN ignored', ['payment' => $reference, 'status' => $status]);
        }

        return response('OK');
    }

    /** GET /api/checkout/payments/{paymentNumber}: for the "thank you" page */
    public function status(Request $request, string $paymentNumber): JsonResponse
    {
        $payment = $this->ownPayment($request, $paymentNumber);

        return response()->json([
            'payment_number' => $payment->payment_number,
            'status' => $payment->status,
            'amount' => (float) $payment->amount,
            'order_number' => $payment->order->order_number,
            'order_status' => $payment->order->status,
            // Lets the result page link back to the group order instead of the cart
            'group_order_id' => GroupOrder::where('order_id', $payment->order_id)->value('id'),
        ]);
    }

    /** POST /api/checkout/payments/{paymentNumber}/cancel: customer pressed "cancel" on PayFast */
    public function cancel(Request $request, string $paymentNumber): JsonResponse
    {
        $payment = $this->ownPayment($request, $paymentNumber);

        if ($payment->status === Payment::STATUS_PENDING) {
            $this->markFailed($payment);
        }

        return $this->status($request, $paymentNumber);
    }

    private function ownPayment(Request $request, string $paymentNumber): Payment
    {
        $payment = Payment::where('payment_number', $paymentNumber)->with('order')->first();

        // Same "not found" answer for someone else's payment, so numbers can't be probed
        abort_if(! $payment || ! $payment->order || $payment->order->user_id !== $request->user()->id, 404, 'Payment not found.');

        return $payment;
    }

    private function markFailed(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $payment->forceFill(['status' => Payment::STATUS_FAILED])->save();

            $order = $payment->order;
            if ($order && $order->status === Order::STATUS_PENDING) {
                $order->forceFill(['status' => Order::STATUS_CANCELLED])->save();
            }
        });
    }
}
