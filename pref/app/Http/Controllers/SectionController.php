<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Authorization logic handled by Policy 'viewAny' check if needed, 
        // but typically better to filter query here
        
        $query = Section::with('department');

        if (!$user->hasRole('Admin')) {
            // Managers see only their department's sections
            $query->where('department_id', $user->department_id);
        }

        $sections = $query->latest()->get();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'can_create' => $user->hasRole('Admin') || $user->hasRole('Gestor'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();

        // Admin can choose department, Manager matches theirs
        $departments = $user->hasRole('Admin') ? Department::all() : [];
        $managerDepartment = $user->hasRole('Gestor') ? $user->department : null;

        return Inertia::render('Sections/Create', [
            'departments' => $departments,
            'managerDepartment' => $managerDepartment,
            'is_admin' => $user->hasRole('Admin')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $rules = [
            'name' => 'required|string|max:255',
            'status' => 'boolean',
        ];

        // If Admin, department_id is optional (can be global)
        if ($user->hasRole('Admin')) {
            $rules['department_id'] = 'nullable|exists:departments,id';
        }

        $request->validate($rules);

        Section::create([
            'name' => $request->name,
            'status' => $request->status,
            'department_id' => $user->hasRole('Admin') ? $request->department_id : $user->department_id,
        ]);

        return redirect()->route('sections.index')->with('success', 'Seção criada com sucesso!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section)
    {
        $user = auth()->user();
        
        // Authorization check
        if ($user->cannot('update', $section)) {
            abort(403);
        }

        $departments = $user->hasRole('Admin') ? Department::all() : [];
        
        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'departments' => $departments,
            'is_admin' => $user->hasRole('Admin'),
            'current_department_name' => $section->department->name ?? 'N/A'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Section $section)
    {
        $user = auth()->user();

        if ($user->cannot('update', $section)) {
            abort(403);
        }

        $rules = [
            'name' => 'required|string|max:255',
            'status' => 'boolean',
        ];

        if ($user->hasRole('Admin')) {
            $rules['department_id'] = 'nullable|exists:departments,id';
        }

        $request->validate($rules);

        $section->update([
            'name' => $request->name,
            'status' => $request->status,
            'department_id' => $user->hasRole('Admin') ? $request->department_id : $section->department_id,
        ]);

        return redirect()->route('sections.index')->with('success', 'Seção atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        $user = auth()->user();

        if ($user->cannot('delete', $section)) {
            abort(403);
        }

        $section->delete();

        return redirect()->route('sections.index')->with('success', 'Seção removida com sucesso!');
    }
}
