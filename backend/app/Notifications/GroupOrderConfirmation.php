<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to every member of a group order once the organiser has paid. */
class GroupOrderConfirmation extends Notification
{
    /** @param string[] $lines */
    public function __construct(
        public string $orderNumber,
        public string $memberName,
        public array $lines,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('PrimeMeat: your group order '.$this->orderNumber.' is confirmed')
            ->greeting('Hi '.strtok($this->memberName, ' ').',');

        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        return $mail->line('Questions? Reply to this email or use the contact page on our website.');
    }
}
