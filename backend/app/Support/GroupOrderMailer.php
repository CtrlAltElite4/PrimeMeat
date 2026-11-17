<?php

namespace App\Support;

use App\Models\GroupOrder;
use App\Notifications\GroupOrderConfirmation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Emails the organiser and each group member once the payment is confirmed.
 * Sent after the response (defer), and a failing mail server is only logged,
 * so it can never undo or delay the payment.
 */
class GroupOrderMailer
{
    public static function sendConfirmations(int $groupOrderId): void
    {
        defer(function () use ($groupOrderId) {
            $groupOrder = GroupOrder::with(['members', 'deliveryMember', 'user', 'order'])->find($groupOrderId);
            if (! $groupOrder || ! $groupOrder->order) {
                return;
            }

            $people = max(1, (int) $groupOrder->number_of_people);
            $share = number_format((float) $groupOrder->price / $people, 2);
            $total = number_format((float) $groupOrder->price, 2);
            $organiser = $groupOrder->user?->name ?? 'Your group organiser';
            $weight = str_replace('-', '–', (string) $groupOrder->weight_range).' kg';

            $receiving = $groupOrder->delivery_method === 'collection'
                ? 'Collection: we\'ll let your group know when the order is ready to collect.'
                : 'Delivery to '.($groupOrder->deliveryMember?->name ?? 'your group\'s recipient').' at '
                    .collect([$groupOrder->address_line_1, $groupOrder->address_line_2, $groupOrder->city,
                        $groupOrder->province, $groupOrder->postal_code])->filter()->implode(', ').'.';

            $orderNumber = $groupOrder->order->order_number;
            $details = [
                'Order: Full Carcass ('.$weight.'), shared by '.$people.' people'
                    .($groupOrder->include_ground_beef ? ', including ground beef.' : '.'),
                'Total paid: R'.$total.' (R'.$share.' per person).',
                $receiving,
                'Traditional cuts will be divided as evenly as possible among the group.',
            ];

            // Who gets an email. Keyed by lower-case address, so an organiser who
            // also listed themselves as a member only gets one (the organiser version).
            $recipients = [];

            if ($groupOrder->user?->email) {
                $recipients[strtolower($groupOrder->user->email)] = [
                    'email' => $groupOrder->user->email,
                    'name' => $groupOrder->user->name,
                    'lines' => [
                        'Thank you, your payment for group order '.$orderNumber.' was received.',
                        ...$details,
                        'All '.$people.' group members have been emailed a confirmation.',
                    ],
                ];
            }

            foreach ($groupOrder->members as $member) {
                $key = strtolower($member->email);
                if (isset($recipients[$key])) {
                    continue;
                }
                $recipients[$key] = [
                    'email' => $member->email,
                    'name' => $member->name,
                    'lines' => [$organiser.' has paid for your group order '.$orderNumber.'.', ...$details],
                ];
            }

            foreach ($recipients as $recipient) {
                try {
                    Notification::route('mail', $recipient['email'])
                        ->notify(new GroupOrderConfirmation($orderNumber, $recipient['name'], $recipient['lines']));
                } catch (Throwable $e) {
                    Log::warning('Group order email not sent', ['group_order' => $groupOrderId, 'email' => $recipient['email'], 'error' => $e->getMessage()]);
                }
            }
        });
    }
}
