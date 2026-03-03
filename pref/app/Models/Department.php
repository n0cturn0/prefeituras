<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use \App\Traits\Auditable;

    // Explicitly define table name if it doesn't follow convention (optional but good for safety since migration was named 'departments')
    protected $table = 'departments';

    protected $fillable = ['name', 'slug', 'acronym', 'description'];

    public function users() {
        return $this->hasMany(User::class);
    }

    public function posts() {
        return $this->hasMany(Post::class);
    }
}
