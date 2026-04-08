<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AuthenticatedSessionController::class, 'create'])
    ->name('login');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->name('login.store');

Route::get('/prefeitura', [\App\Http\Controllers\SiteController::class, 'home'])->name('site.home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('Dashboard');
    })->name('dashboard');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('users', \App\Http\Controllers\UserController::class)->middleware(['role:Admin']);
    Route::post('/departments/scrape', [\App\Http\Controllers\DepartmentController::class, 'scrape'])->name('departments.scrape')->middleware(['role:Admin']);
    Route::resource('departments', \App\Http\Controllers\DepartmentController::class)->middleware(['role:Admin']);
    Route::resource('menus', \App\Http\Controllers\MenuController::class)->middleware(['role:Admin']);

    // Submenus & Items Management (Admin)
    Route::middleware(['role:Admin'])->group(function () {
        Route::post('/menus/{menu}/submenus', [\App\Http\Controllers\SubmenuController::class, 'store'])->name('submenus.store');
        Route::put('/submenus/{submenu}', [\App\Http\Controllers\SubmenuController::class, 'update'])->name('submenus.update');
        Route::delete('/submenus/{submenu}', [\App\Http\Controllers\SubmenuController::class, 'destroy'])->name('submenus.destroy');

        Route::post('/submenus/{submenu}/items', [\App\Http\Controllers\MenuItemController::class, 'store'])->name('menu-items.store');
        Route::put('/menu-items/{item}', [\App\Http\Controllers\MenuItemController::class, 'update'])->name('menu-items.update');
        Route::delete('/menu-items/{item}', [\App\Http\Controllers\MenuItemController::class, 'destroy'])->name('menu-items.destroy');
    });

    Route::resource('pages', \App\Http\Controllers\Admin\PageController::class)->middleware(['role:Admin']);
    Route::post('/upload', [\App\Http\Controllers\Admin\UploadController::class, 'store'])->name('upload.store')->middleware(['role:Admin']);

    Route::get('/audit', [\App\Http\Controllers\AuditController::class, 'index'])->name('audit.index')->middleware(['role:Admin']); // Audit Log
    Route::resource('editors', \App\Http\Controllers\EditorController::class)->middleware(['role:Gestor']);
    Route::resource('sections', \App\Http\Controllers\SectionController::class)->middleware(['role:Admin|Gestor']);

    // Subsection Management
    Route::middleware(['role:Admin|Gestor'])->group(function () {
        Route::get('/sections/{section}/manage', [\App\Http\Controllers\SubsectionController::class, 'index'])->name('subsections.index');
        Route::post('/sections/{section}/subsections', [\App\Http\Controllers\SubsectionController::class, 'store'])->name('subsections.store');
        Route::post('/subsections/{subsection}/assign', [\App\Http\Controllers\SubsectionController::class, 'assignWriter'])->name('subsections.assign');
        Route::delete('/subsections/{subsection}/remove', [\App\Http\Controllers\SubsectionController::class, 'removeWriter'])->name('subsections.remove');
    });

    // PPA - Plano Plurianual
    Route::middleware(['role:Admin|Gestor'])->prefix('transparencia')->group(function () {
        Route::resource('ppa', \App\Http\Controllers\Ppa\PpaController::class);
        Route::resource('programas', \App\Http\Controllers\Ppa\ProgramaController::class);
        Route::resource('acoes', \App\Http\Controllers\Ppa\AcaoController::class)->except(['index', 'show']);
        Route::resource('indicadores', \App\Http\Controllers\Ppa\IndicadorController::class)->except(['index', 'show']);

        // Endpoint AJAX para subfuncoes
        Route::get('/api/funcoes/{codigo}/subfuncoes', [\App\Http\Controllers\Ppa\FuncaoController::class, 'subfuncoes'])->name('funcoes.subfuncoes');

        // Scraper de PPA Externo
        Route::post('/ppa/import-from-url', [\App\Http\Controllers\Ppa\PpaScraperController::class, 'importFromUrl'])->name('ppa.import-from-url');
        Route::post('/ppa/import-confirm', [\App\Http\Controllers\Ppa\PpaScraperController::class, 'importConfirm'])->name('ppa.import-confirm');
        Route::get('/ppa/scraper-logs', [\App\Http\Controllers\Ppa\PpaScraperController::class, 'logs'])->name('ppa.scraper-logs');

        // Scraper de PPA do Portal QualitySistemas
        Route::post('/ppa/import-from-portal', [\App\Http\Controllers\Ppa\PpaPortalScraperController::class, 'importFromPortal'])->name('ppa.import-from-portal');
        Route::post('/ppa/import-from-portal-confirm', [\App\Http\Controllers\Ppa\PpaPortalScraperController::class, 'importFromPortalConfirm'])->name('ppa.import-from-portal-confirm');

        // Scraper de Metas Financeiras do PPA (Programas)
        Route::post('/programas/import-from-portal', [\App\Http\Controllers\Ppa\PpaMetasFinanceirasScraperController::class, 'importFromPortal'])->name('programas.import-from-portal');
        Route::post('/programas/import-from-portal-confirm', [\App\Http\Controllers\Ppa\PpaMetasFinanceirasScraperController::class, 'importFromPortalConfirm'])->name('programas.import-from-portal-confirm');
        Route::get('/programas/get-ppas', [\App\Http\Controllers\Ppa\PpaMetasFinanceirasScraperController::class, 'getPpas'])->name('programas.get-ppas');

        // LDO - Lei de Diretrizes Orçamentárias (Art. 4º LRF / TCE-MS 88/2018)
        Route::resource('ldo', \App\Http\Controllers\Ldo\LdoController::class);
        Route::post('/ldo/metas-fiscais', [\App\Http\Controllers\Ldo\LdoController::class, 'salvarMetasFiscais'])->name('ldo.metas-fiscais.store');
        Route::post('/ldo/riscos-fiscais', [\App\Http\Controllers\Ldo\LdoController::class, 'salvarRiscosFiscais'])->name('ldo.riscos-fiscais.store');
        Route::post('/ldo/audiencias', [\App\Http\Controllers\Ldo\LdoController::class, 'salvarAudiencias'])->name('ldo.audiencias.store');
        Route::post('/ldo/metas-prioridades', [\App\Http\Controllers\Ldo\LdoController::class, 'salvarMetasPrioridades'])->name('ldo.metas-prioridades.store');
        Route::get('/ldo/{ldo}/exportar-esfinge', [\App\Http\Controllers\Ldo\LdoController::class, 'exportarEsfinge'])->name('ldo.exportar-esfinge');

        // Scraper de LDO do Portal QualitySistemas
        Route::post('/ldo/import-from-portal', [\App\Http\Controllers\Ldo\LdoScraperController::class, 'importFromPortal'])->name('ldo.import-from-portal');
        Route::post('/ldo/import-from-portal-confirm', [\App\Http\Controllers\Ldo\LdoScraperController::class, 'importFromPortalConfirm'])->name('ldo.import-from-portal-confirm');
        Route::get('/ldo/scraper-logs', [\App\Http\Controllers\Ldo\LdoScraperController::class, 'logs'])->name('ldo.scraper-logs');

        // Scraper de Metas e Prioridades do LDO
        Route::post('/ldo/metas-prioridades/import-from-portal', [\App\Http\Controllers\Ldo\LdoMetasPrioridadesScraperController::class, 'importFromPortal'])->name('ldo.metas-prioridades.import-from-portal');
        Route::post('/ldo/metas-prioridades/import-from-portal-confirm', [\App\Http\Controllers\Ldo\LdoMetasPrioridadesScraperController::class, 'importFromPortalConfirm'])->name('ldo.metas-prioridades.import-from-portal-confirm');

        // Metas e Prioridades - Lista e Gestão
        Route::resource('ldo-metas-prioridades', \App\Http\Controllers\Ldo\LdoMetaPrioridadeController::class);

        // LOA - Lei Orçamentária Anual (Art. 165 §5º CF/88, Art. 5º-9º LRF, e-Sfinge TCE-MS)
        Route::resource('loa', \App\Http\Controllers\Loa\LoaController::class);
        Route::post('/loa/receitas', [\App\Http\Controllers\Loa\LoaController::class, 'salvarReceitas'])->name('loa.receitas.store');
        Route::post('/loa/dotacoes', [\App\Http\Controllers\Loa\LoaController::class, 'salvarDotacoes'])->name('loa.dotacoes.store');
        Route::post('/loa/compatibilidade', [\App\Http\Controllers\Loa\LoaController::class, 'salvarCompatibilidade'])->name('loa.compatibilidade.store');
        Route::post('/loa/reserva', [\App\Http\Controllers\Loa\LoaController::class, 'salvarReserva'])->name('loa.reserva.store');
        Route::get('/loa/{loa}/exportar-esfinge', [\App\Http\Controllers\Loa\LoaController::class, 'exportarEsfinge'])->name('loa.exportar-esfinge');
    });
});

// fixed Pages fundamental
Route::get('/acesso-a-informacao', [\App\Http\Controllers\SiteController::class, 'acessoInformacao'])->name('site.acessoInformacao');
Route::get('/solicitacao-informacao', [\App\Http\Controllers\SiteController::class, 'solicitacaoInformacao'])->name('site.solicitacaoInformacao');
Route::post('/solicitacao-informacao', [\App\Http\Controllers\SiteController::class, 'solicitacaoStore'])->name('site.solicitacaoInformacao.store');
Route::get('/ouvidoria', [\App\Http\Controllers\SiteController::class, 'ouvidoria'])->name('site.ouvidoria');
Route::post('/ouvidoria', [\App\Http\Controllers\SiteController::class, 'ouvidoriaStore'])->name('site.ouvidoria.store');
Route::get('/transparencia', [\App\Http\Controllers\SiteController::class, 'transparencia'])->name('site.transparencia');

// Dynamic Page Route (Public)
Route::get('/{slug}', [\App\Http\Controllers\SiteController::class, 'page'])->where('slug', '.*')->name('site.page');
