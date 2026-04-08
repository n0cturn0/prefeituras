<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Handle the incoming file upload.
     */
    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'image|max:5120', // Max 5MB per image
        ]);

        $urls = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                // Store in public disk
                $path = $file->store('uploads/cms', 'public');
                
                // Keep the URL
                $urls[] = Storage::url($path);
            }
        }

        // GrapesJS expects: { data: [ 'url1', 'url2', ... ] }
        return response()->json([
            'data' => $urls
        ]);
    }
}
