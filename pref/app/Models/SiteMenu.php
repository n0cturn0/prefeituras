<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteMenu extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    public function submenus()
    {
        return $this->hasMany(SiteSubmenu::class, 'menu_id');
    }
}
