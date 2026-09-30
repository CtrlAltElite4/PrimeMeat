<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MailerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatbotController;

// Authentication
// 5 attempts per minute per IP to slow down brute forcing / spam signups
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Contact

Route::post('/contact', [MailerController::class, 'send']);

// Products

Route::get('/products', [ProductController::class, 'index']);

Route::get('/products/{product}', [ProductController::class, 'show']);

// Chatbot

Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);