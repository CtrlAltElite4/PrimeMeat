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
            'answer' => <<<'HTML'
<h3 class="INFO">Syrol Group is a South African agribusiness located in Limpopo. The company specialises in commercial feedlot operations, meat processing, and the supply of premium-quality, locally sourced beef.</h3>
<h3 class="INFO">Syrol Group supplies beef to households, community buying groups, restaurants, businesses, and other commercial customers. Available products include:</h3>
<ul class="MeatPackageList"><li>Whole carcasses.</li>
<li>Half carcasses.</li><li>Quarter carcasses.</li>
<li>10 kg, 20 kg, 30 kg, and 50 kg bulk meat boxes.</li>
<li>Family meat packs.</li><li>Group-sharing packages.</li>
</ul>
<h3 class="INFO">Syrol Group currently operates from one physical branch or store. Customers can either collect their orders from the branch or request delivery to an address anywhere in South Africa.</h3>
HTML,
            'keywords' => ['Syrol Group', 'about Syrol', 'Limpopo', 'location', 'branch', 'beef supplier', 'products', 'locally sourced beef'],
        ],
        [
            'category' => 'Products and Packages',
            'title' => 'What beef products and package sizes does Syrol Group offer?',
            'answer' => <<<'HTML'
<h3 class="INFO">Syrol Group offers several beef options for households, community groups, and commercial customers.</h3>
<ul class="MeatTypeList"><li>A whole carcass is a complete processed and packaged beef carcass. It is generally suitable for large households, restaurants, butcheries, commercial customers, or large buying groups.</li>
<li>A half carcass is half of a processed beef carcass. It is suitable for families, smaller businesses, restaurants, and groups requiring a large quantity of beef.</li>
<li>A quarter carcass is one-quarter of a processed beef carcass. It is a more affordable bulk-buying option for households and smaller groups.</li>
<li>Bulk meat boxes are standardised beef packages available in 10 kg, 20 kg, 30 kg, and 50 kg sizes. These boxes contain a selection of premium beef cuts.</li>
<li>A family meat pack is a mixed-cut package intended for household consumption.</li><li>A group-sharing package is designed for community buying groups. The meat can be divided into equal-weight portions for the participants</li>
</ul>
<h3 class="INFO">The exact contents, cuts, final weight, packaging, and price depend on the selected product, customer requirements, availability, and processing instructions.</h3>
HTML,
            'keywords' => ['whole carcass', 'half carcass', 'quarter carcass', 'beef box', 'meat box', '10kg', '20kg', '30kg', '50kg', 'family pack', 'group package', 'beef products'],
        ],
        [
            'category' => 'Products and Packages',
            'title' => 'Which Syrol Group product should I choose?',
            'answer' => <<<'HTML'
<ul class="MeatProductList"><li>A 10 kg box may suit a small household.</li>
<li>A 20 kg or 30 kg box may suit a larger household.</li>
<li>A 50 kg box may suit a large household, business, or buying group.</li>
<li>A quarter carcass may suit customers who want a smaller bulk order with customised cuts</li>
<li>A half or whole carcass may suit commercial customers, large families, restaurants, or large groups.</li>
<li>A group-sharing package may suit customers who want to share the cost and divide the meat equally</li>
</ul><h3 class="INFO">Customers with special requirements should contact Syrol Group before placing the order.</h3>
HTML,
            'keywords' => ['choose product', 'best package', 'suitable meat box', 'order size', 'product recommendation'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'How do I place an order with Syrol Group?',
            'answer' => <<<'HTML'
<h3 class="INFO">To place an order:</h3>
<ol class="OrderOrders"><li>Browse the available beef products.</li>
<li>Select the product, quantity, and package size.</li>
<li>Complete the cutsheet if the product allows customised cuts.</li>
<li>Choose collection or delivery.</li><li>Enter the required customer and delivery details.</li>
<li>Review the order and cutsheet carefully.</li>
<li>Submit the order.</li><li>Make payment before the order can be fulfilled.</li>
</ol>
<h3 class="INFO">The order will only proceed once the required information and payment have been received and confirmed.</h3>
<h3 class="INFO">Customers should provide accurate contact and delivery details because incomplete information may delay processing or delivery.</h3>
HTML,
            'keywords' => ['place order', 'order process', 'checkout', 'buy beef', 'order online'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'What is a cutsheet, why is it required, and what can I select?',
            'answer' => <<<'HTML'
<h3 class="INFO">A cutsheet is an order form used to tell Syrol Group how the beef should be cut, prepared, divided, and packaged.</h3>
<h3 class="INFO">The cutsheet contains beef parts and preparation options that customers select using multiple-choice checkboxes. Depending on the product, available choices may include options such as steaks, mince, roasts, stew meat, ribs, brisket, or other cuts shown on the official cutsheet.</h3>
<h3 class="INFO">The cutsheet is important because it provides the processing team with clear instructions and helps prevent misunderstandings. Customers should review all selections before submitting the order.</h3>
<h3 class="INFO">Selecting a cut does not necessarily mean that the entire order will consist only of that cut. The final quantity of each cut depends on the carcass size, available meat, trimming, deboning, bone-in or boneless preparation, and normal processing limitations</h3>
HTML,
            'keywords' => ['cutsheet', 'cut sheet', 'beef cuts', 'meat selection', 'checkbox', 'custom cuts', 'processing instructions'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'Can I change my cutsheet or request a cut that is not listed?',
            'answer' => <<<'HTML'
<h3 class="INFO">Customers should contact Syrol Group as soon as possible if they need to change their cutsheet or request a cut that is not displayed.</h3>
<h3 class="INFO">Changes may be possible only before processing begins. Once the meat has been cut, prepared, packaged, or dispatched, changes may not be possible.</h3>
<h3 class="INFO">If a cutsheet is incomplete, unclear, or contains conflicting instructions, Syrol Group may contact the customer for clarification. This can delay processing.</h3>
<h3 class="INFO">Special cuts or preparation methods may depend on the type of meat, available equipment, processing requirements, and possible additional charges. Customers should confirm these requests before paying for the order.</h3>
HTML,
            'keywords' => ['change cutsheet', 'edit order', 'special cuts', 'custom request', 'unavailable cut', 'incorrect cutsheet'],
        ],
        [
            'category' => 'Ordering and Cutsheets',
            'title' => 'Are the exact weights of the cuts guaranteed?',
            'answer' => <<<'HTML'
<h3 class="INFO">Exact weights of individual cuts are not always guaranteed because every carcass and order is different.</h3>
<h3 class="INFO">The final weight may be affected by the size of the carcass, trimming, deboning, bone-in or boneless preparation, cutting instructions, and the selected product.</h3>
<h3 class="INFO">Customers should check the product description to determine whether the displayed weight is fixed, approximate, or a standard package size.</h3>
HTML,
            'keywords' => ['exact weight', 'estimated weight', 'carcass weight', 'meat quantity', 'final weight'],
        ],
        [
            'category' => 'Customer-Owned Animals and Meat',
            'title' => 'Can I bring my own animal or meat to Syrol Group for processing?',
            'answer' => <<<'HTML'
<h3 class="INFO">Yes. Customers may bring their own animal to Syrol Group for cutting and processing, subject to the company&#x27;s acceptance requirements and processing conditions.</h3>
<h3 class="INFO">Syrol Group may process a whole animal or meat that needs to be cut into smaller pieces. Customers should contact the company before arriving to confirm:</h3>
<ul class="MeatAnimalList"><li>Whether the animal or meat can be accepted.</li>
<li>Which documents or information are required.</li><li>The available processing options.</li>
<li>The required cutsheet.</li><li>Processing fees.</li><li>Packaging options.</li>
<li>The expected processing time.</li><li>Collection or delivery arrangements.</li>
</ul>
<h3 class="INFO">Customers should not assume that Syrol Group will transport or collect the animal unless this has been confirmed in advance. Transport costs, permits, and delivery requirements should also be agreed upon before the service is arranged.</h3>
HTML,
            'keywords' => ['own animal', 'customer animal', 'bring meat', 'animal processing', 'cut smaller', 'whole animal', 'processing service'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'When must I pay, and what happens after payment?',
            'answer' => <<<'HTML'
<h3 class="INFO">Payment is required before Syrol Group can fulfil an order. Customers should not assume that payment on delivery or payment after collection is available.</h3>
<h3 class="INFO">After payment has been received and verified, Syrol Group can begin preparing or processing the order. The order will then be scheduled for collection or delivery according to the company’s processing and delivery arrangements.</h3>
<h3 class="INFO">Customers should use the correct order reference when making payment. An order may remain pending until payment is successfully matched to the order.</h3>
HTML,
            'keywords' => ['payment', 'prepayment', 'order fulfilment', 'payment confirmation', 'pay before delivery', 'order processing'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'Can I cancel a paid order or receive a refund?',
            'answer' => <<<'HTML'
<h3 class="INFO">Customers should contact Syrol Group as soon as possible if they want to cancel an order.</h3>
<h3 class="INFO">Cancellation or refund eligibility may depend on whether the order has already been processed, cut, packaged, dispatched, or delivered. Customised and perishable products may have different cancellation conditions.</h3>
<h3 class="INFO">Any refund or cancellation decision will be subject to Syrol Group’s official cancellation and refund policy.</h3>
HTML,
            'keywords' => ['cancel order', 'refund', 'paid order', 'cancellation', 'order withdrawal'],
        ],
        [
            'category' => 'Payment and Order Fulfilment',
            'title' => 'How will I know whether my order was accepted?',
            'answer' => <<<'HTML'
<h3 class="INFO">The website should display an order confirmation after the order has been submitted.
    Syrol Group may also send confirmation by email, SMS, WhatsApp, or another communication channel.</h3>
    <h3 class="INFO">An order should be considered ready for processing only after payment has been received and confirmed.</h3>
    <h3 class="INFO">Customers should keep their order number because it may be required when requesting updates or reporting a problem.</h3>
HTML,
            'keywords' => ['order confirmation', 'accepted order', 'order status', 'payment confirmation', 'order number'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'Does Syrol Group offer collection and delivery?',
            'answer' => <<<'HTML'
<h3 class="INFO">Yes. Customers can choose either collection or delivery.</h3>
<ul class="MeatDeliveryList"><li>For collection, customers collect their completed orders from Syrol Group’s physical branch or store. Customers should wait for confirmation that the order is ready before travelling to collect it.</li>
<li>For delivery, Syrol Group provides internal delivery services to all provinces of South Africa. Customers must provide a complete and accurate delivery address and ensure that an authorised person is available to receive the order</li>
</ul>
<h3 class="INFO">Syrol Group also delivers to households, community buying groups, restaurants, and other businesses.</h3>
HTML,
            'keywords' => ['collection', 'pickup', 'delivery', 'home delivery', 'business delivery', 'nationwide delivery'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'How much does delivery cost, and how is the distance calculated?',
            'answer' => <<<'HTML'
<h3 class="INFO">Syrol Group charges R12 per kilometre for delivery.</h3>
<h3 class="INFO">The delivery fee is calculated using the distance between the Syrol Group branch or dispatch location and the customer&#x27;s delivery address. Customers should provide the suburb, town, province, postal code, and any useful landmarks.</h3>
<h3 class="INFO">The final charge may depend on the route used by the company. Customers should verify the displayed delivery fee before completing payment.</h3>
<h3 class="INFO">Large commercial orders or special delivery arrangements may require separate confirmation.</h3>
HTML,
            'keywords' => ['delivery fee', 'R12 per kilometre', 'delivery price', 'delivery distance', 'route', 'delivery calculation'],
        ],
        [
            'category' => 'Collection-Delivery',
            'title' => 'Can I change my delivery address, and what happens if nobody is available?',
            'answer' => <<<'HTML'
<h3 class="INFO">Customers should contact Syrol Group immediately if they need to change their delivery address</h3>
<h3 class="INFO">Changing the address may affect the delivery fee, route, delivery date, and availability. An address change may not be possible once the order has been dispatched.</h3>
<h3 class="INFO">Customers should ensure that an authorised person is available to receive the delivery. If nobody is available, the delivery may need to be rescheduled. Additional delivery fees or delays may apply depending on the circumstances.</h3>
HTML,
            'keywords' => ['change delivery address', 'update address', 'missed delivery', 'unavailable customer', 'reschedule delivery'],
        ],
        [
            'category' => 'Packaging and Storage',
            'title' => 'How is the meat packaged?',
            'answer' => <<<'HTML'
<h3 class="INFO">Syrol Group packages meat in boxes or vacuum-sealed plastic packaging</h3>
<h3 class="INFO">The packaging method depends on the selected product, type of cut, order size, and processing instructions. Customers may request a preferred packaging method, but this must be confirmed before processing.</h3>
<h3 class="INFO">Some packaging requests may depend on the available equipment and may involve an additional charge.</h3>
HTML,
            'keywords' => ['meat packaging', 'boxes', 'vacuum packaging', 'vacuum-sealed plastic', 'packaging request'],
        ],
        [
            'category' => 'Packaging and Storage',
            'title' => 'How should I store the meat after collection or delivery?',
            'answer' => <<<'HTML'
<h3 class="INFO">Customers should place the meat in suitable refrigerated or frozen storage as soon as possible after collection or delivery.</h3>
<h3 class="INFO">The meat should remain in its original packaging unless it must be opened for preparation. Customers should follow the storage, expiry, and use-by instructions supplied by Syrol Group.</h3>
<h3 class="INFO">Customers should confirm the recommended refrigeration, freezing, storage period, and thawing instructions for their specific product.</h3>
HTML,
            'keywords' => ['store meat', 'refrigeration', 'freeze beef', 'frozen meat', 'thaw meat', 'food storage'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'How does Syrol Group Preserve the quality of its beef?',
            'answer' => <<<'HTML'
<h3 class="INFO">Syrol Group operates in commercial feedlot operations and meat processing and is committed to supplying premium-quality, locally sourced beef.</h3>
<h3 class="INFO">Products are processed and packaged according to the selected product, available cuts, customer instructions, and cutsheet selections.</h3>
<h3 class="INFO">Customers should inspect their order upon collection or delivery and store it correctly after receiving it.</h3>
HTML,
            'keywords' => ['beef quality', 'premium beef', 'local beef', 'feedlot', 'meat processing'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'What should I do if my order is incorrect, incomplete, damaged, or unsafe?',
            'answer' => <<<'HTML'
<ul class="MeatFaultList"><li>The order number.</li>
<li>The customer&#x27;s name and contact details</li>
<li>A description of the problem.</li>
<li>The relevant cutsheet or order selections.</li>
<li>The date and time of collection or delivery</li>
<li>Photographs of the product, packaging, labels, and damage where possible.</li>
</ul>
<h3 class="INFO">If the packaging is open, leaking, damaged, or appears unsafe, customers should avoid consuming the product until Syrol Group has investigated the issue.</h3>
<h3 class="INFO">If an item or portion is missing, customers should compare the received order with the order confirmation and cutsheet.</h3>
<h3 class="INFO">Customers should keep the product and packaging until the complaint has been reviewed.</h3>
HTML,
            'keywords' => ['incorrect order', 'missing meat', 'incomplete order', 'damaged packaging', 'leaking meat', 'unsafe product', 'complaint'],
        ],
        [
            'category' => 'Quality, Returns, and Complaints',
            'title' => 'Can I return or exchange fresh meat?',
            'answer' => <<<'HTML'
<h3 class="INFO">Customers should contact Syrol Group before returning or exchanging any meat product.</h3>
<h3 class="INFO">Because meat is perishable, returns and exchanges may depend on the reason for the request, whether the product has been opened, how it was stored, and whether it was prepared according to the customer’s cutsheet.</h3>
<h3 class="INFO">Customers should contact Syrol Group immediately if the product is defective, damaged, incorrect, unsafe, or different from the confirmed order. The company may request photographs, packaging details, delivery information, and other evidence before deciding on a remedy.</h3>
HTML,
            'keywords' => ['return meat', 'exchange meat', 'fresh meat return', 'defective meat', 'perishable product', 'refund'],
        ],
        [
            'category' => 'Groups and Commercial Customers',
            'title' => 'Does Syrol Group supply restaurants, businesses, and large customers?',
            'answer' => <<<'HTML'
<h3 class="INFO">Yes. Syrol Group supplies households, restaurants, businesses, community buying groups, and other commercial customers</h3>
<h3 class="INFO">Customers can place large orders for whole carcasses, half carcasses, quarter carcasses, bulk meat boxes, or group-sharing packages.</h3>
<h3 class="INFO">Commercial customers should provide:</h3>
<ul class="MeatSupplyList"><li>Required quantity.</li>
<li>Preferred cuts.</li><li>Packaging requirements.</li>
<li>Delivery or collection details.</li><li>Required delivery location.</li>
<li>Expected ordering frequency.</li>
</ul>
<h3 class="INFO">Large orders should be placed in advance because processing, packaging, payment verification, and delivery planning may require additional time.</h3>
HTML,
            'keywords' => ['restaurants', 'businesses', 'commercial beef', 'bulk order', 'large order', 'wholesale', 'business customer'],
        ],
        [
            'category' => 'Groups and Commercial Customers',
            'title' => 'Can a community group place one order and divide the meat?',
            'answer' => <<<'HTML'
<h3 class="INFO">Yes. A community buying group can place one combined order and request a groupsharing package.</h3>
<h3 class="INFO">The group organiser should:</h3>
<ul class="MeatCommunityList"><li>Confirm the number of participants.</li>
<li>Decide how the meat should be divided.</li>
<li>Provide the required portion information.</li>
<li>Arrange one collection or delivery location.</li>
<li>Ensure that payment is completed before processing begins.</li>
</ul>
<h3 class="INFO">Group-sharing packages are designed to divide the meat into equal-weight portions. However, final portions may be affected by the available meat and selected cutting instructions</h3>
<h3 class="INFO">The organiser should confirm with Syrol Group whether different participants may request different cuts. Different cut preferences may affect the weight and composition of the portions.</h3>
HTML,
            'keywords' => ['community group', 'buying group', 'group order', 'shared meat', 'equal portions', 'group package', 'different cuts'],
        ],
        [
            'category' => 'Chatbot Escalation',
            'title' => 'What should I do if the chatbot cannot answer my question?',
            'answer' => <<<'HTML'
<h3 class="INFO">If the chatbot cannot answer a question, the customer should contact a Syrol Group representative.</h3>
<h3 class="INFO">For faster assistance, the customer should provide the following information where applicable:</h3>
<ul class="MeatSupplyList"><li>Order number.</li><li>Customer name.</li>
<li>Product name.</li><li>Delivery or collection details.</li>
<li>Delivery or collection option.</li><li>Delivery address</li>
<li>Payment status.</li><li>Description of the request or problem.</li>
</ul>
<h3 class="INFO">A representative should handle questions about prices, stock availability, special cuts, processing times, refunds, delivery arrangements, and customer-owned animals.</h3>
HTML,
            'keywords' => ['contact Syrol', 'speak to representative', 'chatbot help', 'customer service', 'unanswered question'],
        ],
];

foreach($rows as $row){
    helpfaq::firstOrCreate(['title'=>$row['title']], $row);
}

}


}
