<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogSuccessfulLogin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event)
    {
        activity()
            ->performedOn($event->user)
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'type' => 'auth',
            ])
            ->log('login');
        
        // Also update last_login_at column if we want, but Activity Log is enough for "History"
        // But the requirement mentioned "Add a 'Login History' functionality", suggesting a separate log or filter.
        // We will use the activity log with filter 'login'.
    }
}
