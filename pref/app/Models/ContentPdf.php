<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ContentPdf extends Model
{
    use HasUuids, \App\Traits\Auditable;

    protected $table = 'content_pdfs';
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'subtitle',
        'file_path'
    ];

    public function subsection()
    {
        return $this->morphOne(Subsection::class, 'content');
    }
}
