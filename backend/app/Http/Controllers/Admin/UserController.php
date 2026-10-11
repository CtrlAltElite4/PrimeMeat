<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    private const PER_PAGE = 10;

    /** GET /api/admin/users?search=&type=admin|customer&status=active|suspended&page= */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(['admin', 'customer'])],
            'status' => ['nullable', Rule::in(['active', 'suspended'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $users = User::query()
            ->when($data['type'] ?? null, fn ($q, $type) => $q->where('is_admin', $type === 'admin'))
            ->when($data['status'] ?? null, fn ($q, $status) => $status === 'suspended'
                ? $q->whereNotNull('suspended_at')
                : $q->whereNull('suspended_at'))
            ->when($data['search'] ?? null, function ($q, $search) {
                $term = '%'.addcslashes($search, '%_\\').'%';
                $q->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (User $user) => $this->summary($user));

        return response()->json($users);
    }

    /** The four cards on the Users page. */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => User::count(),
            'active' => User::whereNull('suspended_at')->count(),
            'suspended' => User::whereNotNull('suspended_at')->count(),
            'new_last_7_days' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ]);
    }

    /** "View" button: account details plus a short order history summary. */
    public function show(User $user): JsonResponse
    {
        $orders = Order::where('user_id', $user->id);

        return response()->json([
            ...$this->summary($user),
            'suspended_at' => $user->suspended_at ? (string) $user->suspended_at : null,
            'orders_count' => (clone $orders)->count(),
            'total_spent' => (float) (clone $orders)->where('status', '!=', Order::STATUS_CANCELLED)->sum('total'),
            'last_order_date' => optional((clone $orders)->latest()->first())->created_at?->toDateString(),
        ]);
    }

    /** "Add User" button. The admin sets a starting password and shares it with the person. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'type' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Set directly, never through mass assignment
        $user->is_admin = $data['type'] === 'admin';
        $user->save();

        return response()->json($this->summary($user), 201);
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        $this->blockSelf($request, $user, 'suspend');

        $user->suspended_at = now();
        $user->save();

        return response()->json($this->summary($user));
    }

    public function restore(User $user): JsonResponse
    {
        $user->suspended_at = null;
        $user->save();

        return response()->json($this->summary($user));
    }

    /** Orders are kept (shown as "Deleted customer"), so sales history isn't lost. */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->blockSelf($request, $user, 'delete');

        $user->delete();

        return response()->json(['deleted' => true]);
    }

    /** An admin can't lock themselves out by suspending or deleting their own account. */
    private function blockSelf(Request $request, User $user, string $action): void
    {
        if ($request->user()->is($user)) {
            abort(422, "You can't {$action} your own account.");
        }
    }

    private function summary(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'joined' => $user->created_at?->toDateString(),
            'type' => $user->is_admin ? 'admin' : 'customer',
            'status' => $user->suspended_at ? 'suspended' : 'active',
        ];
    }
}
