<?php

namespace App\Http\Controllers\Ppa;

use App\Http\Controllers\Controller;
use App\Models\Ppa;
use App\Http\Requests\Ppa\StorePpaRequest;
use App\Http\Requests\Ppa\UpdatePpaRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PpaController extends Controller
{
    public function index(Request $request)
    {
        $ppas = Ppa::withCount(['programas'])->orderBy('ano_inicio', 'desc')->paginate(10);
        
        $stats = [
            'total' => Ppa::count(),
            'em_vigor' => Ppa::where('status', 'em_vigor')->count(),
            'em_revisao' => Ppa::where('status', 'revisao')->count(),
        ];

        return Inertia::render('PPA/PpaIndex', [
            'ppas' => $ppas,
            'stats' => $stats
        ]);
    }

    public function create()
    {
        return Inertia::render('PPA/PpaForm');
    }

    public function store(StorePpaRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei_ppa')) {
            $data['pdf_lei_ppa'] = $request->file('pdf_lei_ppa')->store('ppa_pdfs', 'public');
        }

        Ppa::create($data);

        return redirect()->route('ppa.index')->with('success', 'PPA criado com sucesso.');
    }

    public function edit(Ppa $ppa)
    {
        return Inertia::render('PPA/PpaForm', [
            'ppa' => $ppa
        ]);
    }

    public function update(UpdatePpaRequest $request, Ppa $ppa)
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_lei_ppa')) {
            if ($ppa->pdf_lei_ppa) {
                Storage::disk('public')->delete($ppa->pdf_lei_ppa);
            }
            $data['pdf_lei_ppa'] = $request->file('pdf_lei_ppa')->store('ppa_pdfs', 'public');
        }

        $ppa->update($data);

        return redirect()->route('ppa.index')->with('success', 'PPA atualizado com sucesso.');
    }

    public function destroy(Ppa $ppa)
    {
        if ($ppa->pdf_lei_ppa) {
            Storage::disk('public')->delete($ppa->pdf_lei_ppa);
        }
        
        $ppa->delete();

        return redirect()->route('ppa.index')->with('success', 'PPA excluído com sucesso.');
    }
}
