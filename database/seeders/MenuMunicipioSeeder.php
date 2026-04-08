<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuMunicipioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Main Menu: O Município
        $menuId = Str::uuid();
        DB::table('site_menus')->insert([
            'id' => $menuId,
            'name' => 'O Município',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Submenus
        $submenus = [
            'Geral' => [ // 1st Column
                'items' => [
                    'História do Município',
                    'Dados do Município',
                    'Símbolos do Município',
                    'Galeria de Prefeitos',
                    'Servidores',
                    'Projetos'
                ]
            ],
            'Atrações Turísticas' => [ // 2nd Column
                'items' => [
                    'Campings',
                    'Hoteis',
                    'Pontos Turísticos'
                ]
            ],
            'Serviços' => [ // 3rd Column
                'items' => [
                    'Serviços ao Cidadão',
                    'Serviços ao Empreendedor',
                    'Serviços ao Estudante',
                    'Serviços ao Servidor Público'
                ]
            ]
        ];

        foreach ($submenus as $submenuName => $data) {
            $submenuId = Str::uuid();
            DB::table('site_submenus')->insert([
                'id' => $submenuId,
                'menu_id' => $menuId,
                'name' => $submenuName,
                'url' => '#',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $position = 0;
            foreach ($data['items'] as $itemName) {
                DB::table('site_url_submenus')->insert([
                    'id' => Str::uuid(),
                    'submenu_id' => $submenuId,
                    'name' => $itemName,
                    'url' => '/o-municipio/' . Str::slug($submenuName) . '/' . Str::slug($itemName),
                    'position' => ++$position,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
