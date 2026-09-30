<?php

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\MailerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatbotController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/contact', [MailerController::class, 'send']);

Route::get('/products', [ProductController::class, 'index']);

Route::get('/products/{product}', [ProductController::class, 'show']);

Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);
