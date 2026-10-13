<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin > Chatbot content. Manages the team's faqs table (question, answer).
 * The chatbot (ChatbotController) reads every FAQ on each question, so changes apply immediately.
 */
class FaqController extends Controller
{
    private const PER_PAGE = 10;

    /** GET /api/admin/faqs?search=&page= */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $faqs = Faq::query()
            ->when($data['search'] ?? null, function ($q, $search) {
                $term = '%'.addcslashes($search, '%_\\').'%';
                $q->where(fn ($q) => $q->where('question', 'like', $term)->orWhere('answer', 'like', $term));
            })
            ->latest('updated_at')
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Faq $faq) => $this->present($faq));

        return response()->json($faqs);
    }

    /** The four cards. */
    public function stats(): JsonResponse
    {
        $weekAgo = now()->subDays(7);

        return response()->json([
            'total' => Faq::count(),
            'added_last_7_days' => Faq::where('created_at', '>=', $weekAgo)->count(),
            'updated_last_7_days' => Faq::where('updated_at', '>=', $weekAgo)->whereColumn('updated_at', '>', 'created_at')->count(),
            'last_change' => Faq::max('updated_at'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $faq = Faq::create($this->validated($request));

        return response()->json($this->present($faq), 201);
    }

    public function update(Request $request, Faq $faq): JsonResponse
    {
        $faq->update($this->validated($request, $faq));

        return response()->json($this->present($faq));
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json(['deleted' => true]);
    }

    private function validated(Request $request, ?Faq $faq = null): array
    {
        return $request->validate([
            'question' => ['required', 'string', 'max:255', Rule::unique('faqs', 'question')->ignore($faq?->id)],
            'answer' => ['required', 'string', 'max:5000'],
        ], [
            'question.unique' => 'There is already an FAQ with this question.',
        ]);
    }

    private function present(Faq $faq): array
    {
        return [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'updated' => $faq->updated_at?->toDateString(),
        ];
    }
}
