<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private const PERIOD_DAYS = 7;

    /**
     * The four stat cards.
     *
     * - orders / revenue: activity in the last 7 days, compared with the 7 days before.
     * - users / products: all-time totals; "change" is how much they grew in the last 7 days.
     * Cancelled orders don't count towards revenue.
     */
    public function stats(): JsonResponse
    {
        $now = now();
        $periodStart = $now->copy()->subDays(self::PERIOD_DAYS);
        $previousStart = $now->copy()->subDays(self::PERIOD_DAYS * 2);

        $ordersNow = Order::whereBetween('created_at', [$periodStart, $now])->count();
        $ordersBefore = Order::whereBetween('created_at', [$previousStart, $periodStart])->count();

        $revenue = fn ($from, $to) => (float) Order::where('status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('created_at', [$from, $to])
            ->sum('total');
        $revenueNow = $revenue($periodStart, $now);
        $revenueBefore = $revenue($previousStart, $periodStart);

        $customers = User::where('is_admin', false);
        $usersTotal = (clone $customers)->count();
        $usersNew = (clone $customers)->where('created_at', '>=', $periodStart)->count();

        $productsTotal = Product::where('is_active', true)->count();
        $productsNew = Product::where('is_active', true)->where('created_at', '>=', $periodStart)->count();

        return response()->json([
            'period_days' => self::PERIOD_DAYS,
            'orders' => ['value' => $ordersNow, 'change' => $this->percentChange($ordersBefore, $ordersNow)],
            'users' => ['value' => $usersTotal, 'change' => $this->percentChange($usersTotal - $usersNew, $usersTotal)],
            'revenue' => ['value' => round($revenueNow, 2), 'change' => $this->percentChange($revenueBefore, $revenueNow)],
            'products' => ['value' => $productsTotal, 'change' => $this->percentChange($productsTotal - $productsNew, $productsTotal)],
        ]);
    }

    /** Returns e.g. 12.5 for +12.5%, or null when there's nothing to compare against. */
    private function percentChange(float $before, float $after): ?float
    {
        if ($before == 0) {
            return null;
        }

        return round((($after - $before) / $before) * 100, 1);
    }
}
