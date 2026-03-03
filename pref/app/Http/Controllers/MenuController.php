<?php

namespace App\Http\Controllers;

use App\Models\SiteMenu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Menus/Index', [
            'menus' => SiteMenu::orderBy('created_at')->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not implemented for now, assuming seeders handle creation or via direct DB insert initially
        abort(404);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Not implemented
        abort(404);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $menu = SiteMenu::where('id', $id)->with(['submenus.items.page'])->firstOrFail();

        return Inertia::render('Admin/Menus/Edit', [
            'menu' => $menu
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $menu = SiteMenu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);

        $menu->update($validated);

        // Clear cache
        Cache::flush(); // Simple flush for now as per requirement "o cache do site (se houver) seja limpo"

        return redirect()->route('menus.index')->with('success', 'Menu atualizado com sucesso.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Optional: Implement if needed, but risky for main menus
        abort(403); 
    }
}
