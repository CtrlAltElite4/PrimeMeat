<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailerController extends Controller
{
    // Compose Email
    public function send(Request $request)
    {
        $request->validate([
            'fName' => 'required|string',
            'lName' => 'required|string',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);
        try {
            Mail::send([], [], function ($mail) use ($request) {
                $mail->to('tdbackup.letsoalo@gmail.com')
                    ->from('tdbackup.letsoalo@gmail.com', 'PrimeMeat')
                    ->replyTo($request->email, $request->fName.' '.$request->lName)
                    ->subject('Contact Form - '.$request->fName.' '.$request->lName)
                    ->html(" <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5;'>
                            <div style='background-color: #710014; color: #ffffff; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>New message from " . e($request->fName) . " " . e($request->lName) . "</h2>
                            </div>
                             <div style='padding: 20px; color: #161616; line-height: 1.6;'>
                        <p><strong>Email:</strong> " . e($request->email) . "</p>
                        <p><strong>Message:</strong></p>
                        <p style='background: #f5f3ef; padding: 15px; border-radius: 4px;'>" . nl2br(e($request->message)) . "</p>
    </div>
  </div>

                    ");
            });

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('Mail error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }

    }
}
