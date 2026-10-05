<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
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

    // Own profile (admin Settings page; customers can use it too)
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->middleware('throttle:6,1');
});

// Admin panel: must be logged in, not suspended, AND an admin (see EnsureUserIsAdmin)
Route::middleware(['auth:sanctum', EnsureUserIsNotSuspended::class, 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/stats', [OrderController::class, 'stats']);
    Route::get('/orders/recent', [OrderController::class, 'recent']);
    Route::get('/orders/pending-count', [OrderController::class, 'pendingCount']);
    Route::get('/orders/{order}', [OrderController::class, 'show'])->whereNumber('order');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->whereNumber('order');

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/stats', [PaymentController::class, 'stats']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->whereNumber('payment');

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/stats', [ProductController::class, 'stats']);
    // Edits arrive as POST with _method=PUT (needed for image uploads); Laravel treats them as PUT
    Route::put('/products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::patch('/products/{product}/availability', [ProductController::class, 'availability'])->whereNumber('product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->whereNumber('product');

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user');
    Route::patch('/users/{user}/suspend', [UserController::class, 'suspend'])->whereNumber('user');
    Route::patch('/users/{user}/restore', [UserController::class, 'restore'])->whereNumber('user');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->whereNumber('user');
});
