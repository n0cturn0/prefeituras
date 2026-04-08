<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use App\Models\SiteMenu;
use App\Models\SiteUrlSubmenu;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class PageController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $itemId = $request->query('item_id');
        $item = SiteUrlSubmenu::findOrFail($itemId);

        return Inertia::render('Admin/Pages/Editor', [
            'item' => $item,
            'page' => null, // Creating new
            'menus' => SiteMenu::where('status', true)->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'site_url_submenu_id' => 'required|exists:site_url_submenus,id',
            'title' => 'required|string|max:255',
            'content_html' => 'nullable|string',
            'content_css' => 'nullable|string',
            'content_components' => 'nullable|string', // JSON string (GrapesJS ou Craft.js)
            'status' => 'boolean',
            'has_sidebar' => 'boolean',
            'sidebar_content' => 'nullable|string',
            'selected_menu_id' => 'nullable|exists:site_menus,id',
        ]);

        // Generate Slug
        $slug = Str::slug($request->title);
        if (SitePage::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        // Detecta se o conteúdo é do Craft.js (tem chave ROOT) para limpar HTML legado
        $isCraftContent = $this->isCraftJson($request->content_components);

        $page = SitePage::create([
            'site_url_submenu_id' => $request->site_url_submenu_id,
            'title' => $request->title,
            'slug' => $slug,
            // Para páginas Craft, HTML/CSS ficam nulos; para legado, mantém
            'content' => $isCraftContent ? null : $request->content_html,
            'content_html' => $isCraftContent ? null : $request->content_html,
            'content_css' => $isCraftContent ? null : $request->content_css,
            'content_components' => $request->content_components ? json_decode($request->content_components) : null,
            'status' => $request->status ?? true,
            'has_sidebar' => $request->has_sidebar ?? false,
            'sidebar_content' => $request->sidebar_content ? json_decode($request->sidebar_content) : null,
            'selected_menu_id' => $request->selected_menu_id,
        ]);

        // Update Menu Item URL
        $item = SiteUrlSubmenu::find($request->site_url_submenu_id);
        $item->update(['url' => '/' . $slug]);

        Cache::flush();

        $menuId = $item->site_submenu?->site_menu_id;

        if ($menuId) {
            return redirect()->route('menus.edit', $menuId)
                ->with('success', 'Página criada com sucesso.');
        }

        return redirect()->route('menus.index')
            ->with('success', 'Página criada com sucesso.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $page = SitePage::with('menu_item')->findOrFail($id);

        return Inertia::render('Admin/Pages/Editor', [
            'item' => $page->menu_item,
            'page' => $page,
            'menus' => SiteMenu::where('status', true)->get(['id', 'name']),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $page = SitePage::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content_html' => 'nullable|string',
            'content_css' => 'nullable|string',
            'content_components' => 'nullable|string', // JSON string
            'status' => 'boolean',
            'has_sidebar' => 'boolean',
            'sidebar_content' => 'nullable|string', // JSON string
            'selected_menu_id' => 'nullable|exists:site_menus,id',
        ]);
        
        $isCraftContent = $this->isCraftJson($request->content_components);

        $page->update([
            'title' => $request->title,
            // Para páginas Craft, limpa HTML/CSS legados
            'content' => $isCraftContent ? null : ($request->content_html ?? $page->content),
            'content_html' => $isCraftContent ? null : $request->content_html,
            'content_css' => $isCraftContent ? null : $request->content_css,
            'content_components' => $request->content_components ? json_decode($request->content_components) : null,
            'status' => $request->status,
            'has_sidebar' => $request->has_sidebar,
            'sidebar_content' => $request->sidebar_content ? json_decode($request->sidebar_content) : null,
            'selected_menu_id' => $request->selected_menu_id,
        ]);

        Cache::flush();

        $menuId = $page->menu_item?->site_submenu?->site_menu_id;

        if ($menuId) {
            return redirect()->route('menus.edit', $menuId)
                ->with('success', 'Página atualizada com sucesso.');
        }

        return redirect()->route('menus.index')
            ->with('success', 'Página atualizada com sucesso. (Menu pai não encontrado)');
    }

    /**
     * Verifica se um JSON serializado pertence ao Craft.js.
     * O Craft.js sempre gera um nó "ROOT" na raiz do JSON.
     */
    private function isCraftJson(?string $json): bool
    {
        if (!$json) return false;
        $decoded = json_decode($json, true);
        return is_array($decoded) && array_key_exists('ROOT', $decoded);
    }
}
