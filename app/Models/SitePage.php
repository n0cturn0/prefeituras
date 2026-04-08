<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SitePage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'site_url_submenu_id',
        'title',
        'slug',
        'content',
        'content_html',
        'content_css',
        'content_components',
        'status',
        'has_sidebar',
        'sidebar_content',
        'selected_menu_id',
    ];

    protected $casts = [
        'status' => 'boolean',
        'has_sidebar' => 'boolean',
        'sidebar_content' => 'array',
        'content_components' => 'array',
    ];

    public function menu_item()
    {
        return $this->belongsTo(SiteUrlSubmenu::class, 'site_url_submenu_id');
    }

    public function selectedMenu()
    {
        return $this->belongsTo(SiteMenu::class, 'selected_menu_id');
    }
}
