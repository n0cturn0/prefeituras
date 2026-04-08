<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\SolicitacaoInformacaoRequest;
use App\Http\Requests\OuvidoriaRequest;
use App\Models\SolicitacaoInformacao;
use App\Models\Ouvidoria;
use App\Models\Protocolo;
use App\Models\ProtocoloOuvidoria;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
        $pageQuery = \App\Models\SitePage::where('status', true)
            ->with(['selectedMenu.submenus' => function($q) {
                $q->where('status', true)
                  ->with(['items' => function($q2) {
                      $q2->where('status', true)->orderBy('position');
                  }]);
            }]);

        // First try to find by slug
        $page = (clone $pageQuery)->where('slug', $slug)->first();

        // If not found, try finding by menu URL (with leading slash)
        if (!$page) {
            $urlToMatch = '/' . ltrim($slug, '/');
            $menuItem = \App\Models\SiteUrlSubmenu::where('url', $urlToMatch)->first();
            if ($menuItem && $menuItem->page) {
                $page = $menuItem->page()->where('status', true)->with($pageQuery->getEagerLoads())->first();
            }
        }

        if (!$page) {
            abort(404);
        }

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

    public function acessoInformacao()
    {
        $menus = $this->getSharedMenus();

        return Inertia::render('Site/PortalDaTransparencia/AcessoInformacao', array_merge([
            // Dados específicos da página podem vir aqui
        ], $menus));
    }

    public function solicitacaoInformacao()
    {
        $menus = $this->getSharedMenus();

        return Inertia::render('Site/PortalDaTransparencia/SolicitacaoInformacao', array_merge([
            // Dados específicos da página podem vir aqui
        ], $menus));
    }

    public function solicitacaoStore(SolicitacaoInformacaoRequest $request)
    {
        DB::beginTransaction();
        try {
            $solicitacao = SolicitacaoInformacao::create(array_merge(
                $request->validated(),
                [
                    'ip_address' => $request->ip(),
                    'data_recebimento' => now(),
                ]
            ));

            // Gerar número de protocolo: AAAAMMDD-XXXX
            $datePart = now()->format('Ymd');
            $countToday = Protocolo::where('numero', 'like', $datePart . '-%')->count() + 1;
            $numeroProtocolo = $datePart . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);

            $solicitacao->protocolo()->create([
                'numero' => $numeroProtocolo,
            ]);

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Solicitação enviada com sucesso!',
                'protocolo' => $numeroProtocolo,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Ocorreu um erro ao processar sua solicitação: ' . $e->getMessage()]);
        }
    }

    public function ouvidoria()
    {
        $menus = $this->getSharedMenus();

        return Inertia::render('Site/PortalDaTransparencia/Ouvidoria', array_merge([
            // Dados específicos
        ], $menus));
    }

    public function ouvidoriaStore(OuvidoriaRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $data['ip_address'] = $request->ip();
            $data['data_recebimento'] = now();

            $ouvidoria = Ouvidoria::create($data);

            // Gerar Protocolo Ouvidoria (Modelo: OUV-AAAAMMDD-XXXX)
            $date = now()->format('Ymd');
            $count = ProtocoloOuvidoria::whereDate('created_at', now()->toDateString())->count() + 1;
            $numeroProtocolo = 'OUV-' . $date . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            ProtocoloOuvidoria::create([
                'numero' => $numeroProtocolo,
                'ouvidoria_id' => $ouvidoria->id,
            ]);

            DB::commit();

            return back()->with([
                'success' => 'Sua manifestação foi registrada com sucesso!',
                'protocolo' => $numeroProtocolo,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erro ao salvar manifestação: ' . $e->getMessage()]);
        }
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
