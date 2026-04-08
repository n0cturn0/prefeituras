<?php

namespace App\Http\Controllers;

use App\Models\SiteSubmenu;
use App\Models\SiteUrlSubmenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MenuItemController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $submenuId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'status' => 'required|boolean',
            'position' => 'nullable|integer',
        ]);

        $submenu = SiteSubmenu::findOrFail($submenuId);

        // Determine position if not provided
        $position = $request->position ?? ($submenu->items()->max('position') + 1);

        $submenu->items()->create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'url' => $request->url,
            'status' => $request->status,
            'position' => $position,
        ]);

        Cache::flush();

        return back()->with('success', 'Item adicionado com sucesso.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $item = SiteUrlSubmenu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'status' => 'required|boolean',
            'position' => 'nullable|integer',
        ]);

        $item->update($validated);

        Cache::flush();

        return back()->with('success', 'Item atualizado com sucesso.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $item = SiteUrlSubmenu::findOrFail($id);
        $item->delete();

        Cache::flush();

        return back()->with('success', 'Item excluído com sucesso.');
    }
}
