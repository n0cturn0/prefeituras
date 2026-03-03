<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SiteUrlSubmenu extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'site_submenu_id', 'name', 'url', 'status', 'position'];

    public function page()
    {
        return $this->hasOne(SitePage::class, 'site_url_submenu_id');
    }

    public function site_submenu()
    {
        return $this->belongsTo(SiteSubmenu::class, 'site_submenu_id');
    }
}
