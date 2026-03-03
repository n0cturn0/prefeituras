<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function home()
    {
        $departmentsMenu = \App\Models\SiteMenu::where('name', 'Departamentos')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        $publicacoesMenu = \App\Models\SiteMenu::where('name', 'Publicações Oficiais')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        $municipioMenu = \App\Models\SiteMenu::where('name', 'O Município')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        $informativosMenu = \App\Models\SiteMenu::where('name', 'Informativos')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        $transparenciaMenu = \App\Models\SiteMenu::where('name', 'Transparência')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        $contatosMenu = \App\Models\SiteMenu::where('name', 'Contatos')
            ->where('status', true)
            ->with(['submenus' => function($query) {
                $query->where('status', true)
                      ->orderBy('created_at')
                      ->with(['items' => function($q) {
                          $q->where('status', true)
                            ->orderBy('position');
                      }]);
            }])
            ->first();

        return inertia('Site/Home', [
            'departmentsMenu' => $departmentsMenu,
            'publicacoesMenu' => $publicacoesMenu,
            'municipioMenu' => $municipioMenu,
            'informativosMenu' => $informativosMenu,
            'transparenciaMenu' => $transparenciaMenu,
            'contatosMenu' => $contatosMenu
        ]);
    }

    public function page($slug)
    {
        $page = \App\Models\SitePage::where('slug', $slug)
            ->where('status', true)
            ->with(['selectedMenu.submenus' => function($q) {
                $q->where('status', true)
                  ->with(['items' => function($q2) {
                      $q2->where('status', true)->orderBy('position');
                  }]);
            }])
            ->firstOrFail();

        // Re-use menu fetching logic (shared layout data) or handle via middleware/shared props
        // For now, simpler to share via HandleInertiaRequests or just rely on shared props if layout handles it
        // But Header needs menus. We should probably share menus globally or re-fetch here.
        // I'll re-fetch briefly or assume Header fetches its own (it doesn't, it takes props).
        // Best practice: Middleware. For now: Refactor fetch to private method or just copy-paste for speed as requested.
        // Actually, let's make a private helper.
        
        $menus = $this->getSharedMenus();

        return Inertia::render('Site/Page', array_merge([
            'page' => $page
        ], $menus));
    }

    private function getSharedMenus()
    {
        // Replicating home fetching for Header
        $departmentsMenu = \App\Models\SiteMenu::where('name', 'Departamentos')->where('status', true)->with(['submenus' => function($q) { $q->where('status', true)->orderBy('created_at')->with(['items' => function($q2) { $q2->where('status', true)->orderBy('position'); }]); }])->first();
        $publicacoesMenu = \App\Models\SiteMenu::where('name', 'Publicações Oficiais')->where('status', true)->with(['submenus' => function($q) { $q->where('status', true)->orderBy('created_at')->with(['items' => function($q2) { $q2->where('status', true)->orderBy('position'); }]); }])->first();
        $municipioMenu = \App\Models\SiteMenu::where('name', 'O Município')->where('status', true)->with(['submenus' => function($q) { $q->where('status', true)->orderBy('created_at')->with(['items' => function($q2) { $q2->where('status', true)->orderBy('position'); }]); }])->first();
        $informativosMenu = \App\Models\SiteMenu::where('name', 'Informativos')->where('status', true)->with(['submenus' => function($query) { $query->where('status', true)->orderBy('created_at')->with(['items' => function($q) { $q->where('status', true)->orderBy('position'); }]); }])->first();
        $transparenciaMenu = \App\Models\SiteMenu::where('name', 'Transparência')->where('status', true)->with(['submenus.items' => function($q) { $q->where('status', true)->orderBy('position'); }])->first();
        $contatosMenu = \App\Models\SiteMenu::where('name', 'Contatos')->where('status', true)->with(['submenus.items' => function($q) { $q->where('status', true)->orderBy('position'); }])->first();

        return compact('departmentsMenu', 'publicacoesMenu', 'municipioMenu', 'informativosMenu', 'transparenciaMenu', 'contatosMenu');
    }
}
