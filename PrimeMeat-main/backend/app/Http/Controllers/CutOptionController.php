<?php

namespace App\Http\Controllers;

use App\Models\CutOption;
use Illuminate\Http\JsonResponse;

class CutOptionController extends Controller
{
    public function index(): JsonResponse
    {
        $cutOptions = CutOption::orderBy('quarter')
            ->orderBy('id')
            ->get();

        return response()->json([
            'cut_options' => $cutOptions,
        ]);
    }
}
