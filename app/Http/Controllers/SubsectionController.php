<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Subsection;
use App\Models\ContentPdf;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class SubsectionController extends Controller
{
    /**
     * Display a listing of the subsections for a specific section.
     */
    public function index(string $section_uuid)
    {
        $user = auth()->user();
        
        $section = Section::where('uuid', $section_uuid)->firstOrFail();

        // Authorization: Check Policy manually or rely on Middleware. 
        // For Manager, strictly check department ownership
        if (!$user->hasRole('Admin') && $section->department_id !== $user->department_id) {
            abort(403, 'Acesso não autorizado a esta seção.');
        }

        $subsections = $section->subsections()->with(['content', 'writers'])->latest()->get();

        // Potential writers: Users in same department with 'Redator' role
        $availableWriters = User::role('Redator')
            ->where('department_id', $section->department_id)
            ->get()
            ->map(function ($writer) {
                return [
                    'id' => $writer->id,
                    'name' => $writer->name,
                    'email' => $writer->email
                ];
            })
            ->values(); // Ensure it's a JSON array

        return Inertia::render('Subsections/Index', [
            'section' => $section,
            'subsections' => $subsections->values(), // Ensure array
            'availableWriters' => $availableWriters
        ]);
    }

    /**
     * Store a newly created subsection.
     */
    public function store(Request $request, string $section_uuid)
    {
        $user = auth()->user();
        $section = Section::where('uuid', $section_uuid)->firstOrFail();

        if (!$user->hasRole('Admin') && $section->department_id !== $user->department_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pdf_with_title', // Extendable
            // PDF specific
            'title' => 'required_if:type,pdf_with_title|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'file' => 'required_if:type,pdf_with_title|file|mimes:pdf|max:10240', // 10MB
        ]);

        // 1. Create Content based on Type
        $content = null;

        if ($request->type === 'pdf_with_title') {
            $path = $request->file('file')->store('subsection_pdfs', 'public');
            
            $content = ContentPdf::create([
                'title' => $request->title,
                'subtitle' => $request->subtitle,
                'file_path' => $path
            ]);
        }

        // 2. Create Subsection linked to Section and Content
        $subsection = $section->subsections()->create([
            'name' => $request->name,
            'status' => true,
            'content_type' => get_class($content),
            'content_id' => $content->uuid,
        ]);

        return redirect()->back()->with('success', 'Subseção criada com sucesso!');
    }

    /**
     * Assign a writer to a subsection.
     */
    public function assignWriter(Request $request, string $subsection_uuid)
    {
        $user = auth()->user();
        $subsection = Subsection::with('section')->where('uuid', $subsection_uuid)->firstOrFail();
        
        // Auth check
        if (!$user->hasRole('Admin') && $subsection->section->department_id !== $user->department_id) {
            abort(403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // Sync without detaching? Or just attach? Unique constraint handles duplicate.
        // Use syncWithoutDetaching to be safe or just attach try/catch
        $subsection->writers()->syncWithoutDetaching([$request->user_id]);

        return redirect()->back()->with('success', 'Redator atribuído com sucesso!');
    }

    /**
     * Remove a writer from a subsection.
     */
    public function removeWriter(Request $request, string $subsection_uuid)
    {
        $user = auth()->user();
        $subsection = Subsection::with('section')->where('uuid', $subsection_uuid)->firstOrFail();
        
        if (!$user->hasRole('Admin') && $subsection->section->department_id !== $user->department_id) {
            abort(403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $subsection->writers()->detach($request->user_id);

        return redirect()->back()->with('success', 'Redator removido com sucesso!');
    }
}
