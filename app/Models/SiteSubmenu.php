<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSubmenu extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    public function items()
    {
        return $this->hasMany(SiteUrlSubmenu::class, 'submenu_id');
    }
}
