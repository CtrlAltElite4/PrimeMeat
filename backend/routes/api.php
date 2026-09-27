<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatbotController;
Route::get('/products', [ProductController::class, 'index']);

Route::get('/products/{product}', [ProductController::class, 'show']);

Route::post('/chatbot/ask', [ChatbotController::class, 'ask']);