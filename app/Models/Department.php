<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use \App\Traits\Auditable;

    protected $table = 'departments';

    protected $fillable = [
        'parent_id',
        'is_root',
        'name',
        'slug',
        'acronym',
        'description',
        'gestor',
        'representante_gestor',
        'phone',
        'fax',
        'email',
        'site',
        'cep',
        'logradouro',
        'bairro',
        'horario_atendimento',
    ];

    protected $casts = [
        'is_root'              => 'boolean',
        'horario_atendimento'  => 'array',
    ];

    // ─── Relacionamentos hierárquicos ───────────────────────────────────────

    /**
     * Departamento/Secretaria pai (ex: Prefeitura → Secretaria pai de um Departamento)
     */
    public function parent()
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    /**
     * Filhos diretos (Secretarias/Departamentos vinculados a este nó)
     */
    public function children()
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    /**
     * Todos os descendentes recursivamente
     */
    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    // ─── Relacionamentos com outros modelos ────────────────────────────────

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
