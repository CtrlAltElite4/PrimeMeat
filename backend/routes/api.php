<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CutOptionController;
use App\Http\Controllers\GroupOrderController;
use App\Http\Controllers\MailerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController as CustomerOrderController;
use App\Http\Middleware\EnsureUserIsNotSuspended;
use Illuminate\Support\Facades\Route;

// 5 attempts per minute per IP to slow down brute forcing / spam signups
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Logged-in routes. Suspended users are logged out on their next request.
Route::middleware(['auth:sanctum', EnsureUserIsNotSuspended::class])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'add']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [CustomerOrderController::class, 'index']);
    Route::post('/orders', [CustomerOrderController::class, 'store']);
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show']);

    // Group orders
    Route::post('/group-orders', [GroupOrderController::class, 'store']);
    Route::post('/group-orders/checkout', [GroupOrderController::class, 'checkout']);
    Route::get('/group-orders/{groupOrder}', [GroupOrderController::class, 'show']);
    Route::delete('/group-orders', [GroupOrderController::class, 'destroy']);

    // Own profile
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])
        ->middleware('throttle:6,1');
});

// Cut options
Route::get('/cut-options', [CutOptionController::class, 'index']);

// Contact
Route::post('/contact', [MailerController::class, 'send']);

// Chatbot
Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);

// Admin panel: must be logged in, not suspended, AND an admin
Route::middleware([
    'auth:sanctum',
    EnsureUserIsNotSuspended::class,
    'admin',
])->prefix('admin')->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);

    // Admin orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
    Route::get('/orders/recent', [AdminOrderController::class, 'recent']);
    Route::get('/orders/pending-count', [AdminOrderController::class, 'pendingCount']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])
        ->whereNumber('order');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])
        ->whereNumber('order');

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/stats', [PaymentController::class, 'stats']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])
        ->whereNumber('payment');

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/stats', [ProductController::class, 'stats']);
    Route::put('/products/{product}', [ProductController::class, 'update'])
        ->whereNumber('product');
    Route::patch('/products/{product}/availability', [ProductController::class, 'availability'])
        ->whereNumber('product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->whereNumber('product');

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::get('/users/{user}', [UserController::class, 'show'])
        ->whereNumber('user');
    Route::patch('/users/{user}/suspend', [UserController::class, 'suspend'])
        ->whereNumber('user');
    Route::patch('/users/{user}/restore', [UserController::class, 'restore'])
        ->whereNumber('user');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->whereNumber('user');
});