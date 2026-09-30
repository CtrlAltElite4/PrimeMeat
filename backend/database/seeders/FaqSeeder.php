<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        Faq::insert([
            [
                'question' => 'What is PrimeMeat?',
                'answer' => 'PrimeMeat is a South African agribusiness based in Limpopo. The company specialises in commercial feedlot operations, meat processing, and the supply of premium-quality beef.

PrimeMeat supplies beef products to households, community buying groups, and commercial customers. The company aims to make bulk meat purchasing simple, affordable, convenient, and reliable.

Keywords: PrimeMeat, company, about PrimeMeat, Limpopo, beef supplier',
            ],
            [
                'question' => 'Where is PrimeMeat located?',
                'answer' => 'PrimeMeat is located in the province of Limpopo, South Africa. The company currently operates from one physical branch or store.

Customers may choose to collect their orders from the branch or request delivery to an available address in South Africa.

Keywords: location, address, Limpopo, branch, store',
            ],
            [
                'question' => 'Does PrimeMeat deliver outside Limpopo?',
                'answer' => 'Yes. PrimeMeat provides internal delivery services to all provinces of South Africa.

Delivery availability may depend on the destination, order size, delivery schedule, and route planning. Customers should enter their delivery address during checkout so that the delivery distance and fee can be calculated.

Keywords: nationwide delivery, all provinces, South Africa delivery, delivery areas',
            ],
            [
                'question' => 'What type of meat does PrimeMeat sell?',
                'answer' => 'PrimeMeat specialises in beef. The company supplies whole carcasses, half carcasses, quarter carcasses, bulk meat boxes, family meat packs, and group-sharing packages.

The available cuts depend on the selected product and the customer’s cutsheet choices.

Keywords: beef, meat products, beef cuts, products',
            ],
            [
                'question' => 'Does PrimeMeat sell locally sourced beef?',
                'answer' => 'PrimeMeat is committed to supplying high-quality, locally sourced beef. The company’s operations include commercial feedlot activities, meat processing, and the preparation of beef products for customers.

Keywords: locally sourced, local beef, feedlot, beef quality',
            ],
            [
                'question' => 'What is a whole carcass?',
                'answer' => 'A whole carcass is a complete beef carcass that has been professionally processed and packaged for bulk buyers or commercial customers.

Customers purchasing a whole carcass may be required to complete a cutsheet. The cutsheet allows them to select how different parts of the beef should be prepared, cut, packaged, or divided.

A whole carcass is generally suitable for commercial customers, large households, restaurants, butcheries, or large buying groups.

Keywords: whole carcass, full carcass, bulk beef, commercial order',
            ],
            [
                'question' => 'What is a half carcass?',
                'answer' => 'A half carcass is one-half of a processed beef carcass. It is professionally cut and packaged according to the customer’s selections.

A half carcass is suitable for families, smaller businesses, restaurants, and groups that require a substantial quantity of beef but do not need a complete carcass.

Keywords: half carcass, half beef, family bulk order',
            ],
            [
                'question' => 'What is a quarter carcass?',
                'answer' => 'A quarter carcass is one-quarter of a processed beef carcass. It provides a smaller and more affordable bulk-buying option.

It is suitable for households, small community groups, and customers who want to buy in bulk without ordering a whole or half carcass.

Keywords: quarter carcass, quarter beef, small bulk order',
            ],
            [
                'question' => 'What are bulk meat boxes?',
                'answer' => 'Bulk meat boxes are standardised beef packages available in different sizes. PrimeMeat offers:

• 10 kg beef boxes.
• 20 kg beef boxes.
• 30 kg beef boxes.
• 50 kg beef boxes.

The boxes contain a selection of premium beef cuts. The exact contents may depend on the selected box, current availability, and the cuts listed on the product page.

Keywords: meat box, bulk box, 10kg box, 20kg box, 30kg box, 50kg box',
            ],
            [
                'question' => 'What is a family meat pack?',
                'answer' => 'A family meat pack is a convenient mixed-cut beef package designed for household consumption.

It may contain a selection of beef cuts suitable for preparing different meals. Customers should review the product description to confirm the approximate weight, cuts, packaging, and price before placing an order.

Keywords: family pack, family meat, household pack, mixed cuts',
            ],
            [
                'question' => 'What are group-sharing packages?',
                'answer' => 'Group-sharing packages are bulk meat packages designed for community buying groups.

The meat can be divided into equal-weight portions for each participant in the group. This allows several customers to purchase meat together while receiving a fair and clearly divided portion.

The group organiser should provide the number of participants and confirm how the portions should be divided when completing the order.

Keywords: group package, community buying group, shared meat, equal portions',
            ],
            [
                'question' => 'Which product should I choose?',
                'answer' => 'The appropriate product depends on the number of people being served, the available budget, storage space, and the intended use of the meat.

• A 10 kg box may be suitable for a small household.
• A 20 kg or 30 kg box may be suitable for a larger household.
• A 50 kg box may be suitable for a large household, business, or buying group.
• A quarter carcass may be suitable for customers who want more variety or custom cuts.
• A half or whole carcass may be suitable for commercial customers and large groups.
• A group-sharing package may be suitable when several people want to share the cost and meat equally.

Customers can contact PrimeMeat if they need help selecting an option.

Keywords: choose product, best meat package, product recommendation, order size',
            ],
            [
                'question' => 'How do I place an order?',
                'answer' => 'To place an order:

1. Browse the available beef products.
2. Select the desired product, quantity, and package size.
3. Complete the required cutsheet if the product requires customised cuts.
4. Select collection or delivery.
5. Enter the required customer and delivery details.
6. Review the order carefully.
7. Submit the order.
8. Make payment before the order can be fulfilled.

The order will only proceed after the required information and payment have been received and confirmed.

Keywords: place order, order process, how to buy, checkout',
            ],
            [
                'question' => 'What is a cutsheet?',
                'answer' => 'A cutsheet is an order form used to specify how the beef should be cut and prepared.

It contains a list of beef parts and preparation options. Customers select their preferred options using multiple-choice checkboxes.

The cutsheet helps PrimeMeat understand how the customer wants the meat divided, cut, packaged, and prepared.

Keywords: cutsheet, cut sheet, meat selection, beef preparation',
            ],
            [
                'question' => 'Why do I need to complete a cutsheet?',
                'answer' => 'A cutsheet is required for products that allow customers to choose specific beef cuts or processing instructions.

It helps reduce misunderstandings and ensures that the processing team has a clear record of the customer’s preferences. Customers should review all selections before submitting the order because the cutsheet may be used as the official processing instruction.

Keywords: cutsheet purpose, custom cuts, processing instructions',
            ],
            [
                'question' => 'What choices are available on the cutsheet?',
                'answer' => 'The cutsheet contains selectable beef parts and preparation options. Depending on the product, customers may be able to choose different cuts such as steaks, mince, roasts, stew meat, ribs, brisket, or other available beef portions.

The exact options are determined by PrimeMeat’s official cutsheet and the type of product ordered.

Customers should select only the cuts that are displayed on the online cutsheet.

Keywords: beef cuts, cutsheet options, available cuts, meat portions',
            ],
            [
                'question' => 'Can I select more than one beef cut?',
                'answer' => 'Yes. The cutsheet uses multiple-choice checkboxes, allowing customers to select the applicable beef cuts and preparation options.

However, selecting a cut does not necessarily mean that the entire order will consist only of that cut. The final quantity of each cut may depend on the size of the carcass, the available meat, the selected product, and normal processing limitations.

Keywords: multiple cuts, checkbox, select cuts, custom order',
            ],
            [
                'question' => 'Can I change my cutsheet after placing an order?',
                'answer' => 'Customers should contact PrimeMeat as soon as possible if they need to change their cutsheet.

Changes may only be possible before processing has started. Once the meat has been cut, packaged, or prepared according to the submitted instructions, changes may not be possible.

Keywords: change cutsheet, edit order, modify cuts, order changes',
            ],
            [
                'question' => 'What happens if I complete the cutsheet incorrectly?',
                'answer' => 'Customers should carefully review the cutsheet before submitting the order.

If a cutsheet is incomplete, unclear, or contains conflicting instructions, PrimeMeat may contact the customer for clarification. This may delay order processing. If processing has already started, the company may not be able to change the selected cuts.

Keywords: incorrect cutsheet, incomplete cutsheet, order mistake',
            ],
            [
                'question' => 'Can I request cuts that are not shown on the cutsheet?',
                'answer' => 'Customers should select from the available options displayed on the official cutsheet.

If a customer requires a cut or preparation method that is not listed, they should contact PrimeMeat before placing the order. The request may depend on the type of meat, available equipment, processing requirements, and additional charges.

Keywords: special cuts, custom request, unavailable cut, extra processing',
            ],
            [
                'question' => 'Are the exact weights of each cut guaranteed?',
                'answer' => 'Exact weights may vary because every carcass and order is different. The final weight of individual cuts may depend on the size of the carcass, trimming, deboning, bone-in or boneless preparation, and the customer’s selections.

The product page should be used to identify whether a listed weight is fixed, approximate, or a standard package size.

Keywords: exact weight, estimated weight, carcass weight, meat quantity',
            ],
            [
                'question' => 'Can I bring my own animal to PrimeMeat?',
                'answer' => 'Yes. Customers may bring their own animal to PrimeMeat for cutting and processing, subject to the company’s acceptance requirements and applicable processing conditions.

Customers should contact PrimeMeat before transporting the animal to confirm whether the company can process it and what documents, preparation, fees, and delivery arrangements are required.

Keywords: own animal, customer animal, private animal, processing service',
            ],
            [
                'question' => 'Can PrimeMeat process a whole animal?',
                'answer' => 'Yes. PrimeMeat can process a whole animal brought by a customer, subject to acceptance and processing requirements.

The customer must provide clear instructions about how the animal should be cut and packaged. A cutsheet may be required before processing begins.

Keywords: whole animal, full animal processing, animal cutting',
            ],
            [
                'question' => 'Can I bring meat that must be cut into smaller pieces?',
                'answer' => 'Yes. Customers may bring meat that needs to be cut into smaller pieces, subject to PrimeMeat’s processing requirements.

The customer should contact the company before arriving to confirm whether the meat is suitable for processing and to discuss the required cuts, packaging, fees, and turnaround time.

Keywords: bring meat, cut smaller, meat processing, customer meat',
            ],
            [
                'question' => 'Do I need to provide a cutsheet for my own animal?',
                'answer' => 'A cutsheet may be required when a customer brings an animal or meat for processing.

The cutsheet allows the customer to specify the desired cuts, portions, and packaging. Customers should confirm the required form with PrimeMeat before delivering the animal or meat.

Keywords: own animal cutsheet, processing form, customer instructions',
            ],
            [
                'question' => 'Is PrimeMeat responsible for transporting my animal?',
                'answer' => 'Customers should confirm the transport arrangements with PrimeMeat before placing an animal-processing request.

Unless otherwise agreed, the customer should not assume that the company will collect the animal. Any transport service, cost, permits, and delivery requirements should be confirmed in advance.

Keywords: animal transport, collection of animal, processing delivery',
            ],
            [
                'question' => 'When must I pay for my order?',
                'answer' => 'Payment is required before PrimeMeat can fulfil the order.

An order may remain pending until payment has been received and verified. Customers should ensure that the correct order reference is used when making payment.

Keywords: payment before fulfilment, prepayment, order payment',
            ],
            [
                'question' => 'Can I place an order and pay when it is delivered?',
                'answer' => 'PrimeMeat’s stated policy is that payment is required before the order can be fulfilled. Customers should therefore not assume that payment on delivery is available.

If a customer requires a different payment arrangement, they should contact PrimeMeat before placing the order.

Keywords: cash on delivery, payment on delivery, pay later',
            ],
            [
                'question' => 'What happens after I make payment?',
                'answer' => 'After payment is received and confirmed, PrimeMeat can begin preparing or processing the order.

The order will then be scheduled for collection or delivery according to the customer’s selected option and the company’s processing and delivery schedule.

Keywords: after payment, order confirmation, payment received',
            ],
            [
                'question' => 'Can I cancel my order after paying?',
                'answer' => 'Customers should contact PrimeMeat as soon as possible if they want to cancel an order.

Cancellation may depend on whether the order has already been processed, cut, packaged, dispatched, or delivered. Any refund or cancellation decision will be subject to the company’s cancellation policy.

Keywords: cancel order, refund, paid order, cancellation',
            ],
            [
                'question' => 'How will I know whether my order was accepted?',
                'answer' => 'The website should display an order confirmation after the order is submitted. PrimeMeat may also provide a confirmation through email, SMS, WhatsApp, or another communication channel.

An order should be treated as ready for processing only after payment has been received and confirmed.

Keywords: order confirmation, accepted order, order status',
            ],
            [
                'question' => 'Can I collect my order?',
                'answer' => 'Yes. Customers may choose collection instead of delivery during checkout.

Collection will take place at PrimeMeat’s physical branch or store. Customers should wait for confirmation that the order is ready before travelling to collect it.

Keywords: collection, pickup, collect order, store collection',
            ],
            [
                'question' => 'Does PrimeMeat offer delivery?',
                'answer' => 'Yes. PrimeMeat offers internal delivery services to customers in all provinces of South Africa.

Delivery is selected during checkout. The customer must provide a complete and accurate delivery address and ensure that someone is available to receive the order.

Keywords: delivery, home delivery, nationwide delivery',
            ],
            [
                'question' => 'How much does delivery cost?',
                'answer' => 'PrimeMeat charges R12 per kilometre for delivery.

The final delivery fee should be calculated according to the distance between the PrimeMeat branch and the customer’s delivery address. Customers should verify the calculated amount before completing payment.

Keywords: delivery fee, R12 per km, delivery price, kilometre charge',
            ],
            [
                'question' => 'How is the delivery distance calculated?',
                'answer' => 'The delivery distance is calculated from PrimeMeat’s branch or dispatch location to the customer’s delivery address.

Customers should provide a complete address, including the suburb, town, province, postal code, and any relevant landmarks. The final fee may depend on the route used by the company.

Keywords: delivery distance, delivery calculation, address, route',
            ],
            [
                'question' => 'Does delivery cost depend on the amount of meat ordered?',
                'answer' => 'The stated delivery charge is R12 per kilometre. The distance-based calculation may apply regardless of whether the customer orders a small or large quantity.

However, large commercial orders or special delivery arrangements may be handled differently. Customers should contact PrimeMeat if they are placing a large or business order.

Keywords: delivery quantity, bulk delivery, commercial delivery',
            ],
            [
                'question' => 'Can I change my delivery address after placing the order?',
                'answer' => 'Customers should contact PrimeMeat immediately if they need to change the delivery address.

An address change may affect the delivery fee, route, delivery date, and availability. Changes may not be possible once the order has been dispatched.

Keywords: change address, delivery address, update address',
            ],
            [
                'question' => 'What happens if nobody is available to receive the order?',
                'answer' => 'Customers should ensure that an authorised person is available to receive the delivery.

If nobody is available, PrimeMeat may need to reschedule the delivery. Additional delivery charges or delays may apply depending on the circumstances.

Keywords: missed delivery, unavailable customer, delivery attempt',
            ],
            [
                'question' => 'Do you deliver to businesses and community groups?',
                'answer' => 'Yes. PrimeMeat supplies households, community buying groups, and commercial customers.

Business and group customers should provide accurate delivery information and identify a responsible person who can receive and inspect the order.

Keywords: business delivery, group delivery, commercial order',
            ],
            [
                'question' => 'How is the meat packaged?',
                'answer' => 'PrimeMeat packages meat using boxes or vacuum-sealed plastics.

The packaging method may depend on the selected product, the type of cut, the order size, and the processing instructions.

Keywords: packaging, boxes, vacuum packaging, vacuum-sealed meat',
            ],
            [
                'question' => 'Why is vacuum packaging used?',
                'answer' => 'Vacuum packaging removes much of the air around the meat and helps protect the product during storage and transport.

Customers should still follow the storage instructions provided by PrimeMeat and keep the meat at the required temperature after receiving it.

Keywords: vacuum pack, vacuum-sealed, meat storage, packaging',
            ],
            [
                'question' => 'Can I request a specific packaging method?',
                'answer' => 'Customers may request a packaging preference, but the request must be confirmed with PrimeMeat before processing.

The available packaging method may depend on the product, cut, equipment, quantity, and any applicable additional charge.

Keywords: packaging request, boxes, plastic packaging, custom packaging',
            ],
            [
                'question' => 'How should I store the meat after delivery or collection?',
                'answer' => 'Customers should transfer the meat to appropriate refrigerated or frozen storage as soon as possible after collection or delivery.

The meat should remain in its packaging unless it needs to be opened for preparation. Customers should follow the storage and use-by instructions supplied with the order.

Keywords: store meat, refrigeration, freezing, meat safety',
            ],
            [
                'question' => 'Can I freeze the meat?',
                'answer' => 'Customers should follow the storage guidance provided by PrimeMeat and the instructions on the product packaging.

Vacuum-packed meat may be suitable for refrigeration or freezing, but customers should confirm the recommended storage period and thawing instructions for their specific product.

Keywords: freeze beef, frozen meat, thaw meat, storage',
            ],
            [
                'question' => 'How does PrimeMeat maintain beef quality?',
                'answer' => 'PrimeMeat is involved in commercial feedlot operations, meat processing, and the supply of premium-quality beef.

The company aims to provide locally sourced beef that is processed and packaged according to the customer’s selected product and cutsheet instructions.

Keywords: beef quality, premium beef, feedlot quality, processing',
            ],
            [
                'question' => 'What should I do if my order is incorrect?',
                'answer' => 'Customers should contact PrimeMeat as soon as possible and provide:

• The order number.
• The customer’s name and contact details.
• A description of the problem.
• Photographs of the product and packaging, if relevant.
• The cutsheet or order selections.
• The date and time of collection or delivery.

Customers should keep the product and packaging until PrimeMeat has investigated the issue.

Keywords: incorrect order, wrong cuts, complaint, order problem',
            ],
            [
                'question' => 'What should I do if the packaging is damaged?',
                'answer' => 'Customers should inspect the packaging when receiving the order.

If the packaging is damaged, leaking, open, or appears unsafe, the customer should record the problem, take photographs, and contact PrimeMeat immediately. The customer should avoid consuming the product until the issue has been reviewed.

Keywords: damaged packaging, leaking meat, unsafe package, complaint',
            ],
            [
                'question' => 'What should I do if my order is incomplete?',
                'answer' => 'Customers should compare the received order with the order confirmation and cutsheet.

If any item or portion is missing, they should contact PrimeMeat promptly with the order number, a description of the missing item, and photographs of the received package where possible.

Keywords: missing meat, incomplete order, missing product',
            ],
            [
                'question' => 'Can I return fresh meat?',
                'answer' => 'Customers should contact PrimeMeat before attempting to return any meat product.

Because meat is a perishable product, returns may be handled differently from ordinary non-perishable products. The company may require photographs, packaging information, delivery details, and other evidence before deciding on a remedy.

Keywords: return meat, fresh meat return, perishable product',
            ],
            [
                'question' => 'Can I exchange meat after collection or delivery?',
                'answer' => 'An exchange may depend on the reason for the request and whether the product has been opened, stored correctly, or processed according to the customer’s cutsheet.

Customers should contact PrimeMeat immediately if the product is defective, damaged, incorrect, or different from the confirmed order.

Keywords: exchange meat, replace order, defective meat, wrong order',
            ],
            [
                'question' => 'Does PrimeMeat supply restaurants and businesses?',
                'answer' => 'Yes. PrimeMeat supplies commercial customers in addition to households and community buying groups.

Businesses should provide information about the required quantities, preferred cuts, delivery location, packaging requirements, and expected ordering frequency.

Keywords: restaurant supply, business customer, commercial beef, wholesale',
            ],
            [
                'question' => 'Can I place a large bulk order?',
                'answer' => 'Yes. Customers may order whole carcasses, half carcasses, quarter carcasses, large meat boxes, or group-sharing packages.

Large orders should be placed in advance because processing, packaging, payment verification, and delivery planning may require additional time.

Keywords: large order, bulk order, commercial quantity, wholesale beef',
            ],
            [
                'question' => 'Can a community group place one order?',
                'answer' => 'Yes. Community buying groups can place a combined order and request a group-sharing package.

The group organiser should collect the participants’ requirements, confirm the number of portions, provide one delivery or collection arrangement, and ensure that payment is completed before processing begins.

Keywords: community group, buying group, shared order, group purchase',
            ],
            [
                'question' => 'How are group portions divided?',
                'answer' => 'Group-sharing packages are designed to divide the meat into equal-weight portions for each participant.

The number of portions should be specified when the order is placed. Final portions may be affected by the available meat and the selected cutting instructions, so the group should confirm the arrangements with PrimeMeat before payment.

Keywords: equal portions, group division, shared meat portions',
            ],
            [
                'question' => 'Can different customers in one group choose different cuts?',
                'answer' => 'This depends on the group-sharing product and PrimeMeat’s processing procedure.

If all portions must be equal, different cut selections may affect the weight and composition of the portions. The group organiser should confirm whether individual cut preferences can be accommodated before submitting the order.

Keywords: different cuts, group preferences, equal portions',
            ],
        ]);
    }
}