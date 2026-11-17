<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\CustomerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const PER_PAGE = 10;

    /**
     * Orders page table: GET /api/admin/orders?search=&status=&page=
     * search matches the order number or the customer's name.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(Order::STATUSES)],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $orders = Order::with('user:id,name')
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['search'] ?? null, function ($q, $search) {
                $term = '%'.addcslashes(ltrim($search, '#'), '%_\\').'%';
                $q->where(fn ($q) => $q
                    ->where('order_number', 'like', $term)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $term)));
            })
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Order $order) => $this->summary($order));

        return response()->json($orders);
    }

    /** The four cards on the Orders page. */
    public function stats(): JsonResponse
    {
        $weekAgo = now()->subDays(7);

        return response()->json([
            'total' => Order::count(),
            'processing' => Order::where('status', Order::STATUS_PROCESSING)->count(),
            'ready_for_collection' => Order::where('status', Order::STATUS_READY_FOR_COLLECTION)->count(),
            'completed_last_7_days' => Order::whereIn('status', Order::COMPLETED_STATUSES)
                ->where('updated_at', '>=', $weekAgo)
                ->count(),
        ]);
    }

    /** The 5 newest orders for the dashboard table. */
    public function recent(): JsonResponse
    {
        $orders = Order::with('user:id,name')
            ->latest()
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Order $order) => $this->summary($order));

        return response()->json($orders);
    }

    /** Number of orders still waiting to be processed (drives the bell icon). */
    public function pendingCount(): JsonResponse
    {
        return response()->json([
            'count' => Order::where('status', Order::STATUS_PENDING)->count(),
        ]);
    }

    /** Full order details for the "View" button, including everything needed to prepare it. */
    public function show(Order $order): JsonResponse
    {
        $order->load([
            'user:id,name,email,phone',
            'items.productVariant',
            'items.cutSelections.cutOption',
            'groupOrder.members',
            'groupOrder.deliveryMember',
        ]);

        $isDelivery = $order->fulfillment_type === Order::FULFILLMENT_DELIVERY;

        return response()->json([
            ...$this->summary($order),
            'customer_email' => $order->user?->email,
            'customer_phone' => $order->user?->phone,
            'created_at' => $order->created_at->toIso8601String(),
            'delivery_fee' => (float) ($order->delivery_fee ?? 0),
            'delivery' => $isDelivery ? [
                'address_line_1' => $order->delivery_address_line_1,
                'address_line_2' => $order->delivery_address_line_2,
                'city' => $order->delivery_city,
                'province' => $order->delivery_province,
                'postal_code' => $order->delivery_postal_code,
                'instructions' => $order->delivery_instructions,
                'zone' => $order->delivery_zone_number,
            ] : null,
            'items' => $order->items->map(fn ($item) => $this->itemDetails($item)),
            'group_order' => $this->groupOrderDetails($order),
        ]);
    }

    /** One order line, with its cut sheet when the customer chose custom cuts. */
    private function itemDetails($item): array
    {
        $variant = $item->productVariant;

        return [
            'id' => $item->id,
            'product_name' => $item->product_name,
            'grade' => $item->grade ?? $variant?->grade,
            'weight_range' => $variant && $variant->weight_min_kg !== null
                ? rtrim(rtrim((string) $variant->weight_min_kg, '0'), '.').'–'
                    .rtrim(rtrim((string) $variant->weight_max_kg, '0'), '.').' kg'
                : null,
            'quantity' => $item->quantity,
            'unit_price' => (float) $item->unit_price,
            'line_total' => (float) $item->line_total,
            'cut_type' => $item->cut_type,
            'selected_quarter' => $item->selected_quarter,
            'remaining_meat_preferences' => $item->remaining_meat_preferences ?? [],
            'special_instructions' => $item->special_instructions,
            // Grouped so the butcher can work side by side, quarter by quarter
            'cut_selections' => $item->cutSelections
                ->sortBy(fn ($s) => $s->side.'-'.($s->quarter === 'front' ? 0 : 1))
                ->groupBy(fn ($s) => 'Side '.$s->side.', '.ucfirst($s->quarter).' quarter')
                ->map(fn ($group) => $group->map(fn ($s) => $s->cutOption?->name ?? 'Unknown cut')->values())
                ->toArray(),
        ];
    }

    /** Members, delivery recipient and extras when this order pays for a group order. */
    private function groupOrderDetails(Order $order): ?array
    {
        $group = $order->groupOrder;

        if (! $group) {
            return null;
        }

        return [
            'weight_range' => $group->weight_range,
            'number_of_people' => $group->number_of_people,
            'include_ground_beef' => (bool) $group->include_ground_beef,
            'delivery_method' => $group->delivery_method,
            'address' => $group->delivery_method === 'collection' ? null : [
                'address_line_1' => $group->address_line_1,
                'address_line_2' => $group->address_line_2,
                'city' => $group->city,
                'province' => $group->province,
                'postal_code' => $group->postal_code,
                'instructions' => $group->delivery_instructions,
            ],
            'delivery_member' => $group->deliveryMember?->name,
            'members' => $group->members->map(fn ($m) => [
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
            ])->values(),
        ];
    }

    /** "Change Status" button: PATCH /api/admin/orders/{order}/status */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            // Only statuses that fit this order's fulfillment type are accepted
            'status' => [
                'required', Rule::in(Order::statusesFor($order->fulfillment_type))
                ],
        ]);

        $oldStatus = $order->status;
        $newStatus = $data['status'];

        if ($oldStatus ===$newStatus) {
            return response()->json($this->summary($order ->load('user:id,name')
            ));
        }

        $order->update(['status' => $newStatus]);

        $order->load('user');
        $customer = $order->user;

        if($customer){

            $notification = $this->getStatusNotification($order);

            $customer->notify(new CustomerNotification(
                subject: $notification['subject'],
                lines: $notification['lines'],
                buttonText: 'View Order',
                path: '/account/orders/'.$order->id,
                category: 'orders'
            ));
        }
        return response()->json(
            $this->summary($order->load('user:id,name')));
    }




