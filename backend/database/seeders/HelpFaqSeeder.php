<?php


namespace Database\Seeders;

use App\Models\helpfaq;

use Illuminate\Database\Seeder;

class HelpFaqSeeder extends Seeder
{
public function run(): void{
$rows = [
        [
            'category' => 'About Syrol Group',
            'title' => 'What is Syrol Group, where is it located, and what products does it sell?',
            'answer' => <<<'MD'
Syrol Group is a South African agribusiness located in Limpopo. The company specialises in commercial feedlot operations, meat processing, and the supply of premium-quality, locally sourced beef.

Syrol Group supplies beef to households, community buying groups, restaurants, businesses, and other commercial customers. Available products include:

- Whole carcasses.
- Half carcasses.
- Quarter carcasses.
- 10 kg, 20 kg, 30 kg, and 50 kg bulk meat boxes.
- Family meat packs.
- Group-sharing packages.

Syrol Group currently operates from one physical branch or store. Customers can either collect their orders from the branch or request delivery to an address anywhere in South Africa.
MD,
            'keywords' => ['Syrol Group', 'about Syrol', 'Limpopo', 'location', 'branch', 'beef supplier', 'products', 'locally sourced beef'],
        ],
        [
            'category' => 'Products and Packages',
            'title' => 'What beef products and package sizes does Syrol Group offer?',
            'answer' => <<<'MD'
Syrol Group offers several beef options for households, community groups, and commercial customers.

- A whole carcass is a complete processed and packaged beef carcass. It is generally suitable for large households, restaurants, butcheries, commercial customers, or large buying groups.
- A half carcass is half of a processed beef carcass. It is suitable for families, smaller businesses, restaurants, and groups requiring a large quantity of beef.
- A quarter carcass is one-quarter of a processed beef carcass. It is a more affordable bulk-buying option for households and smaller groups.
- Bulk meat boxes are standardised beef packages available in 10 kg, 20 kg, 30 kg, and 50 kg sizes. These boxes contain a selection of premium beef cuts.
- A family meat pack is a mixed-cut package intended for household consumption.
- A group-sharing package is designed for community buying groups. The meat can be divided into equal-weight portions for the participants.

The exact contents, cuts, final weight, packaging, and price depend on the selected product, customer requirements, availability, and processing instructions.
MD,
            'keywords' => ['whole carcass', 'half carcass', 'quarter carcass', 'beef box', 'meat box', '10kg', '20kg', '30kg', '50kg', 'family pack', 'group package', 'beef products'],
        ],
        [
            'category' => 'Products and Packages',
            'title' => 'Which Syrol Group product should I choose?',
            'answer' => <<<'MD'
- A 10 kg box may suit a small household.
- A 20 kg or 30 kg box may suit a larger household.
- A 50 kg box may suit a large household, business, or buying group.
- A quarter carcass may suit customers who want a smaller bulk order with customised cuts.
- A half or whole carcass may suit commercial customers, large families, restaurants, or large groups.
- A group-sharing package may suit customers who want to share the cost and divide the meat equally.

Customers with special requirements should contact Syrol Group before placing the order.
MD,
            'keywords' => ['choose product', 'best package', 'suitable meat box', 'order size', 'product recommendation'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'How do I place an order with Syrol Group?',
            'answer' => <<<'MD'
To place an order:

1. Browse the available beef products.
2. Select the product, quantity, and package size.
3. Complete the cutsheet if the product allows customised cuts.
4. Choose collection or delivery.
5. Enter the required customer and delivery details.
6. Review the order and cutsheet carefully.
7. Submit the order.
8. Make payment before the order can be fulfilled.

The order will only proceed once the required information and payment have been received and confirmed.

Customers should provide accurate contact and delivery details because incomplete information may delay processing or delivery.
MD,
            'keywords' => ['place order', 'order process', 'checkout', 'buy beef', 'order online'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'What is a cutsheet, why is it required, and what can I select?',
            'answer' => <<<'MD'
A cutsheet is an order form used to tell Syrol Group how the beef should be cut, prepared, divided, and packaged.

The cutsheet contains beef parts and preparation options that customers select using multiple-choice checkboxes. Depending on the product, available choices may include options such as steaks, mince, roasts, stew meat, ribs, brisket, or other cuts shown on the official cutsheet.

The cutsheet is important because it provides the processing team with clear instructions and helps prevent misunderstandings. Customers should review all selections before submitting the order.

Selecting a cut does not necessarily mean that the entire order will consist only of that cut. The final quantity of each cut depends on the carcass size, available meat, trimming, deboning, bone-in or boneless preparation, and normal processing limitations.
MD,
            'keywords' => ['cutsheet', 'cut sheet', 'beef cuts', 'meat selection', 'checkbox', 'custom cuts', 'processing instructions'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'Can I change my cutsheet or request a cut that is not listed?',
            'answer' => <<<'MD'
Customers should contact Syrol Group as soon as possible if they need to change their cutsheet or request a cut that is not displayed.

Changes may be possible only before processing begins. Once the meat has been cut, prepared, packaged, or dispatched, changes may not be possible.

If a cutsheet is incomplete, unclear, or contains conflicting instructions, Syrol Group may contact the customer for clarification. This can delay processing.

Special cuts or preparation methods may depend on the type of meat, available equipment, processing requirements, and possible additional charges. Customers should confirm these requests before paying for the order.
MD,
            'keywords' => ['change cutsheet', 'edit order', 'special cuts', 'custom request', 'unavailable cut', 'incorrect cutsheet'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'Are the exact weights of the cuts guaranteed?',
            'answer' => <<<'MD'
Exact weights of individual cuts are not always guaranteed because every carcass and order is different.

The final weight may be affected by the size of the carcass, trimming, deboning, bone-in or boneless preparation, cutting instructions, and the selected product.

Customers should check the product description to determine whether the displayed weight is fixed, approximate, or a standard package size.
MD,
            'keywords' => ['exact weight', 'estimated weight', 'carcass weight', 'meat quantity', 'final weight'],
        ],
        [
            'category' => 'Customer-Owned Animals and Meat',
            'title' => 'Can I bring my own animal or meat to Syrol Group for processing?',
            'answer' => <<<'MD'
Yes. Customers may bring their own animal to Syrol Group for cutting and processing, subject to the company's acceptance requirements and processing conditions.

Syrol Group may process a whole animal or meat that needs to be cut into smaller pieces. Customers should contact the company before arriving to confirm:

- Whether the animal or meat can be accepted.
- Which documents or information are required.
- The available processing options.
- The required cutsheet.
- Processing fees.
- Packaging options.
- The expected processing time.
- Collection or delivery arrangements.

Customers should not assume that Syrol Group will transport or collect the animal unless this has been confirmed in advance. Transport costs, permits, and delivery requirements should also be agreed upon before the service is arranged.
MD,
            'keywords' => ['own animal', 'customer animal', 'bring meat', 'animal processing', 'cut smaller', 'whole animal', 'processing service'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'When must I pay, and what happens after payment?',
            'answer' => <<<'MD'
Payment is required before Syrol Group can fulfil an order. Customers should not assume that payment on delivery or payment after collection is available.

After payment has been received and verified, Syrol Group can begin preparing or processing the order. The order will then be scheduled for collection or delivery according to the company’s processing and delivery arrangements.

Customers should use the correct order reference when making payment. An order may remain pending until payment is successfully matched to the order.
MD,
            'keywords' => ['payment', 'prepayment', 'order fulfilment', 'payment confirmation', 'pay before delivery', 'order processing'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'Can I cancel a paid order or receive a refund?',
            'answer' => <<<'MD'
Customers should contact Syrol Group as soon as possible if they want to cancel an order.

Cancellation or refund eligibility may depend on whether the order has already been processed, cut, packaged, dispatched, or delivered. Customised and perishable products may have different cancellation conditions.

Any refund or cancellation decision will be subject to Syrol Group’s official cancellation and refund policy.
MD,
            'keywords' => ['cancel order', 'refund', 'paid order', 'cancellation', 'order withdrawal'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'How will I know whether my order was accepted?',
            'answer' => <<<'MD'
The website should display an order confirmation after the order has been submitted. Syrol Group may also send confirmation by email, SMS, WhatsApp, or another communication channel.

An order should be considered ready for processing only after payment has been received and confirmed.

Customers should keep their order number because it may be required when requesting updates or reporting a problem.
MD,
            'keywords' => ['order confirmation', 'accepted order', 'order status', 'payment confirmation', 'order number'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'Does Syrol Group offer collection and delivery?',
            'answer' => <<<'MD'
Yes. Customers can choose either collection or delivery.

- For collection, customers collect their completed orders from Syrol Group’s physical branch or store. Customers should wait for confirmation that the order is ready before travelling to collect it.
- For delivery, Syrol Group provides internal delivery services to all provinces of South Africa. Customers must provide a complete and accurate delivery address and ensure that an authorised person is available to receive the order.

Syrol Group also delivers to households, community buying groups, restaurants, and other businesses.
MD,
            'keywords' => ['collection', 'pickup', 'delivery', 'home delivery', 'business delivery', 'nationwide delivery'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'How much does delivery cost, and how is the distance calculated?',
            'answer' => <<<'MD'
Syrol Group charges R12 per kilometre for delivery.

The delivery fee is calculated using the distance between the Syrol Group branch or dispatch location and the customer's delivery address. Customers should provide the suburb, town, province, postal code, and any useful landmarks.

The final charge may depend on the route used by the company. Customers should verify the displayed delivery fee before completing payment.

Large commercial orders or special delivery arrangements may require separate confirmation.
MD,
            'keywords' => ['delivery fee', 'R12 per kilometre', 'delivery price', 'delivery distance', 'route', 'delivery calculation'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'Can I change my delivery address, and what happens if nobody is available?',
            'answer' => <<<'MD'
Customers should contact Syrol Group immediately if they need to change their delivery address.

Changing the address may affect the delivery fee, route, delivery date, and availability. An address change may not be possible once the order has been dispatched.

Customers should ensure that an authorised person is available to receive the delivery. If nobody is available, the delivery may need to be rescheduled. Additional delivery fees or delays may apply depending on the circumstances.
MD,
            'keywords' => ['change delivery address', 'update address', 'missed delivery', 'unavailable customer', 'reschedule delivery'],
        ],
        [
            'category' => 'Packaging and Storage',
            'title' => 'How is the meat packaged?',
            'answer' => <<<'MD'
Syrol Group packages meat in boxes or vacuum-sealed plastic packaging.

The packaging method depends on the selected product, type of cut, order size, and processing instructions. Customers may request a preferred packaging method, but this must be confirmed before processing.

Some packaging requests may depend on the available equipment and may involve an additional charge.
MD,
            'keywords' => ['meat packaging', 'boxes', 'vacuum packaging', 'vacuum-sealed plastic', 'packaging request'],
        ],
        [
            'category' => 'Packaging and Storage',
            'title' => 'How should I store the meat after collection or delivery?',
            'answer' => <<<'MD'
Customers should place the meat in suitable refrigerated or frozen storage as soon as possible after collection or delivery.

The meat should remain in its original packaging unless it must be opened for preparation. Customers should follow the storage, expiry, and use-by instructions supplied by Syrol Group.

Customers should confirm the recommended refrigeration, freezing, storage period, and thawing instructions for their specific product.
MD,
            'keywords' => ['store meat', 'refrigeration', 'freeze beef', 'frozen meat', 'thaw meat', 'food storage'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'How does Syrol Group Preserve the quality of its beef?',
            'answer' => <<<'MD'
Syrol Group operates in commercial feedlot operations and meat processing and is committed to supplying premium-quality, locally sourced beef.

Products are processed and packaged according to the selected product, available cuts, customer instructions, and cutsheet selections.

Customers should inspect their order upon collection or delivery and store it correctly after receiving it.
MD,
            'keywords' => ['beef quality', 'premium beef', 'local beef', 'feedlot', 'meat processing'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'What should I do if my order is incorrect, incomplete, damaged, or unsafe?',
            'answer' => <<<'MD'
Customers should contact Syrol Group as soon as possible and provide the following information:

- The order number.
- The customer's name and contact details.
- A description of the problem.
- The relevant cutsheet or order selections.
- The date and time of collection or delivery.
- Photographs of the product, packaging, labels, and damage where possible.

If the packaging is open, leaking, damaged, or appears unsafe, customers should avoid consuming the product until Syrol Group has investigated the issue.

If an item or portion is missing, customers should compare the received order with the order confirmation and cutsheet.

Customers should keep the product and packaging until the complaint has been reviewed.
MD,
            'keywords' => ['incorrect order', 'missing meat', 'incomplete order', 'damaged packaging', 'leaking meat', 'unsafe product', 'complaint'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'Can I return or exchange fresh meat?',
            'answer' => <<<'MD'
Customers should contact Syrol Group before returning or exchanging any meat product.

Because meat is perishable, returns and exchanges may depend on the reason for the request, whether the product has been opened, how it was stored, and whether it was prepared according to the customer’s cutsheet.

Customers should contact Syrol Group immediately if the product is defective, damaged, incorrect, unsafe, or different from the confirmed order. The company may request photographs, packaging details, delivery information, and other evidence before deciding on a remedy.
MD,
            'keywords' => ['return meat', 'exchange meat', 'fresh meat return', 'defective meat', 'perishable product', 'refund'],
        ],
        [
            'category' => 'Groups and Commercial Customers',
            'title' => 'Does Syrol Group supply restaurants, businesses, and large customers?',
            'answer' => <<<'MD'
Yes. Syrol Group supplies households, restaurants, businesses, community buying groups, and other commercial customers.

Customers can place large orders for whole carcasses, half carcasses, quarter carcasses, bulk meat boxes, or group-sharing packages.

Commercial customers should provide:

- Required quantity.
- Preferred cuts.
- Packaging requirements.
- Delivery or collection details.
- Required delivery location.
- Expected ordering frequency.

Large orders should be placed in advance because processing, packaging, payment verification, and delivery planning may require additional time.
MD,
            'keywords' => ['restaurants', 'businesses', 'commercial beef', 'bulk order', 'large order', 'wholesale', 'business customer'],
        ],
        [
            'category' => 'Groups and Commercial Customers',
            'title' => 'Can a community group place one order and divide the meat?',
            'answer' => <<<'MD'
Yes. A community buying group can place one combined order and request a group-sharing package.

The group organiser should:

- Confirm the number of participants.
- Decide how the meat should be divided.
- Provide the required portion information.
- Arrange one collection or delivery location.
- Ensure that payment is completed before processing begins.

Group-sharing packages are designed to divide the meat into equal-weight portions. However, final portions may be affected by the available meat and selected cutting instructions.

The organiser should confirm with Syrol Group whether different participants may request different cuts. Different cut preferences may affect the weight and composition of the portions.
MD,
            'keywords' => ['community group', 'buying group', 'group order', 'shared meat', 'equal portions', 'group package', 'different cuts'],
        ],
        [
            'category' => 'Chatbot Escalation',
            'title' => 'What should I do if the chatbot cannot answer my question?',
            'answer' => <<<'MD'
If the chatbot cannot answer a question, the customer should contact a Syrol Group representative.

For faster assistance, the customer should provide the following information where applicable:

- Order number.
- Customer name.
- Product name.
- Delivery or collection details.
- Delivery or collection option.
- Delivery address.
- Payment status.
- Description of the request or problem.

A representative should handle questions about prices, stock availability, special cuts, processing times, refunds, delivery arrangements, and customer-owned animals.
MD,
            'keywords' => ['contact Syrol', 'speak to representative', 'chatbot help', 'customer service', 'unanswered question'],
        ],
];

foreach($rows as $row){
    helpfaq::updateOrCreate(['title'=>$row['title']], $row);
}

}


}
