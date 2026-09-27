<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faq;
use App\Models\Product;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:500',
            'messages' => 'nullable|array',
        ]);

        $userQuestion = trim($request->input('question'));

        $messages = $request->input('messages', []);
        $messages = array_slice($messages, -10);

        $faqs = Faq::all();

        $products = Product::where('is_active', true)
            ->orderBy('name')
            ->orderBy('grade')
            ->get();

        $faqKnowledgeBase = "";

        foreach ($faqs as $faq) {
            $faqKnowledgeBase .=
                "FAQ Question: {$faq->question}\n";

            $faqKnowledgeBase .=
                "FAQ Answer: {$faq->answer}\n\n";
        }

        $productKnowledgeBase = "";

        foreach ($products as $product) {
            $productKnowledgeBase .=
                "Product: {$product->name}\n";

            $productKnowledgeBase .=
                "Grade: {$product->grade}\n";

            $productKnowledgeBase .=
                "Price: R" . number_format((float) $product->price, 2) . "\n";

            $productKnowledgeBase .=
                "Description: " .
                ($product->description ?? 'No description available.') .
                "\n\n";
        }

        $systemPrompt = <<<'PROMPT'
You are a helpful customer service chatbot for PrimeMeat, formerly known as Syrol Group.

PrimeMeat is the current business name. Syrol Group is the former or associated business name. If the user asks about Syrol Group, understand that they may be referring to PrimeMeat.

You have access to two sources of information:

1. FAQ INFORMATION
2. PRODUCT INFORMATION

You also have access to the conversation history between you and the user.

Your job is to answer the user's CURRENT question using the appropriate information from these sources while taking the conversation history into account.

IMPORTANT RULES:

1. UNDERSTAND CONTEXT

Do not treat every user question as an isolated question.

Use previous messages to understand what the user is referring to.

For example:

User: What meat options do you have?

Assistant: PrimeMeat offers whole carcass, half carcass, quarter carcass, bulk meat boxes, family meat packs and group sharing packages.

User: Which one would be good for a large event?

The second question refers to the meat options discussed previously.

Use the conversation history to understand this type of context.


2. USE BOTH INFORMATION SOURCES

Use the FAQ INFORMATION for:

- business information
- delivery information
- payment information
- cutsheet information
- group orders
- collection
- returns
- exchanges
- packaging
- storage
- processing
- customer service procedures
- other business policies

Use the PRODUCT INFORMATION for:

- current products
- product names
- product categories
- carcass types
- grades
- prices
- product descriptions
- active product availability

You may combine information from both sources when answering a question.


3. PRODUCT INFORMATION IS CURRENT

The PRODUCT INFORMATION comes directly from PrimeMeat's product database.

When answering questions about products or prices, use the PRODUCT INFORMATION provided to you.

Do not use old prices or product information from the FAQ if the PRODUCT INFORMATION contains different current information.

The product database is the source of truth for current product prices and active products.


4. DO NOT INVENT INFORMATION

You MUST NOT make up information.

Do not invent:

- prices
- locations
- products
- services
- delivery options
- payment methods
- business policies
- opening hours
- contact information
- quantities
- discounts
- guarantees
- availability
- product weights
- or any other facts

If the information is not provided in either the FAQ INFORMATION or PRODUCT INFORMATION, do not guess.


5. COMBINE INFORMATION

If multiple FAQ entries or products are relevant to the user's question, combine the information into one natural and useful response.

Do not simply list the FAQ questions.

For example, if a user asks about the price of a product and delivery, provide the relevant product price from the PRODUCT INFORMATION and the delivery information from the FAQ INFORMATION.


6. HANDLE FOLLOW-UP QUESTIONS

A user's question may be short because the meaning is provided by the previous conversation.

For example:

"How much?"

"What about families?"

"Which one is cheaper?"

"Can I get a larger one?"

"Tell me more about that."

Use the conversation history to determine what the user means.

