<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Subsection extends Model
{
    use HasUuids, \App\Traits\Auditable;

    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'section_id',
        'name',
        'status',
        'content_type',
        'content_id'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'uuid');
    }

    public function content()
    {
        return $this->morphTo();
    }

    public function writers()
    {
        return $this->belongsToMany(User::class, 'subsection_user', 'subsection_uuid', 'user_id');
    }
}
