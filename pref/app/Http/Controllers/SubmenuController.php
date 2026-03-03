<?php

namespace App\Http\Controllers;

use App\Models\SiteMenu;
use App\Models\SiteSubmenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class SubmenuController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $menuId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
            'url' => 'nullable|string|max:255', // Submenus usually have # but can have links
        ]);

        $menu = SiteMenu::findOrFail($menuId);

        $menu->submenus()->create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'url' => $request->url ?? '#',
            'status' => $request->status,
        ]);

        Cache::flush();

        return back()->with('success', 'Submenu criado com sucesso.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $submenu = SiteSubmenu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
            'url' => 'nullable|string|max:255',
        ]);

        $submenu->update($validated);

        Cache::flush();

        return back()->with('success', 'Submenu atualizado com sucesso.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $submenu = SiteSubmenu::findOrFail($id);
        $submenu->delete();

        Cache::flush();

        return back()->with('success', 'Submenu excluído com sucesso.');
    }
}
