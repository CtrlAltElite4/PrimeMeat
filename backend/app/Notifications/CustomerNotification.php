<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerNotification extends Notification
{
    use Queueable;

    /** @param string[] $lines */
    public function __construct(
        public string $subject,
        public array $lines,
        public string $buttonText,
        public string $path,
        public string $category,
    ) {}

    public function via(object $notifiable): array
    {
        $preferences = $notifiable->notificationPreference()
            ->firstOrCreate([], [
                'orders' => true,
                'new_arrivals' => true,
                'special_deals' => true,
                'email_notifications' => true,
            ]);

        if (! $preferences->getAttribute($this->category)) {
            return [];
        }

        $channels = ['database'];

        if (
            $preferences->email_notifications &&
            $this->category !== 'special_deals'
        ) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subject' => $this->subject,
            'lines' => $this->lines,
            'buttonText' => $this->buttonText,
            'path' => $this->path,
            'category' => $this->category,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim(
            config('app.frontend_url') ?: 'http://localhost:5173',
            '/'
        );

        $mail = (new MailMessage)
            ->subject('PrimeMeat: ' . $this->subject)
            ->greeting(
                'Hello, ' . strtok((string) $notifiable->name, ' ') . ','
            );

        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        return $mail
            ->action($this->buttonText, $frontend . $this->path)
            ->salutation('Thank you for using PrimeMeat!');
    }
}
