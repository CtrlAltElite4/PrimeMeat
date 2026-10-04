<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        Faq::query()->delete();
        Faq::insert([
            [
                'question' => 'What is PrimeMeat?',
                'answer' => 'PrimeMeat is a South African agribusiness based in Limpopo. The company specialises in commercial feedlot operations, meat processing, and the supply of premium-quality beef.

PrimeMeat supplies beef products to households, community buying groups, and commercial customers. The company aims to make bulk beef purchasing simple, convenient, and reliable.

Keywords: PrimeMeat, company, about PrimeMeat, Limpopo, beef supplier',
            ],
            [
                'question' => 'Where is PrimeMeat located?',
                'answer' => 'PrimeMeat is located in Limpopo, South Africa. The company currently operates from one physical branch or store.

Customers may choose to collect their orders from the branch or request delivery through PrimeMeat’s external delivery service.

Keywords: location, address, Limpopo, branch, store',
            ],
            [
                'question' => 'Does PrimeMeat deliver outside Limpopo?',
                'answer' => 'Yes. PrimeMeat offers delivery throughout all provinces of South Africa through an external delivery service.

Delivery availability may depend on the destination and delivery arrangements. Customers should provide their delivery address during checkout.

Keywords: nationwide delivery, all provinces, South Africa delivery, delivery areas',
            ],
            [
                'question' => 'What type of meat does PrimeMeat sell?',
                'answer' => 'PrimeMeat specialises in beef. The company offers whole carcasses, half carcasses, quarter carcasses, and group orders.

The available cuts depend on the selected product and, where applicable, the customer’s cutsheet choices.

Keywords: beef, meat products, beef cuts, products, whole carcass, half carcass, quarter carcass, group order',
            ],
            [
                'question' => 'Does PrimeMeat sell locally sourced beef?',
                'answer' => 'PrimeMeat is committed to supplying high-quality, locally sourced beef. The company’s operations include commercial feedlot activities, meat processing, and the preparation of beef products for customers.

Keywords: locally sourced, local beef, feedlot, beef quality',
            ],
            [
                'question' => 'What is a whole carcass?',
                'answer' => 'A whole carcass is the entire beef carcass prepared and processed as one large order. It provides a large quantity of beef and allows customers to receive a wide variety of cuts.

A whole carcass may be suitable for large households, businesses, restaurants, butcheries, community buying groups, weddings, funerals, parties, family gatherings, and other large events.

The right carcass size depends on factors such as the number of people being served, the type of event, the amount of meat needed, and the customer’s budget.

Keywords: whole carcass, full carcass, beef carcass, large order, wedding, funeral, event, bulk beef',
            ],
            [
                'question' => 'What is a half carcass?',
                'answer' => 'A half carcass is half of a beef carcass prepared and processed as one order. It provides a substantial amount of beef while being smaller than a whole carcass.

A half carcass may be suitable for families, businesses, restaurants, community buying groups, weddings, funerals, parties, family gatherings, and other events where a substantial amount of beef is needed.

The right carcass size depends on the number of people being served, the type of event, the amount of meat needed, and the customer’s budget.

Keywords: half carcass, half beef, family bulk order, wedding, funeral, event',
            ],
            [
                'question' => 'What is a quarter carcass?',
                'answer' => 'A quarter carcass is one-quarter of a beef carcass prepared and processed as one order. It provides a smaller quantity of beef than a half or whole carcass.

A quarter carcass may be suitable for households, smaller groups, family gatherings, smaller events, or customers who want to buy beef in bulk without ordering a whole or half carcass.

The right carcass size depends on the number of people being served, the type of event, the amount of meat needed, and the customer’s budget.

Keywords: quarter carcass, quarter beef, smaller bulk order, family gathering, event',
            ],
            [
                'question' => 'Which carcass size should I choose?',
                'answer' => 'The best carcass size depends on how many people you need to serve, the type of event or occasion, how much beef you need, your storage space, and your budget.

A quarter carcass provides a smaller bulk order, a half carcass provides a larger amount, and a whole carcass provides the largest amount.

Carcasses may be suitable for households, businesses, community groups, weddings, funerals, parties, family gatherings, and other events. If you provide details about your occasion and the number of people involved, PrimeMeat can help you determine which option may be appropriate.

Keywords: choose carcass, carcass size, quarter carcass, half carcass, whole carcass, wedding, funeral, event',
            ],
            [
                'question' => 'What is a group order?',
                'answer' => 'A group order allows several people to purchase beef together as one order.

The meat is prepared using traditional cuts and divided as evenly as possible among the members of the group. Group orders are separate from the normal shopping cart and are checked out directly from the Group Orders section.

Keywords: group order, group buying, community group, shared order, bulk beef',
            ],
            [
                'question' => 'How many people can be included in a group order?',
                'answer' => 'A group order must have at least 2 people and can include a maximum of 8 people.

Keywords: group size, group order size, minimum group, maximum group, 2 people, 8 people',
            ],
            [
                'question' => 'How are group order portions divided?',
                'answer' => 'The meat in a group order is divided as evenly as possible between the members of the group.

Traditional cuts are used, with stew meats divided equally and normal steaks divided equally between participants.

Keywords: group portions, equal portions, group order cuts, traditional cuts, shared meat',
            ],
            [
                'question' => 'Can I include ground beef in a group order?',
                'answer' => 'Yes. Ground beef can be included as an optional part of a group order.

Keywords: ground beef, mince, group order, optional ground beef',
            ],
            [
                'question' => 'Can I choose delivery or collection for a group order?',
                'answer' => 'Yes. Group orders can be collected or delivered.

For delivery, the customer must provide the required delivery address during the group order checkout process.

Keywords: group order delivery, group order collection, group collection, group delivery',
            ],
            [
                'question' => 'What is a cutsheet?',
                'answer' => 'A cutsheet is an order form used to specify how the beef should be cut and prepared.

It contains a list of beef parts and preparation options. Customers select their preferred options using the available choices.

The cutsheet helps PrimeMeat understand how the customer wants the meat divided, cut, packaged, and prepared.

Keywords: cutsheet, cut sheet, meat selection, beef preparation',
            ],
            [
                'question' => 'Why do I need to complete a cutsheet?',
                'answer' => 'A cutsheet is required for products that allow customers to choose specific beef cuts or processing instructions.

It helps reduce misunderstandings and gives the processing team a clear record of the customer’s preferences. Customers should review their selections carefully before submitting the order.

Keywords: cutsheet purpose, custom cuts, processing instructions',
            ],
            [
                'question' => 'What choices are available on the cutsheet?',
                'answer' => 'The cutsheet contains selectable beef cuts and preparation options.

For a front quarter, available choices include brisket, chuck, short ribs, rib steak, rib eye, prime rib, stew meat, soup shanks, and soup bones.

For a hind quarter, available choices include T-bone, sirloin, ramp steak, leg roasts, ground beef, and soup bones.

Soup bones are included with every quarter. For the rib option, customers choose between rib steak, rib eye, or prime rib.

Customers should select only the options displayed on the current online cutsheet.

Keywords: cutsheet options, beef cuts, front quarter, hind quarter, brisket, chuck, short ribs, rib steak, rib eye, prime rib, T-bone, sirloin, ramp steak, leg roast, ground beef, soup bones',
            ],
            [
                'question' => 'Can I select more than one beef cut?',
                'answer' => 'Yes. Customers can select the applicable beef cuts and preparation options available on the cutsheet.

The final quantity of each cut may depend on the size of the carcass, the available meat, the selected product, and normal processing limitations.

Keywords: multiple cuts, select cuts, custom order, beef cuts',
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

If a cutsheet is incomplete, unclear, or contains conflicting instructions, PrimeMeat may contact the customer for clarification. This may delay order processing. If processing has already started, the selected cuts may not be able to be changed.

Keywords: incorrect cutsheet, incomplete cutsheet, order mistake',
            ],
            [
                'question' => 'Can I request cuts that are not shown on the cutsheet?',
                'answer' => 'Customers should select from the available options displayed on the official cutsheet.

If a customer requires a cut or preparation method that is not listed, they should contact PrimeMeat before placing the order. The request may depend on the type of meat, available equipment, and processing requirements.

Keywords: special cuts, custom request, unavailable cut, extra processing',
            ],
            [
                'question' => 'Are the exact weights of each cut guaranteed?',
                'answer' => 'Exact weights may vary because every carcass and order is different. The final weight of individual cuts may depend on the size of the carcass, trimming, deboning, bone-in or boneless preparation, and the customer’s selections.

The product description should be used to identify whether a listed weight is fixed or approximate.

Keywords: exact weight, estimated weight, carcass weight, meat quantity',
            ],
            [
                'question' => 'When must I pay for my order?',
                'answer' => 'Payment is required before PrimeMeat can fulfil the order.

An order may remain pending until payment has been received and verified. Customers should ensure that the correct order reference is used when making payment.

Keywords: payment, payment before fulfilment, prepayment, order payment',
            ],
            [
                'question' => 'Can I place an order and pay when it is delivered?',
                'answer' => 'PrimeMeat requires payment before an order can be fulfilled. Customers should therefore not assume that payment on delivery is available.

Keywords: cash on delivery, payment on delivery, pay later',
            ],
            [
                'question' => 'What happens after I make payment?',
                'answer' => 'After payment is received and confirmed, PrimeMeat can begin preparing or processing the order.

The order will then be scheduled for collection or delivery according to the customer’s selected option and the company’s processing and delivery arrangements.

Keywords: after payment, order confirmation, payment received',
            ],
            [
                'question' => 'Can I cancel my order after paying?',
                'answer' => 'Customers should contact PrimeMeat as soon as possible if they want to cancel an order.

Cancellation may depend on whether the order has already been processed, cut, packaged, dispatched, or delivered. Any refund or cancellation decision will be subject to PrimeMeat’s cancellation policy.

Keywords: cancel order, refund, paid order, cancellation',
            ],
            [
                'question' => 'How will I know whether my order was accepted?',
                'answer' => 'The website should display an order confirmation after the order is submitted.

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
                'answer' => 'Yes. PrimeMeat offers delivery throughout all provinces of South Africa through an external delivery service.

Delivery is selected during checkout. The customer must provide a complete and accurate delivery address and ensure that someone is available to receive the order.

Keywords: delivery, home delivery, external delivery service, nationwide delivery, all provinces',
            ],
            [
                'question' => 'How is the delivery distance calculated?',
                'answer' => 'Delivery arrangements are handled through PrimeMeat’s external delivery service.

Customers should provide a complete and accurate delivery address during checkout so that the delivery service can process the delivery request.

Keywords: delivery distance, delivery address, delivery service, address',
            ],
            [
                'question' => 'Can I change my delivery address after placing the order?',
                'answer' => 'Customers should contact PrimeMeat as soon as possible if they need to change the delivery address.

An address change may affect the delivery arrangements and may not be possible once the order has been dispatched.

Keywords: change address, delivery address, update address',
            ],
            [
                'question' => 'What happens if nobody is available to receive the order?',
                'answer' => 'Customers should ensure that an authorised person is available to receive the delivery.

If nobody is available, the delivery may need to be rescheduled. Customers should contact PrimeMeat if they are unable to receive their order at the arranged time.

Keywords: missed delivery, unavailable customer, delivery attempt',
            ],
            [
                'question' => 'Do you deliver to businesses and community groups?',
                'answer' => 'Yes. PrimeMeat supplies households, community buying groups, and commercial customers.

Business and group customers should provide accurate delivery information and identify a responsible person who can receive the order.

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

The available packaging method may depend on the product, cut, equipment, quantity, and any applicable requirements.

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

Vacuum-packed meat may be suitable for refrigeration or freezing, but customers should follow the recommended storage period and thawing instructions provided with their product.

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
                'answer' => 'Yes. Customers may place large orders for whole carcasses, half carcasses, quarter carcasses, or group orders.

Large orders should be placed in advance because processing, packaging, payment verification, and delivery planning may require additional time.

Keywords: large order, bulk order, commercial quantity, wholesale beef',
            ],
            [
                'question' => 'Can a community group place one order?',
                'answer' => 'Yes. Community buying groups can place a group order.

The group organiser should provide the required participant information, confirm the number of people in the group, and ensure that payment is completed before processing begins.

Keywords: community group, buying group, group order, group purchase',
            ],
        ]);
    }
}
