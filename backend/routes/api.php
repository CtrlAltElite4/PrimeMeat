<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CutOptionController;
use App\Http\Controllers\GroupOrderController;
use App\Http\Controllers\MailerController;
use App\Http\Controllers\HelpfaqController;
use App\Http\Controllers\OrderController as CustomerOrderController;
use App\Http\Controllers\ProductController as CustomerProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\EnsureUserIsNotSuspended;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\NotificationPreferenceController;
use App\Http\Controllers\PayFastController;

// 5 attempts per minute per IP to slow down brute forcing / spam signups
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Logged-in routes. Suspended users are logged out on their next request.
Route::middleware(['auth:sanctum', EnsureUserIsNotSuspended::class])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/checkout/payfast', [PayFastController::class, 'start']);
    Route::get('/checkout/payments/{paymentNumber}', [PayFastController::class, 'status']);
    Route::post('/checkout/payments/{paymentNumber}/cancel', [PayFastController::class, 'cancel']);


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
           
    // PayFast checkout
       Route::post('/checkout/payfast', [PayFastController::class, 'start']);
       Route::get('/checkout/payments/{paymentNumber}', [PayFastController::class, 'status']);
       Route::post('/checkout/payments/{paymentNumber}/cancel', [PayFastController::class, 'cancel']);

    // Group orders
    Route::post('/group-orders', [GroupOrderController::class, 'store']);
    Route::post('/group-orders/checkout', [GroupOrderController::class, 'checkout']);
    Route::get('/group-orders/{groupOrder}', [GroupOrderController::class, 'show']);
    Route::delete('/group-orders', [GroupOrderController::class, 'destroy']);
    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{address}/default', [AddressController::class, 'setDefault']);
    // Own profile
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])
        ->middleware('throttle:6,1');
});

// Cut options
Route::get('/cut-options', [CutOptionController::class, 'index']);

// Public products
Route::get('/products', [CustomerProductController::class, 'index']);
Route::get('/products/{product}', [CustomerProductController::class, 'show']);

// Contact
Route::post('/contact', [MailerController::class, 'send']);

//HelpCenter FAQs Accessed only by admin
Route::get('/helpfaqs', [HelpfaqController::class, 'index']);
Route::middleware(['auth:sanctum',
'admin'
])
->prefix('admin')->group(function(){
Route::post('/helpfaqs',[HelpfaqController::class, 'store']);
Route::put('/helpfaqs/{helpFaq}', [HelpfaqController::class, 'update']);
Route::delete('/helpfaqs/{helpFaq}', [HelpfaqController::class, 'destroy']);
});


// Chatbot
Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);

// PayFast payment notifications (ITN). Called by PayFast's server
   Route::post('/payfast/notify', [PayFastController::class, 'notify'])->middleware('throttle:60,1');

// PayFast payment notifications (ITN). Called by PayFast's server, checked in PayFastController
Route::post('/payfast/notify', [PayFastController::class, 'notify'])->middleware('throttle:60,1');

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
    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'show']);
    Route::put('/notification-preferences', [NotificationPreferenceController::class, 'update']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/faqs/stats', [FaqController::class, 'stats']);
    Route::post('/faqs', [FaqController::class, 'store']);
    Route::put('/faqs/{faq}', [FaqController::class, 'update'])->whereNumber('faq');
    Route::delete('/faqs/{faq}', [FaqController::class, 'destroy'])->whereNumber('faq');

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