private function getStatusNotification(Order $order): array
    {

        $orderNumber = $order->order_number ?? 'ORD-' .$order->id;

        $message = [
            Order:: STATUS_PENDING => [
                'subject' => 'Order Received',
                'lines' => [
                    "We have received your order {$orderNumber}.",
                    'Your order is awaiting processing'
                ],
            ],

             Order::STATUS_PROCESSING => [
            'subject' => 'Order Being Processed',
            'lines' => [
                "Your order {$orderNumber} is now being processed.",
                'We will notify you when there is another update.',
            ],
        ],

        Order::STATUS_READY_FOR_COLLECTION => [
            'subject' => 'Order Ready for Collection',
            'lines' => [
                "Your order {$orderNumber} is ready for collection.",
                'You can now arrange to collect your order.',
            ],
        ],

         Order::STATUS_OUT_FOR_DELIVERY => [
            'subject' => 'Order Out for Delivery',
            'lines' => [
                "Your order {$orderNumber} is out for delivery.",
                'Your order is on its way!',
            ],
        ],


         Order::STATUS_COLLECTED => [
            'subject' => 'Order Collected',
            'lines' => [
                "Your order {$orderNumber} has been successfully collected.",
                'Thank you for shopping with Syrol Group!',
            ],
        ],

        Order::STATUS_DELIVERED => [
            'subject' => 'Order Delivered',
            'lines' => [
                "Your order {$orderNumber} has been successfully delivered.",
                'Thank you for shopping with Syrol Group!',
            ],
        ],


         Order::STATUS_CANCELLED => [
            'subject' => 'Order Cancelled',
            'lines' => [
                "Your order {$orderNumber} has been cancelled.",
                'Please contact our support team if you have any questions.',
            ],
        ],
    ];
        return $message [$order->status] ?? [
            'subject' => "Order status updated",
            'lines' => [
                "The status of order {$orderNumber} has been updated to {$order->status}.",
                'Please check your account for more details.',
                'Thank you for shopping with us!'
            ],
        ];


        //return compact('subject', 'lines');
    }


    private function summary(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer' => $order->user?->name ?? 'Deleted customer',
            'date' => $order->created_at->toDateString(),
            'total' => (float) $order->total,
            'fulfillment_type' => $order->fulfillment_type,
            'status' => $order->status,
            'allowed_statuses' => Order::statusesFor($order->fulfillment_type),
        ];
    }
}
