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
                    ->html("<h2>New message from {$request->fName} {$request->lName}</h2>
                    <p><strong>Email:</strong> {$request->email}</p>
                    <p><strong>Message:</strong> {$request->message}</p>");
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
