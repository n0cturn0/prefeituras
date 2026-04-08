<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Models\Funcao;
use Illuminate\Http\JsonResponse;

class FuncaoController extends Controller
{
    public function subfuncoes($codigo): JsonResponse
    {
        $funcao = Funcao::where('codigo', $codigo)->firstOrFail();
        
        return response()->json(
            $funcao->subfuncoes()->orderBy('codigo')->get(['codigo', 'nome'])
        );
    }
}
