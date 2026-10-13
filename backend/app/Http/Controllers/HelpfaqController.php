<?php

namespace App\Http\Controllers;
use App\Models\helpfaq;
use Illuminate\Http\Request;

class HelpfaqController extends Controller
{
    //

    public function instructions(): array{
        return [
        'category' => 'required|string|max:40',
        'title' => 'required|string|max:200',
        'answer' => 'required|string',
        'keywords' => 'nullable|array',
        'keywords.*' => 'string|max:100',
        ];
    }

    //Displays All Info
    public function index(){
        return helpfaq::orderBy('category')->orderBy('id')->get();
    }

    //Validates instructions are met and a new row is created when needed
    public function store(Request $request){
        $data = $request->validate($this->instructions());
        $faq = helpfaq::create($data);
        return response()->json($faq, 201);
    }

        //Validates instructions are met and Updates one row
    public function update(Request $request, helpfaq $helpFaq){
        $data = $request->validate($this->instructions());
        $helpFaq->update($data);
         return response()->json($helpFaq, 200);
    }

    //Deletes a row
    public function destroy(helpfaq $helpFaq){

            $helpFaq->delete();
            return response()->noContent();
    }
}
