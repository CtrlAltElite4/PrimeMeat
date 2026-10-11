<?php

use app\Http\Controllers\MailerController;

Route::post('/contact', [MailerController::class, 'send']);
