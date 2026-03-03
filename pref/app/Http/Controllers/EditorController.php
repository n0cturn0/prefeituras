<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class EditorController extends Controller
{
    /**
     * Display a listing of the editors (Redators) in the manager's department.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Safety check: ensure only Gestor accesses this (middleware handles it too, but good to be safe)
        if (!$user->hasRole('Gestor')) {
            abort(403, 'Acesso restrito a gestores.');
        }

        $editors = User::role('Redator')
            ->where('department_id', $user->department_id)
            ->get();

        return Inertia::render('Editors/Index', [
            'editors' => $editors
        ]);
    }

    /**
     * Show the form for creating a new editor.
     */
    public function create()
    {
        $departmentName = auth()->user()->department->name ?? 'seu departamento';
        
        return Inertia::render('Editors/Create', [
            'departmentName' => $departmentName
        ]);
    }

    /**
     * Store a newly created editor in storage.
     */
    public function store(Request $request)
    {
        $manager = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $editor = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department_id' => $manager->department_id, // Force manager's department
            'is_active' => true,
        ]);

        $editor->assignRole('Redator');

        return redirect()->route('editors.index')->with('success', 'Redator criado com sucesso!');
    }

    /**
     * Show the form for editing the specified editor.
     */
    public function edit(string $id)
    {
        $manager = auth()->user();
        
        $editor = User::where('id', $id)
            ->where('department_id', $manager->department_id)
            ->role('Redator')
            ->firstOrFail();

        return Inertia::render('Editors/Edit', [
            'editor' => $editor,
            'departmentName' => $manager->department->name ?? 'seu departamento'
        ]);
    }

    /**
     * Update the specified editor in storage.
     */
    public function update(Request $request, string $id)
    {
        $manager = auth()->user();

        $editor = User::where('id', $id)
            ->where('department_id', $manager->department_id)
            ->role('Redator')
            ->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $editor->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'boolean'
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];
        
        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->is_active;
        }

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $editor->update($updateData);

        return redirect()->route('editors.index')->with('success', 'Redator atualizado com sucesso!');
    }

    /**
     * Remove the specified editor from storage.
     */
    public function destroy(string $id)
    {
        $manager = auth()->user();

        $editor = User::where('id', $id)
            ->where('department_id', $manager->department_id)
            ->role('Redator')
            ->firstOrFail();

        $editor->delete();

        return redirect()->route('editors.index')->with('success', 'Redator removido com sucesso!');
    }
}
