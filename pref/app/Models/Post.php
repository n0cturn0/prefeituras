<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Post extends Model
{
    use LogsActivity; // Registra quem editou o post automaticamente

    public function getActivitylogOptions(): LogOptions {
        return LogOptions::defaults()->logAll();
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function department() {
        return $this->belongsTo(Departament::class);
    }
}
