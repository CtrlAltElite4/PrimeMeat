<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CutOptionController;
use App\Http\Controllers\GroupOrderController;
use App\Http\Controllers\MailerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

// Authentication
// 5 attempts per minute per IP to slow down brute forcing / spam signups
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'add']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    // group orders
    Route::post('/group-orders', [GroupOrderController::class, 'store']);
    Route::post('/group-orders/checkout', [GroupOrderController::class, 'checkout']);
    Route::get('/group-orders/{groupOrder}', [GroupOrderController::class, 'show']);
    Route::delete('/group-orders', [GroupOrderController::class, 'destroy']);
});
// Cut options
Route::get('/cut-options', [CutOptionController::class, 'index']);
// Contact

Route::post('/contact', [MailerController::class, 'send']);

// Products

Route::get('/products', [ProductController::class, 'index']);

Route::get('/products/{product}', [ProductController::class, 'show']);

// Chatbot

Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);
