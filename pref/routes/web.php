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
});

// Dynamic Page Route (Public)
Route::get('/{slug}', [\App\Http\Controllers\SiteController::class, 'page'])->name('site.page');
