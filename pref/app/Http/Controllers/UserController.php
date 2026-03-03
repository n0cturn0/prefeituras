<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $query = User::with(['roles', 'department']);

        // If user is not Admin, filter by their department
        if (!$user->hasRole('Admin')) {
            $query->where('department_id', $user->department_id);
        }

        return Inertia::render('Users/Index', [
            'users' => $query->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Managers can only create users in their department, so we can pass a flag or pre-select details
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
            'departments' => Department::all(),
            'auth_department_id' => auth()->user()->department_id,
            'is_admin' => auth()->user()->hasRole('Admin')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $authUser = auth()->user();
        $isAdmin = $authUser->hasRole('Admin');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'department_id' => $isAdmin ? 'required|exists:departments,id' : 'nullable', // Manager uses their own
            'role' => 'required|exists:roles,name',
        ]);

        // Security: Prevent Manager from creating Admin
        if (!$isAdmin && $request->role === 'Admin') {
            abort(403, 'Você não pode criar administradores.');
        }

        Department::findOrFail($isAdmin ? $request->department_id : $authUser->department_id);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'department_id' => $isAdmin ? $request->department_id : $authUser->department_id,
            'is_active' => true,
        ]);

        $user->assignRole($request->role);

        return redirect()->route('users.index');
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
        $user = User::with(['roles', 'department'])->findOrFail($id);
        
        // Authorization check: Managers can only edit users in their dept
        $authUser = auth()->user();
        if (!$authUser->hasRole('Admin') && $user->department_id !== $authUser->department_id) {
            abort(403);
        }

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(),
            'departments' => Department::all(),
            'is_admin' => $authUser->hasRole('Admin')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();
        $isAdmin = $authUser->hasRole('Admin');

        // Authorization check
        if (!$isAdmin && $user->department_id !== $authUser->department_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'department_id' => $isAdmin ? 'required|exists:departments,id' : 'nullable',
            'role' => 'required|exists:roles,name',
            'is_active' => 'required|boolean',
        ]);

        // Security: Prevent Manager from promoting to Admin or taking over Admin account
        if (!$isAdmin) {
             if ($request->role === 'Admin') {
                abort(403, 'Você não pode criar administradores.');
             }
             if ($user->hasRole('Admin')) {
                 abort(403, 'Você não pode editar administradores.');
             }
        }

        \Illuminate\Support\Facades\Log::info('Updating User', [
            'user_id' => $user->id,
            'is_admin' => $isAdmin,
            'request_dept' => $request->department_id,
            'current_dept' => $user->department_id,
            'admin_dept' => $authUser->department_id,
            'has_password' => $request->has('password'),
            'filled_password' => $request->filled('password'),
            'password_length' => strlen($request->password ?? ''),
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'department_id' => $isAdmin ? $request->department_id : $user->department_id, // Keep existing if not admin
            'is_active' => $request->is_active,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => $request->password,
            ]);
        }

        $user->syncRoles([$request->role]);

        return redirect()->route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
