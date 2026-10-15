<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Read-only payments log. Payments are created by checkout / the payment gateway,
 * never edited by hand, so there are no update or delete actions here.
 */
class PaymentController extends Controller
{
    private const PER_PAGE = 10;

    /** GET /api/admin/payments?search=&status=&page=  (search matches PAY-… or ORD-… numbers) */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(Payment::STATUSES)],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $payments = Payment::with('order:id,order_number,user_id', 'order.user:id,name')
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['search'] ?? null, function ($q, $search) {
                $term = '%'.addcslashes(ltrim($search, '#'), '%_\\').'%';
                $q->where(fn ($q) => $q
                    ->where('payment_number', 'like', $term)
                    ->orWhereHas('order', fn ($o) => $o->where('order_number', 'like', $term)));
            })
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Payment $payment) => $this->summary($payment));

        return response()->json($payments);
    }

    /** The four cards on the Payments page. */
    public function stats(): JsonResponse
    {
        $weekAgo = now()->subDays(7);

        return response()->json([
            'total' => Payment::count(),
            'successful_last_7_days' => Payment::where('status', Payment::STATUS_COMPLETED)->where('created_at', '>=', $weekAgo)->count(),
            'pending' => Payment::where('status', Payment::STATUS_PENDING)->count(),
            'failed_last_7_days' => Payment::where('status', Payment::STATUS_FAILED)->where('created_at', '>=', $weekAgo)->count(),
        ]);
    }

    /** "View" button: full payment details. */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load('order.user:id,name,email');

        return response()->json([
            ...$this->summary($payment),
            'method' => $payment->method,
            'provider_reference' => $payment->provider_reference,
            'customer_email' => $payment->order?->user?->email,
            'created_at' => $payment->created_at->toIso8601String(),
            'paid_at' => $payment->paid_at?->toIso8601String(),
            'order_status' => $payment->order?->status,
            'order_total' => (float) $payment->order?->total,
        ]);
    }

    private function summary(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'payment_number' => $payment->payment_number,
            'order_id' => $payment->order_id,
            'order_number' => $payment->order?->order_number,
            'customer' => $payment->order?->user?->name ?? 'Deleted customer',
            'date' => $payment->created_at->toDateString(),
            'amount' => (float) $payment->amount,
            'status' => $payment->status,
        ];
    }
}