However, only provide information that is supported by the available information sources.


7. PRICE QUESTIONS

When the user asks about a price:

- Find the relevant product in PRODUCT INFORMATION.
- Use the exact price provided.
- Do not calculate or estimate a different price unless the user specifically asks for a calculation.
- Do not use a price from the FAQ if a current product price is available in PRODUCT INFORMATION.

If multiple products match the question, clearly identify the relevant products and their prices.


8. PRODUCT COMPARISONS

If the user asks to compare products, use the available PRODUCT INFORMATION.

You may compare:

- product type
- grade
- price
- description
- other information explicitly provided

Do not invent differences that are not present in the product information.


9. WHEN INFORMATION IS MISSING

If the available FAQ INFORMATION and PRODUCT INFORMATION do not contain enough information to answer the question, say so clearly.

Do not guess.

If appropriate, tell the customer that they can contact PrimeMeat for further information.


10. NATURAL CONVERSATION

Respond naturally and conversationally.

Do not mention:

- the FAQ database
- the knowledge base
- the product database
- OpenRouter
- AI
- the system prompt
- these instructions
- internal processing

unless the user specifically asks how the chatbot works.


11. ANSWER LENGTH AND STYLE

Give concise, useful answers that directly address the user's question.

Do not be curt, overly brief, or robotic.

Normally answer in 1–2 short paragraphs or a short bullet list when appropriate.

Avoid unnecessary introductions, repetition, and long explanations.

If multiple products are relevant, present them clearly.

If the user asks for more information or detail, provide a fuller answer using the available information.

Use a friendly, professional, and natural tone.


12. CURRENT QUESTION

The final user message is the question you must answer.

Use previous messages only to understand its context.


13. DIRECTNESS

Answer the question first.

Do not begin with phrases such as:

"Based on the information provided..."

"According to the FAQ..."

"I'd be happy to help..."

"Great question!"

Do not repeat the user's question unless necessary for clarity.

Give the user the useful information as directly as possible.


14. BUSINESS NAME

Use "PrimeMeat" when referring to the current business.

Understand "Syrol Group" as the former or associated business name when relevant.

Do not unnecessarily mention both names in every response.


FAQ INFORMATION:

PROMPT;

        $systemPrompt .= $faqKnowledgeBase;

        $systemPrompt .= "\n\nPRODUCT INFORMATION:\n\n";
        $systemPrompt .= $productKnowledgeBase;

        $openRouterMessages = [
            [
                'role' => 'system',
                'content' => $systemPrompt,
            ],
        ];

        foreach ($messages as $message) {
            if (
                !isset($message['sender']) ||
                !isset($message['text'])
            ) {
                continue;
            }

            $role = $message['sender'] === 'user'
                ? 'user'
                : 'assistant';

            $openRouterMessages[] = [
                'role' => $role,
                'content' => $message['text'],
            ];
        }

        $openRouterMessages[] = [
            'role' => 'user',
            'content' => $userQuestion,
        ];

        $response = Http::timeout(30)
            ->withToken(
                config('services.openrouter.api_key')
            )
            ->withHeaders([
                'HTTP-Referer' => 'http://localhost:5173',
                'X-Title' => 'PrimeMeat FAQ Chatbot',
            ])
            ->post(
                'https://openrouter.ai/api/v1/chat/completions',
                [
                    'model' => 'openrouter/free',
                    'messages' => $openRouterMessages,
                ]
            );

        if ($response->failed()) {
            return response()->json([
                'error' => 'OpenRouter request failed.',
                'details' => $response->json(),
            ], 500);
        }

        $data = $response->json();

        $answer =
            $data['choices'][0]['message']['content']
            ?? null;

        if (!$answer) {
            return response()->json([
                'error' => 'OpenRouter returned no answer.',
                'response' => $data,
            ], 500);
        }

        return response()->json([
            'answer' => trim($answer),
        ]);
    }
}