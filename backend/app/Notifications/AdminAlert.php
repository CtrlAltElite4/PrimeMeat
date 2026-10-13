<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** One simple email used for every admin alert (new order, payment, new user, system, stock). */
class AdminAlert extends Notification
{
    /** @param string[] $lines */
    public function __construct(
        public string $subject,
        public array $lines,
        public string $buttonText,
        public string $path, // admin page to open, e.g. /admin/orders
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('PrimeMeat: '.$this->subject)
            ->greeting('Hi '.strtok((string) $notifiable->name, ' ').',');

        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        $frontend = rtrim(config('app.frontend_url') ?: 'http://localhost:5173', '/');

        return $mail
            ->action($this->buttonText, $frontend.$this->path)
            ->line('You can change which emails you get under Settings > Notification in the admin panel.');
    }
}
