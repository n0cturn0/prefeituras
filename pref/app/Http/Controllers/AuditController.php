<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

use Illuminate\Support\Facades\Gate;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('view-logs'); // Ensure user has permission

        $query = Activity::with('causer', 'subject')
            ->latest();

        // Filters
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        if ($request->filled('subject_type')) {
            // Allow simplified filter "User", "Section" mapped to full class
            // or just searching string
            $query->where('subject_type', 'like', '%' . $request->subject_type . '%');
        }

        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        $logs = $query->paginate(20)->through(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => class_basename($activity->subject_type),
                'subject_id' => $activity->subject_id,
                'causer' => $activity->causer ? $activity->causer->name : 'Sistema',
                'created_at' => $activity->created_at->format('d/m/Y H:i:s'),
                'properties' => $activity->properties,
                'ip' => $activity->properties['ip'] ?? '-',
                'browser' => $this->parseUserAgent($activity->properties['user_agent'] ?? ''),
            ];
        });

        return Inertia::render('Audit/Index', [
            'logs' => $logs,
            'filters' => $request->only(['causer_id', 'subject_type', 'event']),
        ]);
    }

    private function parseUserAgent($userAgent)
    {
        if (empty($userAgent)) return 'Desconhecido';

        $os = 'Unknown OS';
        if (preg_match('/windows/i', $userAgent)) $os = 'Windows';
        elseif (preg_match('/linux/i', $userAgent)) $os = 'Linux';
        elseif (preg_match('/macintosh|mac os x/i', $userAgent)) $os = 'Mac OS';
        elseif (preg_match('/android/i', $userAgent)) $os = 'Android';
        elseif (preg_match('/iphone/i', $userAgent)) $os = 'iOS';

        $browser = 'Unknown Browser';
        if (preg_match('/chrome/i', $userAgent) && !preg_match('/edg/i', $userAgent)) $browser = 'Chrome';
        elseif (preg_match('/firefox/i', $userAgent)) $browser = 'Firefox';
        elseif (preg_match('/safari/i', $userAgent) && !preg_match('/chrome/i', $userAgent)) $browser = 'Safari';
        elseif (preg_match('/edg/i', $userAgent)) $browser = 'Edge';
        
        return "$browser / $os";
    }
}
